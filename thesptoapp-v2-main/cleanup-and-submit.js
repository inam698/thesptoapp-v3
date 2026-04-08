// Clean up old review submissions and submit Build 54 for Apple review
const jwt = require('jsonwebtoken');
const https = require('https');
const fs = require('fs');
const path = require('path');

const KEY_ID = 'X79F2H3QXT';
const ISSUER_ID = '3ddd637a-4279-41fa-8c12-672a3c557cba';
const APP_ID = '6755155637';
const VERSION_ID = '193a42ea-6826-4118-a8d2-d6483702e08c';
const KEY_PATH = path.join(__dirname, 'AuthKey_X79F2H3QXT.p8');

function createToken() {
  const privateKey = fs.readFileSync(KEY_PATH, 'utf8');
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign(
    { iss: ISSUER_ID, iat: now, exp: now + 1200, aud: 'appstoreconnect-v1' },
    privateKey,
    { algorithm: 'ES256', header: { alg: 'ES256', kid: KEY_ID, typ: 'JWT' } }
  );
}

function api(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const token = createToken();
    const req = https.request({
      hostname: 'api.appstoreconnect.apple.com',
      path: urlPath,
      method,
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(data || '{}') }); }
        catch { resolve({ status: res.statusCode, data }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  try {
    // Step 1: List all review submissions for the app
    console.log('1. Listing all review submissions...');
    const listRes = await api('GET', `/v1/reviewSubmissions?filter[app]=${APP_ID}&limit=10`);
    
    if (listRes.status !== 200) {
      console.log('   Failed:', listRes.status, JSON.stringify(listRes.data));
      return;
    }

    const submissions = listRes.data.data || [];
    console.log(`   Found ${submissions.length} submission(s):`);
    
    for (const sub of submissions) {
      const state = sub.attributes.state;
      console.log(`   - ID: ${sub.id}, State: ${state}, Platform: ${sub.attributes.platform}`);
    }

    // Step 2: Cancel/delete non-active submissions
    console.log('\n2. Cleaning up old submissions...');
    let cleaned = 0;
    
    for (const sub of submissions) {
      const state = sub.attributes.state;
      
      if (state === 'WAITING_FOR_REVIEW' || state === 'IN_REVIEW' || state === 'READY_FOR_REVIEW') {
        // Cancel active/ready submissions via PATCH
        console.log(`   Cancelling ${sub.id} (${state})...`);
        const cancelRes = await api('PATCH', `/v1/reviewSubmissions/${sub.id}`, {
          data: { type: 'reviewSubmissions', id: sub.id, attributes: { canceled: true } }
        });
        console.log(`   PATCH result: ${cancelRes.status}`);
        if (cancelRes.status !== 200) {
          console.log(`   Detail:`, JSON.stringify(cancelRes.data?.errors?.[0]?.detail || cancelRes.data));
          // Try DELETE as fallback
          const delRes = await api('DELETE', `/v1/reviewSubmissions/${sub.id}`);
          console.log(`   DELETE fallback: ${delRes.status}`);
        }
        cleaned++;
      } else if (state === 'UNRESOLVED_ISSUES') {
        // Also try to cancel unresolved issues
        console.log(`   Cancelling ${sub.id} (${state})...`);
        const cancelRes = await api('PATCH', `/v1/reviewSubmissions/${sub.id}`, {
          data: { type: 'reviewSubmissions', id: sub.id, attributes: { canceled: true } }
        });
        console.log(`   PATCH result: ${cancelRes.status}`);
        cleaned++;
      } else if (state === 'CANCELING') {
        console.log(`   ${sub.id} is already canceling, waiting...`);
      } else {
        console.log(`   ${sub.id} is ${state} - skipping`);
      }
    }
    console.log(`   Cleaned ${cleaned} submission(s)`);

    // Step 3: Wait a moment then retry submission
    console.log('\n3. Waiting 3 seconds then creating new review submission...');
    await new Promise(r => setTimeout(r, 3000));

    const newSubRes = await api('POST', '/v1/reviewSubmissions', {
      data: {
        type: 'reviewSubmissions',
        attributes: { platform: 'IOS' },
        relationships: { app: { data: { type: 'apps', id: APP_ID } } }
      }
    });

    if (newSubRes.status !== 201 && newSubRes.status !== 200) {
      console.log(`   Create failed: ${newSubRes.status}`);
      console.log(JSON.stringify(newSubRes.data?.errors || newSubRes.data, null, 2));
      
      // If still limit exceeded, try to forcefully delete all
      if (JSON.stringify(newSubRes.data).includes('CONCURRENT_REVIEW_SUBMISSION_LIMIT')) {
        console.log('\n   Still at limit. Force-deleting ALL submissions...');
        for (const sub of submissions) {
          console.log(`   Force delete ${sub.id}...`);
          const d1 = await api('DELETE', `/v1/reviewSubmissions/${sub.id}`);
          console.log(`   DELETE: ${d1.status}`);
          const d2 = await api('PATCH', `/v1/reviewSubmissions/${sub.id}`, {
            data: { type: 'reviewSubmissions', id: sub.id, attributes: { canceled: true } }
          });
          console.log(`   CANCEL: ${d2.status}`);
        }
        
        console.log('\n   Waiting 5 seconds for cleanup...');
        await new Promise(r => setTimeout(r, 5000));
        
        // Retry
        const retryRes = await api('POST', '/v1/reviewSubmissions', {
          data: {
            type: 'reviewSubmissions',
            attributes: { platform: 'IOS' },
            relationships: { app: { data: { type: 'apps', id: APP_ID } } }
          }
        });
        
        if (retryRes.status === 201 || retryRes.status === 200) {
          const sid = retryRes.data.data.id;
          console.log(`\n   Created review submission: ${sid}`);
          await submitReview(sid);
        } else {
          console.log(`   Retry failed: ${retryRes.status}`);
          console.log(JSON.stringify(retryRes.data?.errors || retryRes.data, null, 2));
        }
      }
      return;
    }

    const submissionId = newSubRes.data.data.id;
    console.log(`   Created review submission: ${submissionId}`);
    await submitReview(submissionId);

  } catch (err) {
    console.error('Error:', err.message);
  }
}

async function submitReview(submissionId) {
  // Add the version to the submission
  console.log('\n4. Adding version to submission...');
  const itemRes = await api('POST', '/v1/reviewSubmissionItems', {
    data: {
      type: 'reviewSubmissionItems',
      relationships: {
        reviewSubmission: { data: { type: 'reviewSubmissions', id: submissionId } },
        appStoreVersion: { data: { type: 'appStoreVersions', id: VERSION_ID } }
      }
    }
  });
  console.log(`   Item added: ${itemRes.status}`);
  if (itemRes.status !== 201 && itemRes.status !== 200) {
    console.log(JSON.stringify(itemRes.data?.errors || itemRes.data, null, 2));
  }

  // Confirm/submit the review
  console.log('\n5. Confirming and submitting review...');
  const confirmRes = await api('PATCH', `/v1/reviewSubmissions/${submissionId}`, {
    data: {
      type: 'reviewSubmissions',
      id: submissionId,
      attributes: { submitted: true }
    }
  });

  if (confirmRes.status === 200) {
    const finalState = confirmRes.data.data?.attributes?.state;
    console.log(`\n   SUCCESS! App submitted for Apple review! State: ${finalState}`);
  } else {
    console.log(`   Confirm failed: ${confirmRes.status}`);
    console.log(JSON.stringify(confirmRes.data?.errors || confirmRes.data, null, 2));
  }
}

main();

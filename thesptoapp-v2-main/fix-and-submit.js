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
  const pk = fs.readFileSync(KEY_PATH, 'utf8');
  const now = Math.floor(Date.now() / 1000);
  return jwt.sign(
    { iss: ISSUER_ID, iat: now, exp: now + 1200, aud: 'appstoreconnect-v1' },
    pk,
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
  console.log('=== FIX STUCK SUBMISSIONS & RESUBMIT ===\n');

  // Step 1: List all submissions and their items
  console.log('1. Listing all submissions and items...');
  const subsRes = await api('GET', `/v1/reviewSubmissions?filter[app]=${APP_ID}&filter[platform]=IOS&limit=10`);
  const subs = subsRes.data.data || [];

  for (const sub of subs) {
    const state = sub.attributes.state;
    if (state === 'COMPLETE') continue; // Skip completed ones
    
    console.log(`\n  Submission ${sub.id}: ${state}`);
    
    // Get items
    const itemsRes = await api('GET', `/v1/reviewSubmissions/${sub.id}/items`);
    const items = itemsRes.data.data || [];
    console.log(`  Items: ${items.length}`);
    for (const item of items) {
      console.log(`    Item ${item.id}: state=${item.attributes.state}`);
    }
  }

  // Step 2: Try to remove items from stuck submission 46edece3
  const stuckSubId = '46edece3-781d-45a0-b116-a3ea7cdfdc8b';
  console.log(`\n2. Getting items from stuck submission ${stuckSubId}...`);
  const stuckItems = await api('GET', `/v1/reviewSubmissions/${stuckSubId}/items`);
  const stuckItemsList = stuckItems.data.data || [];
  
  for (const item of stuckItemsList) {
    console.log(`  Removing item ${item.id}...`);
    const delRes = await api('DELETE', `/v1/reviewSubmissionItems/${item.id}`);
    console.log(`  DELETE result: ${delRes.status}`);
    if (delRes.status !== 204 && delRes.status !== 200) {
      console.log(`  Detail:`, JSON.stringify(delRes.data?.errors?.[0] || delRes.data));
    }
  }

  // Step 3: Cancel/delete the stuck submission itself
  console.log(`\n3. Cancelling stuck submission...`);
  const cancelRes = await api('PATCH', `/v1/reviewSubmissions/${stuckSubId}`, {
    data: { type: 'reviewSubmissions', id: stuckSubId, attributes: { canceled: true } }
  });
  console.log(`  Cancel result: ${cancelRes.status}`);
  
  const delSubRes = await api('DELETE', `/v1/reviewSubmissions/${stuckSubId}`);
  console.log(`  Delete result: ${delSubRes.status}`);

  // Step 4: Also handle the READY_FOR_REVIEW one (7bd9a6b5)
  const readySubId = '7bd9a6b5-8b76-45c6-b0aa-a3f624221cbc';
  console.log(`\n4. Checking READY_FOR_REVIEW submission ${readySubId}...`);
  
  // Check its items
  const readyItems = await api('GET', `/v1/reviewSubmissions/${readySubId}/items`);
  const readyItemsList = readyItems.data.data || [];
  console.log(`  Items: ${readyItemsList.length}`);
  
  for (const item of readyItemsList) {
    console.log(`    Item ${item.id}: state=${item.attributes.state}`);
  }

  // Option A: If readySubId has the version item, try submitting it directly
  if (readyItemsList.length > 0) {
    console.log(`\n5. Trying to submit the READY_FOR_REVIEW submission directly...`);
    const submitRes = await api('PATCH', `/v1/reviewSubmissions/${readySubId}`, {
      data: {
        type: 'reviewSubmissions',
        id: readySubId,
        attributes: { submitted: true }
      }
    });
    
    if (submitRes.status === 200) {
      const finalState = submitRes.data.data?.attributes?.state;
      console.log(`\n  SUCCESS! Submitted via existing submission! State: ${finalState}`);
      return;
    }
    console.log(`  Submit result: ${submitRes.status}`);
    console.log(`  `, JSON.stringify(submitRes.data?.errors?.[0]?.detail || submitRes.data));
  }

  // Option B: Cancel readySubId too and create fresh
  console.log(`\n6. Cancelling READY_FOR_REVIEW submission...`);
  const cancelReady = await api('PATCH', `/v1/reviewSubmissions/${readySubId}`, {
    data: { type: 'reviewSubmissions', id: readySubId, attributes: { canceled: true } }
  });
  console.log(`  Cancel result: ${cancelReady.status}`);

  // Clean items from it too
  for (const item of readyItemsList) {
    await api('DELETE', `/v1/reviewSubmissionItems/${item.id}`);
  }

  // Also delete the new submission we created earlier (5a8e0ff2)
  const newSubId = '5a8e0ff2-c5c3-4382-bfa6-cdc6de96362c';
  console.log(`\n7. Cleaning up orphan submission ${newSubId}...`);
  await api('PATCH', `/v1/reviewSubmissions/${newSubId}`, {
    data: { type: 'reviewSubmissions', id: newSubId, attributes: { canceled: true } }
  });
  await api('DELETE', `/v1/reviewSubmissions/${newSubId}`);

  // Wait for cleanup
  console.log('\n8. Waiting 5 seconds for cleanup...');
  await new Promise(r => setTimeout(r, 5000));

  // Step 8: Create fresh submission
  console.log('\n9. Creating new review submission...');
  const newRes = await api('POST', '/v1/reviewSubmissions', {
    data: {
      type: 'reviewSubmissions',
      attributes: { platform: 'IOS' },
      relationships: { app: { data: { type: 'apps', id: APP_ID } } }
    }
  });

  if (newRes.status !== 201 && newRes.status !== 200) {
    console.log(`  Create failed: ${newRes.status}`);
    console.log(JSON.stringify(newRes.data?.errors || newRes.data, null, 2));
    return;
  }

  const submissionId = newRes.data.data.id;
  console.log(`  Created: ${submissionId}`);

  // Add version
  console.log('\n10. Adding version to submission...');
  const addRes = await api('POST', '/v1/reviewSubmissionItems', {
    data: {
      type: 'reviewSubmissionItems',
      relationships: {
        reviewSubmission: { data: { type: 'reviewSubmissions', id: submissionId } },
        appStoreVersion: { data: { type: 'appStoreVersions', id: VERSION_ID } }
      }
    }
  });
  console.log(`  Result: ${addRes.status}`);
  if (addRes.status !== 201 && addRes.status !== 200) {
    console.log(JSON.stringify(addRes.data?.errors || addRes.data, null, 2));
    return;
  }

  // Submit
  console.log('\n11. Submitting for Apple review...');
  const confirmRes = await api('PATCH', `/v1/reviewSubmissions/${submissionId}`, {
    data: {
      type: 'reviewSubmissions',
      id: submissionId,
      attributes: { submitted: true }
    }
  });

  if (confirmRes.status === 200) {
    console.log(`\n  SUCCESS! App submitted for Apple review!`);
    console.log(`  State: ${confirmRes.data.data?.attributes?.state}`);
  } else {
    console.log(`  Submit failed: ${confirmRes.status}`);
    console.log(JSON.stringify(confirmRes.data?.errors || confirmRes.data, null, 2));
  }
}

main().catch(err => console.error('Error:', err.message));

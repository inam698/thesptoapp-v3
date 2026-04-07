// fix-submission-and-submit.js
// The version is stuck in old submission 9be5dd72. Need to remove it from there, then add to new submission.
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const KEY_ID = 'X79F2H3QXT';
const ISSUER_ID = '3ddd637a-4279-41fa-8c12-672a3c557cba';
const pk = fs.readFileSync(path.join(__dirname, 'AuthKey_X79F2H3QXT.p8'), 'utf8');

function makeJWT() {
  const header = Buffer.from(JSON.stringify({ alg: 'ES256', kid: KEY_ID, typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const payload = Buffer.from(JSON.stringify({ iss: ISSUER_ID, iat: now, exp: now + 1200, aud: 'appstoreconnect-v1' })).toString('base64url');
  const sig = crypto.sign('SHA256', Buffer.from(header + '.' + payload), { key: pk, dsaEncoding: 'ieee-p1363' });
  return header + '.' + payload + '.' + sig.toString('base64url');
}

function ascRequest(method, apiPath, body) {
  return new Promise((resolve, reject) => {
    const token = makeJWT();
    const bodyStr = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'api.appstoreconnect.apple.com',
      path: apiPath,
      method,
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' }
    };
    if (bodyStr) opts.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch { resolve({ status: res.statusCode, data: d }); }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

const APP_ID = '6755155637';
const VERSION_ID = '193a42ea-6826-4118-a8d2-d6483702e08c';
const OLD_SUBMISSION_ID = '9be5dd72-bb1a-4f15-aa47-9d957e0367fb';
const NEW_SUBMISSION_ID = '80abf76e-2385-45f7-ae9e-0004defe4472';
const NEW_BUILD_ID = 'c2457eb1-705e-47a5-a263-f5dfc15c1e79';

async function main() {
  // Step 1: Check old submission state and items
  console.log('=== STEP 1: Check old submission 9be5dd72 ===');
  const oldSub = await ascRequest('GET', `/v1/reviewSubmissions/${OLD_SUBMISSION_ID}?include=items`);
  console.log('Old submission state:', oldSub.data?.data?.attributes?.state);
  const items = oldSub.data?.included || [];
  console.log('Items in old submission:', items.length);
  for (const item of items) {
    console.log(`  Item: ${item.id} | state: ${item.attributes?.state}`);
  }

  // Step 2: Try to remove the item from old submission
  // The item ID we need is the one referencing the appStoreVersion in the old submission
  const versionItem = items.find(i => i.attributes?.state === 'REJECTED' || i.attributes?.state === 'READY_FOR_REVIEW' || i.attributes?.state === 'ACCEPTED');
  if (versionItem) {
    console.log(`\n=== STEP 2: Remove item ${versionItem.id} from old submission ===`);
    const removeResp = await ascRequest('DELETE', `/v1/reviewSubmissionItems/${versionItem.id}`);
    console.log('Remove status:', removeResp.status);
    if (removeResp.status === 204 || removeResp.status === 200) {
      console.log('Item removed from old submission');
    } else {
      console.log('Remove response:', JSON.stringify(removeResp.data?.errors || removeResp.data, null, 2));
    }
  }

  // Step 2b: If we can't remove the item, try canceling or completing the old submission
  const oldState = oldSub.data?.data?.attributes?.state;
  if (oldState === 'UNRESOLVED_ISSUES') {
    console.log('\n=== STEP 2b: Try to complete/cancel old submission with UNRESOLVED_ISSUES ===');
    // Try canceling
    const cancelResp = await ascRequest('PATCH', `/v1/reviewSubmissions/${OLD_SUBMISSION_ID}`, {
      data: {
        type: 'reviewSubmissions',
        id: OLD_SUBMISSION_ID,
        attributes: { canceled: true }
      }
    });
    console.log('Cancel old submission status:', cancelResp.status);
    console.log('Cancel state:', cancelResp.data?.data?.attributes?.state);
    if (cancelResp.status !== 200) {
      console.log('Cancel response:', JSON.stringify(cancelResp.data?.errors || cancelResp.data, null, 2));
    }
  }

  // Step 3: Also check and delete the stale READY_FOR_REVIEW submission 969494ba
  console.log('\n=== STEP 3: Delete stale submission 969494ba ===');
  const staleCancel = await ascRequest('PATCH', '/v1/reviewSubmissions/969494ba-79d3-4035-93ea-ecdd78cf9a4b', {
    data: {
      type: 'reviewSubmissions',
      id: '969494ba-79d3-4035-93ea-ecdd78cf9a4b',
      attributes: { canceled: true }
    }
  });
  console.log('Stale cancel status:', staleCancel.status);
  if (staleCancel.status !== 200) {
    console.log('Stale response:', JSON.stringify(staleCancel.data?.errors || staleCancel.data, null, 2));
  }

  // Step 4: Now try adding the version to the new submission
  console.log('\n=== STEP 4: Add version to new submission ===');
  const addResp = await ascRequest('POST', '/v1/reviewSubmissionItems', {
    data: {
      type: 'reviewSubmissionItems',
      relationships: {
        reviewSubmission: { data: { type: 'reviewSubmissions', id: NEW_SUBMISSION_ID } },
        appStoreVersion: { data: { type: 'appStoreVersions', id: VERSION_ID } }
      }
    }
  });
  console.log('Add item status:', addResp.status);
  if (addResp.status === 201 || addResp.status === 200) {
    console.log('Item added:', addResp.data?.data?.id);
  } else {
    console.log('Add response:', JSON.stringify(addResp.data?.errors || addResp.data, null, 2));

    // If still blocked, try creating a brand new submission
    console.log('\n=== STEP 4b: Try creating a completely new submission ===');
    // First delete the empty new submission
    const delNew = await ascRequest('DELETE', `/v1/reviewSubmissions/${NEW_SUBMISSION_ID}`);
    console.log('Delete empty new sub:', delNew.status);

    const freshSub = await ascRequest('POST', '/v1/reviewSubmissions', {
      data: {
        type: 'reviewSubmissions',
        relationships: {
          app: { data: { type: 'apps', id: APP_ID } }
        }
      }
    });
    console.log('Fresh submission status:', freshSub.status);
    const freshId = freshSub.data?.data?.id;
    console.log('Fresh submission ID:', freshId, 'State:', freshSub.data?.data?.attributes?.state);
    
    if (freshId) {
      const addResp2 = await ascRequest('POST', '/v1/reviewSubmissionItems', {
        data: {
          type: 'reviewSubmissionItems',
          relationships: {
            reviewSubmission: { data: { type: 'reviewSubmissions', id: freshId } },
            appStoreVersion: { data: { type: 'appStoreVersions', id: VERSION_ID } }
          }
        }
      });
      console.log('Add to fresh status:', addResp2.status);
      if (addResp2.status === 201) {
        console.log('Item added to fresh submission');
        // Submit
        const submitResp = await ascRequest('PATCH', `/v1/reviewSubmissions/${freshId}`, {
          data: { type: 'reviewSubmissions', id: freshId, attributes: { submitted: true } }
        });
        console.log('Submit status:', submitResp.status, 'State:', submitResp.data?.data?.attributes?.state);
        if (submitResp.status === 200) console.log('\n*** SUBMITTED FOR REVIEW ***');
        else console.log(JSON.stringify(submitResp.data?.errors || submitResp.data, null, 2));
        return;
      } else {
        console.log(JSON.stringify(addResp2.data?.errors || addResp2.data, null, 2));
      }
    }
    return;
  }

  // Step 5: Submit for review
  console.log('\n=== STEP 5: Submit for review ===');
  const submitResp = await ascRequest('PATCH', `/v1/reviewSubmissions/${NEW_SUBMISSION_ID}`, {
    data: {
      type: 'reviewSubmissions',
      id: NEW_SUBMISSION_ID,
      attributes: { submitted: true }
    }
  });
  console.log('Submit status:', submitResp.status);
  if (submitResp.status === 200) {
    console.log('State:', submitResp.data?.data?.attributes?.state);
    console.log('\n*** BUILD #52 SUBMITTED FOR APPLE REVIEW! ***');
  } else {
    console.log(JSON.stringify(submitResp.data?.errors || submitResp.data, null, 2));
  }

  // Final check
  console.log('\n=== FINAL STATUS ===');
  const finalResp = await ascRequest('GET', `/v1/appStoreVersions/${VERSION_ID}?include=build`);
  console.log('Version state:', finalResp.data?.data?.attributes?.appStoreState);
  if (finalResp.data?.included?.[0]) {
    console.log('Build:', finalResp.data.included[0].attributes?.version);
  }
}

main().catch(err => { console.error('FATAL:', err.message); process.exit(1); });

// retry-submit.js — Wait for old submission cancellation to propagate, then submit
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

const sleep = ms => new Promise(r => setTimeout(r, ms));

const APP_ID = '6755155637';
const VERSION_ID = '193a42ea-6826-4118-a8d2-d6483702e08c';
const OLD_SUB = '9be5dd72-bb1a-4f15-aa47-9d957e0367fb';

async function main() {
  // Step 1: Check old submission state — wait for COMPLETE
  console.log('Checking old submission state...');
  for (let i = 0; i < 10; i++) {
    const resp = await ascRequest('GET', `/v1/reviewSubmissions/${OLD_SUB}`);
    const state = resp.data?.data?.attributes?.state;
    console.log(`  Attempt ${i+1}: state = ${state}`);
    if (state === 'COMPLETE' || state === 'CANCELING' && i >= 5) break;
    if (state !== 'CANCELING') break;
    console.log('  Waiting 10s for cancellation to complete...');
    await sleep(10000);
  }

  // Step 2: Check version state
  console.log('\nChecking version state...');
  const verResp = await ascRequest('GET', `/v1/appStoreVersions/${VERSION_ID}?include=build`);
  console.log('Version state:', verResp.data?.data?.attributes?.appStoreState);
  if (verResp.data?.included?.[0]) {
    console.log('Current build:', verResp.data.included[0].attributes?.version);
  }

  // Step 3: List all review submissions for the app
  console.log('\nListing current review submissions...');
  const subsResp = await ascRequest('GET', `/v1/reviewSubmissions?filter[app]=${APP_ID}&limit=5`);
  const subs = subsResp.data?.data || [];
  for (const s of subs) {
    console.log(`  ${s.id} | state: ${s.attributes.state}`);
  }

  // Clean up any empty READY_FOR_REVIEW submissions
  const readySubs = subs.filter(s => s.attributes.state === 'READY_FOR_REVIEW');
  for (const rs of readySubs) {
    console.log(`\nCanceling empty READY_FOR_REVIEW submission: ${rs.id}`);
    const cancelResp = await ascRequest('PATCH', `/v1/reviewSubmissions/${rs.id}`, {
      data: { type: 'reviewSubmissions', id: rs.id, attributes: { canceled: true } }
    });
    console.log('  Cancel status:', cancelResp.status, 'State:', cancelResp.data?.data?.attributes?.state);
    if (cancelResp.status !== 200) {
      console.log('  Error:', JSON.stringify(cancelResp.data?.errors?.[0]?.detail));
    }
  }

  // Wait a moment
  console.log('\nWaiting 5s before creating new submission...');
  await sleep(5000);

  // Step 4: Create new submission
  console.log('Creating new review submission...');
  const newSubResp = await ascRequest('POST', '/v1/reviewSubmissions', {
    data: {
      type: 'reviewSubmissions',
      relationships: {
        app: { data: { type: 'apps', id: APP_ID } }
      }
    }
  });
  console.log('New submission status:', newSubResp.status);
  const newSubId = newSubResp.data?.data?.id;
  console.log('New submission ID:', newSubId, 'State:', newSubResp.data?.data?.attributes?.state);
  if (!newSubId || newSubResp.status > 201) {
    console.log('Error:', JSON.stringify(newSubResp.data?.errors || newSubResp.data, null, 2));
    return;
  }

  // Step 5: Add version to submission
  console.log('\nAdding version to submission...');
  const addResp = await ascRequest('POST', '/v1/reviewSubmissionItems', {
    data: {
      type: 'reviewSubmissionItems',
      relationships: {
        reviewSubmission: { data: { type: 'reviewSubmissions', id: newSubId } },
        appStoreVersion: { data: { type: 'appStoreVersions', id: VERSION_ID } }
      }
    }
  });
  console.log('Add item status:', addResp.status);
  if (addResp.status === 201 || addResp.status === 200) {
    console.log('Item added successfully:', addResp.data?.data?.id);
  } else {
    console.log('Error:', JSON.stringify(addResp.data?.errors || addResp.data, null, 2));
    return;
  }

  // Step 6: Submit for review
  console.log('\nSubmitting for review...');
  const submitResp = await ascRequest('PATCH', `/v1/reviewSubmissions/${newSubId}`, {
    data: {
      type: 'reviewSubmissions',
      id: newSubId,
      attributes: { submitted: true }
    }
  });
  console.log('Submit status:', submitResp.status);
  if (submitResp.status === 200) {
    console.log('State:', submitResp.data?.data?.attributes?.state);
    console.log('\n*** BUILD #52 SUBMITTED FOR APPLE REVIEW! ***');
  } else {
    console.log('Error:', JSON.stringify(submitResp.data?.errors || submitResp.data, null, 2));
  }

  // Final check
  console.log('\n=== FINAL STATUS ===');
  const finalResp = await ascRequest('GET', `/v1/appStoreVersions/${VERSION_ID}?include=build`);
  console.log('Version:', finalResp.data?.data?.attributes?.versionString);
  console.log('State:', finalResp.data?.data?.attributes?.appStoreState);
  if (finalResp.data?.included?.[0]) {
    console.log('Build:', finalResp.data.included[0].attributes?.version);
  }
}

main().catch(err => { console.error('FATAL:', err.message); process.exit(1); });

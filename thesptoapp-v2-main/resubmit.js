// resubmit.js - Cancel stale submissions and resubmit build #67 with OTA fix
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

async function main() {
  // Step 1: Cancel ALL non-complete submissions
  console.log('=== STEP 1: Cancel stale submissions ===');
  const staleIds = [
    '73812784-4d17-4752-b128-8908cb37f85a',
    'b52ed065-f44f-4c7a-aad7-eb97ce76abde',
    'b4eb83c4-a7b9-4131-a958-2fd9cec0d3c1',
    '62f1e746-123d-4e1a-8faa-7ce82231c2a2'
  ];
  for (const id of staleIds) {
    console.log(`Cancelling ${id}...`);
    const r = await ascRequest('PATCH', `/v1/reviewSubmissions/${id}`, {
      data: { type: 'reviewSubmissions', id, attributes: { canceled: true } }
    });
    console.log(`  ${r.status} - ${r.data?.data?.attributes?.state || JSON.stringify(r.data?.errors?.[0]?.detail || '')}`);
  }

  // Step 2: Verify version state
  console.log('\n=== STEP 2: Version state ===');
  const ver = await ascRequest('GET', `/v1/appStoreVersions/${VERSION_ID}?include=build`);
  console.log('State:', ver.data?.data?.attributes?.appStoreState);
  if (ver.data?.included?.[0]) {
    console.log('Build:', ver.data.included[0].attributes?.version);
  }

  // Step 3: Create new submission
  console.log('\n=== STEP 3: Create submission ===');
  const sub = await ascRequest('POST', '/v1/reviewSubmissions', {
    data: {
      type: 'reviewSubmissions',
      relationships: { app: { data: { type: 'apps', id: APP_ID } } }
    }
  });
  console.log('Status:', sub.status);
  const subId = sub.data?.data?.id;
  if (!subId) {
    console.log('ERROR:', JSON.stringify(sub.data?.errors || sub.data, null, 2));
    return;
  }
  console.log('Submission ID:', subId);

  // Step 4: Add version to submission
  console.log('\n=== STEP 4: Add version ===');
  const item = await ascRequest('POST', '/v1/reviewSubmissionItems', {
    data: {
      type: 'reviewSubmissionItems',
      relationships: {
        reviewSubmission: { data: { type: 'reviewSubmissions', id: subId } },
        appStoreVersion: { data: { type: 'appStoreVersions', id: VERSION_ID } }
      }
    }
  });
  console.log('Status:', item.status);
  if (item.status !== 201 && item.status !== 200) {
    console.log('ERROR:', JSON.stringify(item.data?.errors || item.data, null, 2));
    return;
  }
  console.log('Item ID:', item.data?.data?.id);

  // Step 5: Submit for review
  console.log('\n=== STEP 5: Submit for review ===');
  const confirm = await ascRequest('PATCH', `/v1/reviewSubmissions/${subId}`, {
    data: { type: 'reviewSubmissions', id: subId, attributes: { submitted: true } }
  });
  console.log('Status:', confirm.status);
  if (confirm.status === 200) {
    console.log('State:', confirm.data?.data?.attributes?.state);
    console.log('\n BUILD #67 RESUBMITTED FOR APPLE REVIEW (with OTA fix)!');
  } else {
    console.log('ERROR:', JSON.stringify(confirm.data?.errors || confirm.data, null, 2));
  }

  // Step 6: Final check
  console.log('\n=== FINAL STATE ===');
  const final = await ascRequest('GET', `/v1/appStoreVersions/${VERSION_ID}`);
  console.log('App Store State:', final.data?.data?.attributes?.appStoreState);
}

main().catch(err => { console.error('FATAL:', err.message); process.exit(1); });

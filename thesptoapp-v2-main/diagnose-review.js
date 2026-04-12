const jwt = require('jsonwebtoken');
const https = require('https');
const fs = require('fs');
const pk = fs.readFileSync('./AuthKey_X79F2H3QXT.p8', 'utf8');
const now = Math.floor(Date.now() / 1000);
const token = jwt.sign(
  { iss: '3ddd637a-4279-41fa-8c12-672a3c557cba', iat: now, exp: now + 1200, aud: 'appstoreconnect-v1' },
  pk,
  { algorithm: 'ES256', header: { alg: 'ES256', kid: 'X79F2H3QXT', typ: 'JWT' } }
);

function api(method, urlPath, body) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'api.appstoreconnect.apple.com',
      path: urlPath,
      method,
      headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json' }
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => (d += c));
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d || '{}') }); }
        catch { resolve({ status: res.statusCode, data: d }); }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function main() {
  console.log('=== App Store Connect Fix & Resubmit ===\n');

  // 1. Version state
  const v = await api('GET', '/v1/apps/6755155637/appStoreVersions?filter[platform]=IOS&limit=5');
  if (v.status !== 200) { console.log('Failed to get versions:', v.status); return; }
  const ver = v.data.data[0];
  console.log(`Version: ${ver.attributes.versionString} | State: ${ver.attributes.appStoreState} | ID: ${ver.id}`);

  // 2. Cancel ALL non-complete submissions
  const subs = await api('GET', '/v1/reviewSubmissions?filter[app]=6755155637&filter[platform]=IOS&limit=50');
  const allSubs = subs.data.data || [];
  console.log(`\nFound ${allSubs.length} review submissions total`);

  for (const s of allSubs) {
    const state = s.attributes.state;
    if (state !== 'COMPLETE') {
      console.log(`  Cancelling ${s.id} (${state})...`);
      const r = await api('PATCH', `/v1/reviewSubmissions/${s.id}`, {
        data: { type: 'reviewSubmissions', id: s.id, attributes: { canceled: true } }
      });
      console.log(`    Result: ${r.status}`);
    }
  }

  // 3. Wait for Apple to process the cancellations
  console.log('\nWaiting 8 seconds for cancellations to propagate...');
  await new Promise(r => setTimeout(r, 8000));

  // 4. Verify state after cancellation
  const v2 = await api('GET', '/v1/apps/6755155637/appStoreVersions?filter[platform]=IOS&limit=1');
  const newState = v2.data.data[0].attributes.appStoreState;
  console.log(`Version state after cancel: ${newState}`);

  // If the version went back to REJECTED or PREPARE_FOR_SUBMISSION, we can proceed
  // If still WAITING_FOR_REVIEW, wait more
  if (newState === 'WAITING_FOR_REVIEW') {
    console.log('Still WAITING_FOR_REVIEW, waiting 10 more seconds...');
    await new Promise(r => setTimeout(r, 10000));
    const v3 = await api('GET', '/v1/apps/6755155637/appStoreVersions?filter[platform]=IOS&limit=1');
    console.log(`Version state now: ${v3.data.data[0].attributes.appStoreState}`);
  }

  // 5. Create new fresh submission
  console.log('\nCreating fresh review submission...');
  const newSub = await api('POST', '/v1/reviewSubmissions', {
    data: {
      type: 'reviewSubmissions',
      attributes: { platform: 'IOS' },
      relationships: { app: { data: { type: 'apps', id: '6755155637' } } }
    }
  });

  if (newSub.status !== 201 && newSub.status !== 200) {
    console.log(`Create failed: ${newSub.status}`);
    console.log(JSON.stringify(newSub.data?.errors || newSub.data, null, 2));
    return;
  }

  const subId = newSub.data.data.id;
  console.log(`✓ Created submission: ${subId}`);

  // 6. Re-get version ID to get fresh state
  const v4 = await api('GET', '/v1/apps/6755155637/appStoreVersions?filter[platform]=IOS&limit=1');
  const freshVerId = v4.data.data[0].id;
  console.log(`Using version ID: ${freshVerId}`);

  // 7. Add version item
  const itemRes = await api('POST', '/v1/reviewSubmissionItems', {
    data: {
      type: 'reviewSubmissionItems',
      relationships: {
        reviewSubmission: { data: { type: 'reviewSubmissions', id: subId } },
        appStoreVersion: { data: { type: 'appStoreVersions', id: freshVerId } }
      }
    }
  });
  console.log(`Add version item: ${itemRes.status}`);
  if (itemRes.status !== 201 && itemRes.status !== 200) {
    console.log(JSON.stringify(itemRes.data?.errors || itemRes.data, null, 2));
    return;
  }

  // 8. Confirm submit
  console.log('\nSubmitting for review...');
  const confirmRes = await api('PATCH', `/v1/reviewSubmissions/${subId}`, {
    data: { type: 'reviewSubmissions', id: subId, attributes: { submitted: true } }
  });

  if (confirmRes.status === 200) {
    const finalState = confirmRes.data.data?.attributes?.state;
    console.log(`\n✅ SUCCESS! State: ${finalState}`);
  } else {
    console.log(`Submit failed: ${confirmRes.status}`);
    console.log(JSON.stringify(confirmRes.data?.errors || confirmRes.data, null, 2));
  }
}

main().catch(e => console.error('Fatal:', e));

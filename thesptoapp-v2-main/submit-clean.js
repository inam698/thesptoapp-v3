const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const KEY_ID = 'X79F2H3QXT';
const ISSUER_ID = '3ddd637a-4279-41fa-8c12-672a3c557cba';
const pkPath = path.join(__dirname, 'AuthKey_X79F2H3QXT.p8');
if (!fs.existsSync(pkPath)) {
  console.error(`FATAL: Private key not found at ${pkPath}`);
  process.exit(1);
}
const pk = fs.readFileSync(pkPath, 'utf8');

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

async function cancelAllSubmissions() {
  console.log('--- Force cancelling all review submissions ---');
  const resp = await ascRequest('GET', `/v1/reviewSubmissions?filter[app]=${APP_ID}&limit=20`);
  if (resp.status !== 200) {
    console.error('Failed to fetch submissions:', resp.data);
    return;
  }
  const submissions = resp.data?.data || [];
  console.log(`Found ${submissions.length} total submissions to check.`);

  for (const sub of submissions) {
    console.log(`Checking submission ${sub.id} (state: ${sub.attributes.state})...`);
    if (['CANCELED', 'COMPLETE'].includes(sub.attributes.state)) {
      console.log('  -> Already in a terminal state, skipping.');
      continue;
    }
    const cancelResp = await ascRequest('PATCH', `/v1/reviewSubmissions/${sub.id}`, {
      data: { type: 'reviewSubmissions', id: sub.id, attributes: { canceled: true } }
    });
    console.log(`  Cancel status: ${cancelResp.status}`);
    if (cancelResp.status !== 200) {
      const error = cancelResp.data?.errors?.[0];
      if (error?.code === 'STATE_ERROR.ENTITY_STATE_INVALID') {
        console.log(`  -> Not in a cancellable state, which is OK.`);
      } else {
        console.error('  -> Failed to cancel:', JSON.stringify(cancelResp.data, null, 2));
      }
    } else {
      console.log(`  -> Successfully cancelled.`);
    }
  }
  console.log('--- Finished cancellation process ---\n');
}


async function main() {
  const forceCancel = process.argv.includes('--force-cancel-all');

  if (forceCancel) {
    await cancelAllSubmissions();
  }

  // Step 1: Verify version state
  console.log('=== STEP 1: Verify version state ===');
  const verResp = await ascRequest('GET', `/v1/appStoreVersions/${VERSION_ID}?include=build`);
  const verAttrs = verResp.data?.data?.attributes;
  console.log('Version:', verAttrs?.versionString);
  console.log('State:', verAttrs?.appStoreState);
  if (verResp.data?.included?.[0]) {
    console.log('Build:', verResp.data.included[0].attributes?.version, '(ID:', verResp.data.included[0].id + ')');
  }
  if (verAttrs?.appStoreState === 'WAITING_FOR_REVIEW') {
    console.log('\n✅ App is already waiting for review. No action needed.');
    return;
  }
  if (!['REJECTED', 'DEVELOPER_REJECTED', 'PREPARE_FOR_SUBMISSION', 'METADATA_REJECTED'].includes(verAttrs?.appStoreState)) {
    console.error(`\n❌ Version is in state ${verAttrs?.appStoreState}, which cannot be submitted.`);
    await cancelAllSubmissions();
    console.error('Rerunning script after forced cancellation attempt.');
    return;
  }

  // Step 2: Create fresh review submission
  console.log('\n=== STEP 2: Create new review submission ===');
  const subResp = await ascRequest('POST', '/v1/reviewSubmissions', {
    data: {
      type: 'reviewSubmissions',
      relationships: {
        app: { data: { type: 'apps', id: APP_ID } }
      }
    }
  });
  console.log('Status:', subResp.status);
  const subId = subResp.data?.data?.id;
  if (!subId) {
    const error = subResp.data?.errors?.[0];
    if (error?.code === 'STATE_ERROR.ITEM_PART_OF_ANOTHER_SUBMISSION') {
      console.warn('  -> Version is part of another submission. Attempting to force-cancel all and retry...');
      await cancelAllSubmissions();
      await main(); // Retry main logic
      return;
    }
    console.error('ERROR creating submission:', JSON.stringify(subResp.data, null, 2));
    return;
  }
  console.log('Submission ID:', subId);

  // Step 2b: Add version to submission
  console.log('\n=== STEP 2b: Add version to submission ===');
  const itemResp = await ascRequest('POST', '/v1/reviewSubmissionItems', {
    data: {
      type: 'reviewSubmissionItems',
      relationships: {
        reviewSubmission: { data: { type: 'reviewSubmissions', id: subId } },
        appStoreVersion: { data: { type: 'appStoreVersions', id: VERSION_ID } }
      }
    }
  });
  console.log('Status:', itemResp.status);
  if (itemResp.status >= 300) {
    console.error('ERROR adding version to submission:', JSON.stringify(itemResp.data, null, 2));
    return;
  }

  // Step 3: Submit for review
  console.log('\n=== STEP 3: Submit for Apple review ===');
  const confirmResp = await ascRequest('PATCH', `/v1/reviewSubmissions/${subId}`, {
    data: { type: 'reviewSubmissions', id: subId, attributes: { submitted: true } }
  });
  console.log('Status:', confirmResp.status);
  if (confirmResp.status === 200) {
    console.log('State:', confirmResp.data?.data?.attributes?.state);
    console.log('\n✅ BUILD #67 SUBMITTED FOR APPLE REVIEW!');
  } else {
    console.error('ERROR submitting:', JSON.stringify(confirmResp.data?.errors || confirmResp.data, null, 2));
  }

  // Step 4: Final verification
  console.log('\n=== STEP 4: Final state ===');
  const finalResp = await ascRequest('GET', `/v1/appStoreVersions/${VERSION_ID}`);
  console.log('App Store State:', finalResp.data?.data?.attributes?.appStoreState);
}

main().catch(err => { console.error('FATAL SCRIPT ERROR:', err.message, err.stack); process.exit(1); });


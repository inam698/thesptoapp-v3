// submit-new-build.js - All-in-one: check status, attach new build, submit for review, reply to resolution center
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// --- ASC API Auth ---
const KEY_ID = 'X79F2H3QXT';
const ISSUER_ID = '3ddd637a-4279-41fa-8c12-672a3c557cba';
const pkPath = path.join(__dirname, 'AuthKey_X79F2H3QXT.p8');
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

async function main() {
  console.log('=== STEP 1: Check current version status ===');
  const verResp = await ascRequest('GET', `/v1/appStoreVersions/${VERSION_ID}?include=build`);
  const ver = verResp.data;
  console.log('Version:', ver.data?.attributes?.versionString);
  console.log('State:', ver.data?.attributes?.appStoreState);
  if (ver.included?.[0]) {
    console.log('Current Build:', ver.included[0].attributes?.version, '(ID:', ver.included[0].id + ')');
  }

  console.log('\n=== STEP 2: List all builds to find the newest (build 52) ===');
  const buildsResp = await ascRequest('GET', `/v1/builds?filter[app]=${APP_ID}&sort=-uploadedDate&limit=5`);
  const builds = buildsResp.data?.data || [];
  for (const b of builds) {
    console.log(`  Build #${b.attributes.version} | processing: ${b.attributes.processingState} | uploaded: ${b.attributes.uploadedDate} | ID: ${b.id}`);
  }

  // Find the newest VALID build that is NOT build 44
  const newBuild = builds.find(b => b.attributes.processingState === 'VALID' && b.attributes.version !== '44');
  if (!newBuild) {
    console.log('\n*** No new VALID build found (not build 44). Check if EAS build has finished processing. ***');
    console.log('Available builds:');
    for (const b of builds) {
      console.log(`  #${b.attributes.version} - ${b.attributes.processingState}`);
    }
    return;
  }
  console.log(`\nUsing Build #${newBuild.attributes.version} (ID: ${newBuild.id})`);

  console.log('\n=== STEP 3: Attach new build to version ===');
  const attachResp = await ascRequest('PATCH', `/v1/appStoreVersions/${VERSION_ID}`, {
    data: {
      type: 'appStoreVersions',
      id: VERSION_ID,
      relationships: {
        build: {
          data: { type: 'builds', id: newBuild.id }
        }
      }
    }
  });
  console.log('Attach status:', attachResp.status);
  if (attachResp.status === 200) {
    console.log('Successfully attached Build #' + newBuild.attributes.version + ' to version');
  } else {
    console.log('Attach response:', JSON.stringify(attachResp.data?.errors || attachResp.data, null, 2));
  }

  console.log('\n=== STEP 4: Create review submission ===');
  const subResp = await ascRequest('POST', '/v1/reviewSubmissions', {
    data: {
      type: 'reviewSubmissions',
      relationships: {
        app: { data: { type: 'apps', id: APP_ID } }
      }
    }
  });
  console.log('Review submission status:', subResp.status);
  const subId = subResp.data?.data?.id;
  if (subResp.status === 201 || subResp.status === 200) {
    console.log('Submission ID:', subId);
    console.log('State:', subResp.data?.data?.attributes?.state);
  } else {
    console.log('Submission response:', JSON.stringify(subResp.data?.errors || subResp.data, null, 2));
    // If there's already an existing submission, try to find it
    if (subResp.data?.errors?.[0]?.code === 'STATE_ERROR' || subResp.status === 409) {
      console.log('There may be an existing submission. Checking...');
      const existingSubs = await ascRequest('GET', `/v1/reviewSubmissions?filter[app]=${APP_ID}&filter[state]=READY_FOR_REVIEW,WAITING_FOR_REVIEW`);
      console.log('Existing submissions:', JSON.stringify(existingSubs.data?.data?.map(s => ({id: s.id, state: s.attributes.state})), null, 2));
    }
    return;
  }

  console.log('\n=== STEP 5: Add version to submission items ===');
  const itemResp = await ascRequest('POST', '/v1/reviewSubmissionItems', {
    data: {
      type: 'reviewSubmissionItems',
      relationships: {
        reviewSubmission: { data: { type: 'reviewSubmissions', id: subId } },
        appStoreVersion: { data: { type: 'appStoreVersions', id: VERSION_ID } }
      }
    }
  });
  console.log('Add item status:', itemResp.status);
  if (itemResp.status === 201 || itemResp.status === 200) {
    console.log('Item added:', itemResp.data?.data?.id);
  } else {
    console.log('Item response:', JSON.stringify(itemResp.data?.errors || itemResp.data, null, 2));
  }

  console.log('\n=== STEP 6: Confirm / submit for review ===');
  const confirmResp = await ascRequest('PATCH', `/v1/reviewSubmissions/${subId}`, {
    data: {
      type: 'reviewSubmissions',
      id: subId,
      attributes: { submitted: true }
    }
  });
  console.log('Submit status:', confirmResp.status);
  if (confirmResp.status === 200) {
    console.log('State:', confirmResp.data?.data?.attributes?.state);
    console.log('\n*** BUILD SUBMITTED FOR APPLE REVIEW! ***');
  } else {
    console.log('Submit response:', JSON.stringify(confirmResp.data?.errors || confirmResp.data, null, 2));
  }

  // Final verification
  console.log('\n=== STEP 7: Final verification ===');
  const finalResp = await ascRequest('GET', `/v1/appStoreVersions/${VERSION_ID}?include=build`);
  console.log('Final state:', finalResp.data?.data?.attributes?.appStoreState);
  if (finalResp.data?.included?.[0]) {
    console.log('Final build:', finalResp.data.included[0].attributes?.version);
  }
}

main().catch(err => {
  console.error('FATAL:', err.message);
  process.exit(1);
});

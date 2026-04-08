// Submit Build 54 to App Store Connect for Apple Review
const jwt = require('jsonwebtoken');
const https = require('https');
const fs = require('fs');
const path = require('path');

const KEY_ID = 'X79F2H3QXT';
const ISSUER_ID = '3ddd637a-4279-41fa-8c12-672a3c557cba';
const APP_ID = '6755155637';
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
    // Step 1: Get recent builds on ASC
    console.log('1. Fetching recent builds from ASC...');
    const buildsRes = await api('GET',
      `/v1/builds?filter[app]=${APP_ID}&sort=-uploadedDate&limit=10`
    );
    if (buildsRes.status !== 200) {
      console.log('   ERROR fetching builds:', buildsRes.status, JSON.stringify(buildsRes.data));
      return;
    }
    const builds = buildsRes.data.data || [];
    console.log(`   Found ${builds.length} build(s):`);
    builds.forEach(b => {
      console.log(`   - version:${b.attributes.version} state:${b.attributes.processingState} uploaded:${b.attributes.uploadedDate}`);
    });

    // Find Build 54
    let build54 = builds.find(b => b.attributes.version === '54');
    if (!build54) {
      console.log('\n   Build 54 not found on ASC yet. It may still be processing.');
      console.log('   Checking if EAS submit uploaded it...');
      // Try waiting a moment and checking again
      if (builds.length > 0) {
        console.log(`\n   Most recent build is version ${builds[0].attributes.version} (state: ${builds[0].attributes.processingState})`);
        console.log('   Will use the most recent VALID build instead.');
        const validBuild = builds.find(b => b.attributes.processingState === 'VALID');
        if (validBuild) {
          build54 = validBuild;
          console.log(`   Using build version ${validBuild.attributes.version}`);
        } else {
          console.log('   No VALID builds found. Build 54 may still be processing on ASC.');
          console.log('   Try again in a few minutes.');
          return;
        }
      } else {
        return;
      }
    } else {
      console.log(`\n   Build 54 found! State: ${build54.attributes.processingState}`);
      if (build54.attributes.processingState !== 'VALID') {
        console.log(`   Build is still ${build54.attributes.processingState}. Wait for it to become VALID.`);
        return;
      }
    }
    const buildId = build54.id;

    // Step 2: Get version 2.1.0 (use known ID since filter has issues)
    const versionId = '193a42ea-6826-4118-a8d2-d6483702e08c';
    console.log('\n2. Getting App Store version 2.1.0...');
    const versionRes = await api('GET', `/v1/appStoreVersions/${versionId}`);
    if (versionRes.status !== 200) {
      console.log('   Failed to get version:', versionRes.status);
      // Fallback: list all versions
      const allVer = await api('GET', `/v1/apps/${APP_ID}/appStoreVersions?limit=5`);
      console.log('   All versions:', (allVer.data.data||[]).map(v => `${v.attributes.versionString} (${v.attributes.appStoreState})`).join(', '));
      return;
    }
    const state = versionRes.data.data.attributes.appStoreState;
    console.log(`   Version ID: ${versionId}, State: ${state}`);

    // Step 3: Cancel any pending submission if needed
    if (state === 'WAITING_FOR_REVIEW' || state === 'IN_REVIEW') {
      console.log('\n3. Cancelling existing submission...');
      // Try old API
      const subRes = await api('GET', `/v1/appStoreVersions/${versionId}/appStoreVersionSubmission`);
      if (subRes.status === 200 && subRes.data.data) {
        const delRes = await api('DELETE', `/v1/appStoreVersionSubmissions/${subRes.data.data.id}`);
        console.log(`   Old API cancel: ${delRes.status}`);
      }
      // Try new API
      const reviewSubs = await api('GET', `/v1/reviewSubmissions?filter[app]=${APP_ID}&filter[state]=WAITING_FOR_REVIEW,IN_REVIEW`);
      if (reviewSubs.status === 200 && reviewSubs.data.data?.length > 0) {
        for (const sub of reviewSubs.data.data) {
          const cancelRes = await api('PATCH', `/v1/reviewSubmissions/${sub.id}`, {
            data: { type: 'reviewSubmissions', id: sub.id, attributes: { canceled: true } }
          });
          console.log(`   Cancelled review submission ${sub.id}: ${cancelRes.status}`);
        }
      }
      console.log('   Done cancelling.');
    } else if (state === 'REJECTED' || state === 'PREPARE_FOR_SUBMISSION' || state === 'DEVELOPER_REJECTED') {
      console.log(`\n3. Version is in ${state} - ready to attach new build and resubmit.`);
    } else {
      console.log(`\n3. Version state: ${state}`);
    }

    // Step 4: Attach Build 54 to version 2.1.0
    console.log('\n4. Attaching build to version 2.1.0...');
    const patchRes = await api('PATCH', `/v1/appStoreVersions/${versionId}`, {
      data: {
        type: 'appStoreVersions',
        id: versionId,
        relationships: {
          build: { data: { type: 'builds', id: buildId } }
        }
      }
    });
    if (patchRes.status === 200) {
      console.log('   Build attached successfully!');
    } else {
      console.log(`   Attach result: ${patchRes.status}`, JSON.stringify(patchRes.data?.errors || patchRes.data, null, 2));
    }

    // Step 5: Submit for review (try old API first, then new)
    console.log('\n5. Submitting for App Store Review...');
    const submitRes = await api('POST', '/v1/appStoreVersionSubmissions', {
      data: {
        type: 'appStoreVersionSubmissions',
        relationships: {
          appStoreVersion: { data: { type: 'appStoreVersions', id: versionId } }
        }
      }
    });

    if (submitRes.status === 201 || submitRes.status === 200) {
      console.log('\n   SUCCESS! App submitted for Apple review!');
      return;
    }

    console.log(`   Old API returned ${submitRes.status}:`, JSON.stringify(submitRes.data?.errors?.[0]?.detail || submitRes.data, null, 2));
    console.log('   Trying newer reviewSubmissions API...');

    // New review submission API
    const newSubRes = await api('POST', '/v1/reviewSubmissions', {
      data: {
        type: 'reviewSubmissions',
        attributes: { platform: 'IOS' },
        relationships: { app: { data: { type: 'apps', id: APP_ID } } }
      }
    });

    if (newSubRes.status !== 201 && newSubRes.status !== 200) {
      console.log(`   Create review submission failed: ${newSubRes.status}`, JSON.stringify(newSubRes.data?.errors || newSubRes.data, null, 2));
      return;
    }

    const submissionId = newSubRes.data.data.id;
    console.log(`   Created review submission: ${submissionId}`);

    // Add version item
    const itemRes = await api('POST', '/v1/reviewSubmissionItems', {
      data: {
        type: 'reviewSubmissionItems',
        relationships: {
          reviewSubmission: { data: { type: 'reviewSubmissions', id: submissionId } },
          appStoreVersion: { data: { type: 'appStoreVersions', id: versionId } }
        }
      }
    });
    console.log(`   Added item: ${itemRes.status}`);

    // Confirm submission
    const confirmRes = await api('PATCH', `/v1/reviewSubmissions/${submissionId}`, {
      data: {
        type: 'reviewSubmissions',
        id: submissionId,
        attributes: { submitted: true }
      }
    });

    if (confirmRes.status === 200) {
      console.log('\n   SUCCESS! App submitted for Apple review!');
    } else {
      console.log(`   Confirm failed: ${confirmRes.status}`, JSON.stringify(confirmRes.data?.errors || confirmRes.data, null, 2));
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();

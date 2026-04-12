// Auto-discover build 67, attach to version, and submit for Apple review
const jwt = require('jsonwebtoken');
const https = require('https');
const fs = require('fs');
const path = require('path');

const KEY_ID = 'X79F2H3QXT';
const ISSUER_ID = '3ddd637a-4279-41fa-8c12-672a3c557cba';
const APP_ID = '6755155637';
const KEY_PATH = path.join(__dirname, 'AuthKey_X79F2H3QXT.p8');
const TARGET_BUILD_NUMBER = '67';

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
  try {
    // Step 1: Find the current app store version
    console.log('1. Finding current App Store version...');
    const versionsRes = await api('GET', `/v1/apps/${APP_ID}/appStoreVersions?filter[platform]=IOS&limit=5`);
    if (versionsRes.status !== 200) {
      console.log('   Failed to get versions:', versionsRes.status, JSON.stringify(versionsRes.data));
      return;
    }

    const versions = versionsRes.data.data || [];
    // Find a version that's editable (PREPARE_FOR_SUBMISSION, REJECTED, DEVELOPER_REJECTED, etc.)
    const editableStates = ['PREPARE_FOR_SUBMISSION', 'REJECTED', 'DEVELOPER_REJECTED', 'METADATA_REJECTED'];
    let version = versions.find(v => editableStates.includes(v.attributes.appStoreState));
    if (!version) {
      // Fall back to most recent version
      version = versions[0];
    }

    if (!version) {
      console.log('   No App Store version found!');
      return;
    }

    const VERSION_ID = version.id;
    const versionState = version.attributes.appStoreState;
    const versionString = version.attributes.versionString;
    console.log(`   Found version ${versionString} (${versionState})`);
    console.log(`   Version ID: ${VERSION_ID}`);

    // Step 2: Find build 67
    console.log(`\n2. Finding build ${TARGET_BUILD_NUMBER}...`);
    const buildsRes = await api('GET', `/v1/builds?filter[app]=${APP_ID}&filter[version]=${TARGET_BUILD_NUMBER}&limit=5`);
    
    let build = null;
    if (buildsRes.status === 200 && buildsRes.data.data && buildsRes.data.data.length > 0) {
      build = buildsRes.data.data[0];
    } else {
      // Try listing recent builds
      console.log('   Direct filter failed, listing recent builds...');
      const recentBuilds = await api('GET', `/v1/builds?filter[app]=${APP_ID}&sort=-uploadedDate&limit=10`);
      if (recentBuilds.status === 200) {
        const allBuilds = recentBuilds.data.data || [];
        build = allBuilds.find(b => b.attributes.version === TARGET_BUILD_NUMBER);
        if (!build) {
          console.log('   Available builds:');
          allBuilds.forEach(b => console.log(`   - Build ${b.attributes.version} (${b.attributes.processingState}) uploaded ${b.attributes.uploadedDate}`));
        }
      }
    }

    if (!build) {
      console.log(`   Build ${TARGET_BUILD_NUMBER} not found! Apple may still be processing the upload.`);
      console.log('   Wait a few minutes and try again.');
      return;
    }

    const BUILD_ID = build.id;
    const buildState = build.attributes.processingState;
    console.log(`   Found build ${TARGET_BUILD_NUMBER} - ID: ${BUILD_ID}`);
    console.log(`   Processing state: ${buildState}`);
    console.log(`   Uploaded: ${build.attributes.uploadedDate}`);

    if (buildState !== 'VALID') {
      console.log(`\n   ⚠ Build is still ${buildState}. Waiting for it to become VALID...`);
      if (buildState === 'PROCESSING') {
        console.log('   Apple is still processing. Try again in a few minutes.');
      } else if (buildState === 'FAILED') {
        console.log('   Build processing FAILED on Apple side. Check App Store Connect for details.');
      }
      return;
    }

    // Step 3: Check what build is currently attached
    console.log('\n3. Checking currently attached build...');
    const currentBuild = await api('GET', `/v1/appStoreVersions/${VERSION_ID}/build`);
    if (currentBuild.status === 200 && currentBuild.data.data) {
      const cb = currentBuild.data.data;
      console.log(`   Current build: ${cb.attributes.version} (ID: ${cb.id})`);
      if (cb.id === BUILD_ID) {
        console.log('   ✓ Build 67 is already attached!');
      } else {
        console.log(`   Different build attached. Will select build ${TARGET_BUILD_NUMBER}...`);
      }
    } else {
      console.log('   No build currently attached.');
    }

    // Step 4: Select build 67 for this version
    console.log(`\n4. Selecting build ${TARGET_BUILD_NUMBER} for version ${versionString}...`);
    const selectRes = await api('PATCH', `/v1/appStoreVersions/${VERSION_ID}/relationships/build`, {
      data: { type: 'builds', id: BUILD_ID }
    });
    if (selectRes.status === 204 || selectRes.status === 200 || selectRes.status === 409) {
      console.log('   ✓ Build selected successfully!');
    } else {
      console.log(`   Select result: ${selectRes.status}`);
      console.log('   ', JSON.stringify(selectRes.data?.errors?.[0]?.detail || selectRes.data));
    }

    // Step 5: Clean up old review submissions
    console.log('\n5. Cleaning up old review submissions...');
    const subsRes = await api('GET', `/v1/reviewSubmissions?filter[app]=${APP_ID}&filter[platform]=IOS&limit=10`);
    const submissions = subsRes.data.data || [];
    console.log(`   Found ${submissions.length} existing submission(s)`);

    for (const sub of submissions) {
      const state = sub.attributes.state;
      console.log(`   - ${sub.id}: ${state}`);
      if (['WAITING_FOR_REVIEW', 'IN_REVIEW', 'READY_FOR_REVIEW', 'UNRESOLVED_ISSUES'].includes(state)) {
        console.log(`     Cancelling...`);
        const cancelRes = await api('PATCH', `/v1/reviewSubmissions/${sub.id}`, {
          data: { type: 'reviewSubmissions', id: sub.id, attributes: { canceled: true } }
        });
        console.log(`     Cancel result: ${cancelRes.status}`);
      }
    }

    // Step 6: Create new review submission
    console.log('\n6. Creating new review submission...');
    await new Promise(r => setTimeout(r, 2000));

    const newSubRes = await api('POST', '/v1/reviewSubmissions', {
      data: {
        type: 'reviewSubmissions',
        attributes: { platform: 'IOS' },
        relationships: { app: { data: { type: 'apps', id: APP_ID } } }
      }
    });

    if (newSubRes.status !== 201 && newSubRes.status !== 200) {
      console.log(`   Create failed: ${newSubRes.status}`);
      console.log('  ', JSON.stringify(newSubRes.data?.errors || newSubRes.data, null, 2));

      // If concurrent limit, try harder cleanup
      if (JSON.stringify(newSubRes.data).includes('CONCURRENT_REVIEW_SUBMISSION_LIMIT')) {
        console.log('\n   Concurrent limit hit. Retrying after forced cleanup...');
        for (const sub of submissions) {
          await api('DELETE', `/v1/reviewSubmissions/${sub.id}`);
          await api('PATCH', `/v1/reviewSubmissions/${sub.id}`, {
            data: { type: 'reviewSubmissions', id: sub.id, attributes: { canceled: true } }
          });
        }
        await new Promise(r => setTimeout(r, 5000));

        const retryRes = await api('POST', '/v1/reviewSubmissions', {
          data: {
            type: 'reviewSubmissions',
            attributes: { platform: 'IOS' },
            relationships: { app: { data: { type: 'apps', id: APP_ID } } }
          }
        });

        if (retryRes.status === 201 || retryRes.status === 200) {
          const sid = retryRes.data.data.id;
          console.log(`   ✓ Created review submission on retry: ${sid}`);
          await submitReview(sid, VERSION_ID);
          return;
        }
        console.log(`   Retry also failed: ${retryRes.status}`);
        console.log('  ', JSON.stringify(retryRes.data?.errors || retryRes.data, null, 2));
      }
      return;
    }

    const submissionId = newSubRes.data.data.id;
    console.log(`   ✓ Created review submission: ${submissionId}`);

    await submitReview(submissionId, VERSION_ID);

  } catch (err) {
    console.error('Error:', err.message);
  }
}

async function submitReview(submissionId, versionId) {
  // Add the version to the submission
  console.log('\n7. Adding version to review submission...');
  const itemRes = await api('POST', '/v1/reviewSubmissionItems', {
    data: {
      type: 'reviewSubmissionItems',
      relationships: {
        reviewSubmission: { data: { type: 'reviewSubmissions', id: submissionId } },
        appStoreVersion: { data: { type: 'appStoreVersions', id: versionId } }
      }
    }
  });
  console.log(`   Result: ${itemRes.status}`);
  if (itemRes.status !== 201 && itemRes.status !== 200) {
    console.log('  ', JSON.stringify(itemRes.data?.errors || itemRes.data, null, 2));
  }

  // Submit
  console.log('\n8. Submitting for Apple review...');
  const confirmRes = await api('PATCH', `/v1/reviewSubmissions/${submissionId}`, {
    data: {
      type: 'reviewSubmissions',
      id: submissionId,
      attributes: { submitted: true }
    }
  });

  if (confirmRes.status === 200) {
    const finalState = confirmRes.data.data?.attributes?.state;
    console.log(`\n   ✅ SUCCESS! App submitted for Apple review!`);
    console.log(`   State: ${finalState}`);
    console.log(`   You'll receive an email when the review is complete.`);
  } else {
    console.log(`   Submit failed: ${confirmRes.status}`);
    console.log('  ', JSON.stringify(confirmRes.data?.errors || confirmRes.data, null, 2));
  }
}

main();

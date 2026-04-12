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

function api(urlPath) {
  return new Promise((resolve, reject) => {
    const token = createToken();
    const req = https.request({
      hostname: 'api.appstoreconnect.apple.com',
      path: urlPath,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data || '{}')); }
        catch { resolve(data); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

(async () => {
  console.log('=== FULL REJECTION ANALYSIS ===\n');

  // 1. Version details
  const ver = await api(`/v1/appStoreVersions/${VERSION_ID}?include=build&fields[builds]=version,processingState,uploadedDate`);
  console.log('Version:', ver.data?.attributes?.versionString, '| State:', ver.data?.attributes?.appStoreState);
  if (ver.included?.[0]) {
    console.log('Build:', ver.included[0].attributes?.version, '| Processing:', ver.included[0].attributes?.processingState);
  }

  // 2. Currently attached build
  const buildRel = await api(`/v1/appStoreVersions/${VERSION_ID}/build`);
  if (buildRel.data) {
    console.log('Attached build:', buildRel.data.attributes?.version, '| ID:', buildRel.data.id);
  }

  // 3. App Store Review Attachments (rejection screenshots/notes) 
  console.log('\n--- App Review Attachments ---');
  const reviewDetail = await api(`/v1/appStoreVersions/${VERSION_ID}/appStoreReviewDetail`);
  if (reviewDetail.data) {
    const rd = reviewDetail.data;
    console.log('Review Detail ID:', rd.id);
    console.log('Notes:', rd.attributes?.notes || '(none)');
    
    // Get attachments from review detail
    const attachments = await api(`/v1/appStoreReviewDetails/${rd.id}/appStoreReviewAttachments`);
    console.log('Attachments:', JSON.stringify(attachments.data || [], null, 2));
  }

  // 4. Rejection submission items
  console.log('\n--- Latest Rejection Submission ---');
  const subId = 'bbebf6c9-e0cc-4530-bb6c-e4f04fb9f3ce';
  const subDetail = await api(`/v1/reviewSubmissions/${subId}?include=items`);
  console.log('Submission state:', subDetail.data?.attributes?.state);
  console.log('Submitted:', subDetail.data?.attributes?.submittedDate);
  if (subDetail.included) {
    for (const item of subDetail.included) {
      console.log('  Item:', item.id, '| state:', item.attributes?.state, '| resolved:', item.attributes?.resolved);
    }
  }

  // 5. Get submission items directly
  const items = await api(`/v1/reviewSubmissions/${subId}/items`);
  console.log('\nItems from /items endpoint:');
  for (const item of (items.data || [])) {
    console.log('  Item:', item.id, '| state:', item.attributes?.state);
    console.log('  Full attributes:', JSON.stringify(item.attributes, null, 2));
  }

  // 6. Try appStoreVersions rejection response  
  console.log('\n--- Version Phased Release / Rejection ---');
  const rejection = await api(`/v1/appStoreVersions/${VERSION_ID}?fields[appStoreVersions]=appStoreState,versionString,releaseType,reviewType`);
  console.log(JSON.stringify(rejection.data?.attributes, null, 2));

  // 7. Try to get customer review response / resolution center
  console.log('\n--- Submission Messages ---');
  // Try the newer endpoint for submission feedback
  const feedback = await api(`/v2/reviewSubmissions/${subId}`);
  console.log('V2 submission:', JSON.stringify(feedback, null, 2).substring(0, 1500));

  // 8. Check the older completed submission that was REJECTED
  console.log('\n--- Previous Rejection (46edece3) ---');
  const oldSubId = '46edece3-781d-45a0-b116-a3ea7cdfdc8b';
  const oldItems = await api(`/v1/reviewSubmissions/${oldSubId}/items`);
  for (const item of (oldItems.data || [])) {
    console.log('  Item:', item.id, '| state:', item.attributes?.state);
  }

  // 9. App store version rejection reasons via appMessages if available
  console.log('\n--- Resolution Center Messages ---');
  const resMessages = await api(`/v1/appStoreVersions/${VERSION_ID}/appClipDefaultExperienceLocalizations`);
  console.log('(experimental endpoint):', resMessages.errors ? 'N/A' : JSON.stringify(resMessages, null, 2).substring(0, 500));

})();

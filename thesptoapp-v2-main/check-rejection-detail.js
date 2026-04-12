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
  console.log('=== REJECTION DETAILS FOR v2.1.0 ===\n');

  // Version state and build
  const ver = await api(`/v1/appStoreVersions/${VERSION_ID}?include=build`);
  if (ver.data) {
    const a = ver.data.attributes;
    console.log('Version:', a.versionString, '| State:', a.appStoreState);
  }

  const build = await api(`/v1/appStoreVersions/${VERSION_ID}/build`);
  if (build.data) {
    console.log('Build:', build.data.attributes.version, '| State:', build.data.attributes.processingState);
  }

  // Review detail
  console.log('\n--- Review Detail ---');
  const rd = await api(`/v1/appStoreVersions/${VERSION_ID}/appStoreReviewDetail`);
  if (rd.data) {
    const a = rd.data.attributes;
    console.log('Demo user:', a.demoAccountName || '(none)');
    console.log('Demo pass set:', a.demoAccountPassword ? 'yes' : 'NO');
    console.log('Notes:', a.notes || '(none)');
  }

  // Completed submissions - check item states
  console.log('\n--- Submission Items ---');
  const allSubs = await api(`/v1/reviewSubmissions?filter[app]=${APP_ID}&filter[platform]=IOS&limit=10`);
  for (const s of (allSubs.data || [])) {
    const a = s.attributes;
    if (a.state === 'COMPLETE' || a.state === 'UNRESOLVED_ISSUES') {
      console.log(`\nSubmission ${s.id}: ${a.state}`);
      console.log(`  Submitted: ${a.submittedDate}`);
      const items = await api(`/v1/reviewSubmissions/${s.id}/items`);
      for (const item of (items.data || [])) {
        console.log(`  Item state: ${item.attributes.state}`);
        console.log(`  Item resolved: ${item.attributes.resolved}`);
      }
    }
  }

  // Check via appStoreVersions resolutionNote (if available)
  console.log('\n--- Version Rejection Info ---');
  const rejInfo = await api(`/v1/appStoreVersions/${VERSION_ID}?fields[appStoreVersions]=appStoreState,versionString,releaseType,createdDate`);
  if (rejInfo.data) {
    console.log(JSON.stringify(rejInfo.data.attributes, null, 2));
  }

})();

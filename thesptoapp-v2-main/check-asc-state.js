// check-asc-state.js
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

async function main() {
  console.log('--- Checking App Store Connect State ---');

  const fields = [
    'appStoreState',
    'build',
    'appStoreVersionPhasedRelease',
    'appStoreVersionSubmission',
    'appReviewSubmissions',
    'versionString',
    'releaseType',
    'earliestReleaseDate',
    'usesIdfa',
    'isWatchOnly',
    'downloadable',
    'createdDate'
  ].join(',');

  const include = [
    'build',
    'appStoreVersionSubmission',
    'appStoreVersionSubmission.appReviewAttachments',
    'appReviewSubmissions'
  ].join(',');

  const url = `/v1/appStoreVersions/${VERSION_ID}?fields[appStoreVersions]=${fields}&include=${include}&limit[appReviewSubmissions]=5`;

  const resp = await ascRequest('GET', url);

  console.log('--- Full Response ---');
  console.log(JSON.stringify(resp.data, null, 2));

  const version = resp.data?.data;
  if (version) {
    console.log('\n--- Summary ---');
    console.log('Version:', version.attributes.versionString);
    console.log('State:', version.attributes.appStoreState);
    
    const buildData = resp.data.included?.find(inc => inc.type === 'builds');
    if (buildData) {
      console.log('Build:', buildData.attributes.version);
    }

    const submission = resp.data.included?.find(inc => inc.type === 'appStoreVersionSubmissions');
    if (submission) {
      console.log('Submission State:', submission.attributes.state);
    }
    
    const reviewSubmissions = resp.data.included?.filter(inc => inc.type === 'appReviewSubmissions');
    if (reviewSubmissions?.length > 0) {
        console.log(`\nFound ${reviewSubmissions.length} recent review submissions:`);
        reviewSubmissions.forEach(sub => {
            console.log(`- ID: ${sub.id}, State: ${sub.attributes.state}, Submitted: ${sub.attributes.submittedDate}`);
        });
    }
  }
}

main().catch(err => { console.error('FATAL SCRIPT ERROR:', err.message, err.stack); process.exit(1); });

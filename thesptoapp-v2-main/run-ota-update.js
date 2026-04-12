const { execSync } = require('child_process');
const fs = require('fs');

try {
  console.log('Starting EAS update...');
  const result = execSync(
    'eas update --branch production --message "Fix crash on launch - startup non-fatal" --non-interactive',
    {
      cwd: __dirname,
      encoding: 'utf8',
      timeout: 600000, // 10 minutes
      env: { ...process.env, NO_COLOR: '1', CI: '1', EAS_SKIP_AUTO_FINGERPRINT: '1' },
      stdio: ['pipe', 'pipe', 'pipe']
    }
  );
  // Strip non-printable chars
  const clean = result.replace(/[^\x20-\x7e\n\r\t]/g, '').replace(/\r/g, '');
  const lines = clean.split('\n').filter(l => l.trim());
  console.log('=== OTA UPDATE RESULT ===');
  lines.forEach(l => console.log(l));
  fs.writeFileSync(__dirname + '/ota_result_final.txt', lines.join('\n'));
} catch (err) {
  const stdout = (err.stdout || '').replace(/[^\x20-\x7e\n\r\t]/g, '');
  const stderr = (err.stderr || '').replace(/[^\x20-\x7e\n\r\t]/g, '');
  const lines = (stdout + '\n' + stderr).split('\n').filter(l => l.trim());
  console.log('=== OTA UPDATE ERROR ===');
  lines.forEach(l => console.log(l));
  fs.writeFileSync(__dirname + '/ota_result_final.txt', 'EXIT CODE: ' + err.status + '\n' + lines.join('\n'));
}

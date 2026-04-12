const { execSync } = require('child_process');
try {
  const raw = execSync('eas build:view 10c24976-4c38-43e8-b711-fb3e1405c304 --json', {
    encoding: 'utf8', env: { ...process.env, NO_COLOR: '1', CI: '1' }, timeout: 30000
  });
  const clean = raw.replace(/[^\x20-\x7e\n\r\t]/g, '');
  const lines = clean.split('\n');
  const jsonStart = lines.findIndex(l => l.trim().startsWith('{'));
  if (jsonStart >= 0) {
    const j = JSON.parse(lines.slice(jsonStart).join('\n'));
    console.log('runtimeVersion:', j.runtimeVersion);
    console.log('channel:', j.channel);
    console.log('appVersion:', j.appVersion);
    console.log('appBuildVersion:', j.appBuildVersion);
    console.log('distribution:', j.distribution);
    console.log('status:', j.status);
    console.log('sdkVersion:', j.sdkVersion);
    console.log('gitCommitHash:', j.gitCommitHash);
    console.log('updatesChannel:', j.updates?.channel);
  } else {
    console.log('No JSON found, tail:', clean.slice(-300));
  }
} catch (e) {
  const out = (e.stdout || '').replace(/[^\x20-\x7e\n\r\t]/g, '');
  const err = (e.stderr || '').replace(/[^\x20-\x7e\n\r\t]/g, '');
  console.log('STDOUT tail:', out.slice(-500));
  console.log('STDERR tail:', err.slice(-500));
}

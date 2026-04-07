const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const logFile = path.join(__dirname, 'build_log_new.txt');
fs.writeFileSync(logFile, 'Starting build at ' + new Date().toISOString() + '\n');

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 4000;

function append(text) {
  fs.appendFileSync(logFile, text);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function runAttempt(attempt) {
  return new Promise((resolve) => {
    const header = `\n[Attempt ${attempt}/${MAX_ATTEMPTS}] Starting at ${new Date().toISOString()}\n`;
    process.stdout.write(header);
    append(header);

    const proc = spawn('cmd.exe', ['/d', '/s', '/c', 'npx eas build --platform ios --profile production --non-interactive --no-wait'], {
      cwd: __dirname,
      shell: false,
      env: {
        ...process.env,
        NODE_OPTIONS: `${process.env.NODE_OPTIONS ? process.env.NODE_OPTIONS + ' ' : ''}--dns-result-order=ipv4first`,
        EAS_BUILD_NO_EXPO_GO_WARNING: 'true',
      },
    });

    proc.stdout.on('data', (data) => {
      const text = data.toString();
      process.stdout.write(text);
      append(text);
    });

    proc.stderr.on('data', (data) => {
      const text = data.toString();
      process.stderr.write(text);
      append('STDERR: ' + text);
    });

    proc.on('close', (code) => {
      const msg = `\nAttempt ${attempt} exited with code: ${code} at ${new Date().toISOString()}\n`;
      console.log(msg);
      append(msg);
      resolve(code === 0);
    });
  });
}

async function main() {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    const ok = await runAttempt(attempt);
    if (ok) {
      process.exit(0);
    }
    if (attempt < MAX_ATTEMPTS) {
      const retryMsg = `Retrying in ${RETRY_DELAY_MS}ms...\n`;
      process.stdout.write(retryMsg);
      append(retryMsg);
      await sleep(RETRY_DELAY_MS);
    }
  }
  process.exit(1);
}

main().catch((error) => {
  const msg = `Fatal error in build launcher: ${error?.message || error}\n`;
  console.error(msg);
  append(msg);
  process.exit(1);
});

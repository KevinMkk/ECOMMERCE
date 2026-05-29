const fs = require('fs');
const path = require('path');
const http = require('http');
const { spawn } = require('child_process');

const WEB_ROOT = path.resolve(__dirname, '..');
const REPO_ROOT = path.resolve(__dirname, '..', '..');
const PID_FILE = path.join(__dirname, '.test-server-pids.json');
const VITE_URL = 'http://127.0.0.1:5173';
const BACKEND_URL = 'http://127.0.0.1:4000';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function isUrlAvailable(url) {
  return new Promise(resolve => {
    try {
      const req = http.request(url, { method: 'HEAD', timeout: 2000 }, res => {
        res.resume();
        resolve(true);
      });

      req.on('error', () => resolve(false));
      req.on('timeout', () => {
        req.destroy();
        resolve(false);
      });

      req.end();
    } catch (err) {
      resolve(false);
    }
  });
}

async function waitForUrl(url, timeoutMs = 30000) {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    if (await isUrlAvailable(url)) {
      return;
    }
    await delay(500);
  }

  throw new Error(`Timed out waiting for ${url}`);
}

function startCommand(command, args, options) {
  const proc = spawn(command, args, options);

  proc.stdout?.on('data', data => {
    process.stdout.write(`[server setup] ${data.toString()}`);
  });

  proc.stderr?.on('data', data => {
    process.stderr.write(`[server setup] ${data.toString()}`);
  });

  proc.on('exit', (code, signal) => {
    console.log(`[server setup] process exited with code=${code} signal=${signal}`);
  });

  return proc;
}

module.exports = async () => {
  const pids = {
    vite: null,
    backend: null,
  };

  const backendRunning = await isUrlAvailable(BACKEND_URL);
  if (!backendRunning) {
    const backendPath = path.join(REPO_ROOT, 'backend', 'src', 'server.js');
    const backendProc = startCommand(process.execPath, [backendPath], {
      cwd: path.join(REPO_ROOT, 'backend'),
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    pids.backend = backendProc.pid;
    await waitForUrl(BACKEND_URL);
  }

  const viteRunning = await isUrlAvailable(VITE_URL);
  if (!viteRunning) {
    const vitePath = path.join(WEB_ROOT, 'node_modules', 'vite', 'bin', 'vite.js');
    const viteProc = startCommand(process.execPath, [vitePath, '--host', '127.0.0.1', '--port', '5173'], {
      cwd: WEB_ROOT,
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    pids.vite = viteProc.pid;
    await waitForUrl(VITE_URL);
  }

  fs.writeFileSync(PID_FILE, JSON.stringify(pids, null, 2));
};

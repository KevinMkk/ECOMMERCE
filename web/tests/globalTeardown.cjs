const fs = require('fs');
const path = require('path');

const PID_FILE = path.join(__dirname, '.test-server-pids.json');

module.exports = async () => {
  if (!fs.existsSync(PID_FILE)) {
    return;
  }

  let pids;
  try {
    pids = JSON.parse(fs.readFileSync(PID_FILE, 'utf8'));
  } catch (error) {
    console.error('Failed to read PID file:', error.message);
    return;
  }

  for (const name of ['vite', 'backend']) {
    const pid = pids[name];
    if (!pid) {
      continue;
    }

    try {
      process.kill(pid);
      console.log(`[server teardown] terminated ${name} (pid ${pid})`);
    } catch (error) {
      console.warn(`[server teardown] could not terminate ${name} (pid ${pid}): ${error.message}`);
    }
  }

  try {
    fs.unlinkSync(PID_FILE);
  } catch (error) {
    console.warn('Failed to remove PID file:', error.message);
  }
};

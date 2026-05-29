// tests/utils/reporter.js

const fs = require('fs');
const path = require('path');

const reportsDir = path.join(__dirname, '../../reports');

if (!fs.existsSync(reportsDir)) {
  fs.mkdirSync(reportsDir, { recursive: true });
}

const reportFile = path.join(reportsDir, 'test-report.txt');
const summaryFile = path.join(reportsDir, 'summary.json');

// Create initial files so reports exist even if tests fail early
const initialHeader = `TEST RUN STARTED: ${new Date().toISOString()}\n\n`;
if (!fs.existsSync(reportFile)) {
  safeWrite(reportFile, initialHeader);
}
if (!fs.existsSync(summaryFile)) {
  safeWrite(summaryFile, JSON.stringify([], null, 2));
}

function safeAppend(filePath, content) {
  try {
    fs.appendFileSync(filePath, content);
  } catch (err) {
    console.error(`Failed writing to ${filePath}:`, err.message);
  }
}

function safeWrite(filePath, content) {
  try {
    fs.writeFileSync(filePath, content);
  } catch (err) {
    console.error(`Failed writing to ${filePath}:`, err.message);
  }
}

function sanitizeFileName(name) {
  return name.replace(/[^a-z0-9._-]/gi, '_').slice(0, 200);
}

function logTestResult({
  suite,
  testName,
  status,
  functionalities = [],
  expected,
  actual,
  error = null,
  screenshot = null,
  duration = null
}) {
  const timeNow = new Date().toISOString();

  const report = `\n====================================================\nTEST SUITE: ${suite}\nTEST CASE: ${testName}\nSTATUS: ${status}\nTIME: ${timeNow}\nDURATION: ${duration}\n====================================================\n\nFUNCTIONALITIES VERIFIED:\n${functionalities.map(item => `✔ ${item}`).join('\n')}\n\nEXPECTED RESULT:\n${expected}\n\nACTUAL RESULT:\n${actual}\n\n${error ? `ERROR DETAILS:\n${error}\n` : ''}\n${screenshot ? `SCREENSHOT:\n${screenshot}\n` : ''}\n====================================================\n\n`;

  // Append to aggregate report
  safeAppend(reportFile, report);

  // Write per-test file for quick access
  const perTestName = sanitizeFileName(`${suite}__${testName}__${timeNow}`) + '.txt';
  const perTestPath = path.join(reportsDir, perTestName);
  safeWrite(perTestPath, report);

  // Update JSON summary
  let summary = [];
  try {
    if (fs.existsSync(summaryFile)) {
      const raw = fs.readFileSync(summaryFile, 'utf8');
      summary = raw ? JSON.parse(raw) : [];
    }
  } catch (err) {
    console.error('Failed reading summary file:', err.message);
    summary = [];
  }

  summary.push({
    suite,
    testName,
    status,
    time: timeNow,
    duration,
    reportFile: perTestName,
    screenshot
  });

  safeWrite(summaryFile, JSON.stringify(summary, null, 2));
}

module.exports = { logTestResult };

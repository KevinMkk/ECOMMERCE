// tests/utils/screenshot.js

const fs = require('fs');
const path = require('path');

const screenshotDir = path.join(__dirname, '../../reports/screenshots');

if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

async function takeScreenshot(driver, fileName) {

    const image = await driver.takeScreenshot();

    const filePath = path.join(screenshotDir, fileName);

    fs.writeFileSync(filePath, image, 'base64');

    return filePath;
}

module.exports = { takeScreenshot };

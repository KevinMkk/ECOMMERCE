const chromedriver = require('chromedriver');
const chrome = require('selenium-webdriver/chrome');
const { Builder } = require('selenium-webdriver');

function buildChromeDriver(additionalArgs = []) {
  const options = new chrome.Options().addArguments([
    '--headless',
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--window-size=1920,1080',
    ...additionalArgs,
  ]);

  const service = new chrome.ServiceBuilder(chromedriver.path);

  return new Builder()
    .forBrowser('chrome')
    .setChromeService(service)
    .setChromeOptions(options)
    .build();
}

module.exports = { buildChromeDriver };

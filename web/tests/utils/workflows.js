const { By, until } = require('selenium-webdriver');

const BASE_URL = 'http://127.0.0.1:5173';

const testAddress = {
  fullName: 'Alice Demo',
  phoneNumber: '+26658881234',
  identityNumber: 'ID123456789',
  town: 'Maseru',
  village: 'Maseru Central',
  streetName: 'Kingsway Road',
  buildingNumber: '42',
};

async function clickWhenReady(driver, locator, timeout = 10000) {
  const element = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementIsVisible(element), timeout);
  await driver.wait(until.elementIsEnabled(element), timeout);
  await element.click();
  return element;
}

async function typeInto(driver, locator, value, timeout = 10000) {
  const element = await driver.wait(until.elementLocated(locator), timeout);
  await driver.wait(until.elementIsVisible(element), timeout);
  await element.clear();
  await element.sendKeys(value);
  return element;
}

async function clearAppState(driver) {
  await driver.get(BASE_URL);
  await driver.executeScript(() => {
    localStorage.removeItem('session');
    localStorage.removeItem('userCountry');
    localStorage.removeItem('savedAddresses');
  });
}

async function selectCountryIfPrompted(driver, country = 'Lesotho') {
  const options = await driver.findElements(
    By.xpath(`//button[contains(@class,'countryOption') and .//*[normalize-space()='${country}']]`)
  );

  if (options.length > 0) {
    await options[0].click();
  }

  await driver.wait(until.elementLocated(By.className('siteHeader')), 10000);
}

async function openStorefront(driver, { reset = true, country = 'Lesotho' } = {}) {
  if (reset) {
    await clearAppState(driver);
  }

  await driver.get(BASE_URL);
  await selectCountryIfPrompted(driver, country);
  await driver.wait(until.elementLocated(By.className('productCard')), 15000);
}

async function loginAsDemoCustomer(driver) {
  await clickWhenReady(driver, By.xpath("//button[normalize-space()='Sign In']"));
  await clickWhenReady(driver, By.xpath("//button[contains(.,'Demo Customer')]"));
  return driver.wait(until.elementLocated(By.xpath("//span[contains(text(),'Alice')]")), 10000);
}

async function loginAsAdmin(driver) {
  await clickWhenReady(driver, By.xpath("//button[normalize-space()='Sign In']"));
  await typeInto(driver, By.xpath("//input[@placeholder='your@email.com']"), 'admin@datamak.test');
  await typeInto(driver, By.xpath("//input[@placeholder='Your password']"), 'Admin123!');
  await clickWhenReady(driver, By.xpath("//button[@type='submit']"));
  return driver.wait(until.elementLocated(By.xpath("//span[contains(text(),'Admin')]")), 10000);
}

async function addFirstProductToCart(driver) {
  await clickWhenReady(driver, By.xpath("//button[contains(.,'Add to Cart')]"), 15000);
  await driver.wait(until.elementLocated(By.className('cartBadge')), 10000);
}

async function openCart(driver) {
  await clickWhenReady(driver, By.xpath("//button[.//span[normalize-space()='Cart']]"));
  await driver.wait(until.elementLocated(By.className('pageCart')), 10000);
}

async function selectAllCartItems(driver) {
  const checkbox = await driver.wait(until.elementLocated(By.id('selectAll')), 10000);
  if (!(await checkbox.isSelected())) {
    await checkbox.click();
  }
  await driver.wait(until.elementLocated(By.xpath("//button[contains(.,'Checkout') and not(@disabled)]")), 10000);
}

async function completeCheckout(driver) {
  await openCart(driver);
  await selectAllCartItems(driver);
  await clickWhenReady(driver, By.xpath("//button[contains(.,'Checkout') and not(@disabled)]"));

  await clickWhenReady(driver, By.xpath("//button[contains(.,'Add New Address')]"));
  await typeInto(driver, By.xpath("//input[@placeholder='Your full name']"), testAddress.fullName);
  await typeInto(driver, By.xpath("//input[contains(@placeholder,'xxxxxxxx')]"), testAddress.phoneNumber);
  await typeInto(driver, By.xpath("//input[@placeholder='National ID or passport number']"), testAddress.identityNumber);
  await typeInto(driver, By.xpath("//input[@placeholder='Town']"), testAddress.town);
  await typeInto(driver, By.xpath("//input[@placeholder='Village']"), testAddress.village);
  await typeInto(driver, By.xpath("//input[@placeholder='Street name']"), testAddress.streetName);
  await typeInto(driver, By.xpath("//input[@placeholder='Building / house no.']"), testAddress.buildingNumber);
  await clickWhenReady(driver, By.xpath("//button[normalize-space()='Save Address']"));

  await clickWhenReady(driver, By.xpath("//button[contains(.,'Continue to Payment')]"));
  await clickWhenReady(driver, By.xpath("//label[contains(@class,'paymentOption')][.//input[@value='PayPal']]"));
  await clickWhenReady(driver, By.xpath("//button[contains(.,'Review Order')]"));
  await clickWhenReady(driver, By.xpath("//button[contains(.,'Place Order')]"), 15000);

  return driver.wait(until.elementLocated(By.className('successModal')), 15000);
}

module.exports = {
  BASE_URL,
  addFirstProductToCart,
  clickWhenReady,
  completeCheckout,
  loginAsAdmin,
  loginAsDemoCustomer,
  openCart,
  openStorefront,
  selectCountryIfPrompted,
  typeInto,
};

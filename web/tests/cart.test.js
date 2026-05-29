// tests/cart.test.js

const { By, until } = require('selenium-webdriver');
const { buildChromeDriver } = require('./utils/driver');
const { addFirstProductToCart, loginAsDemoCustomer, openStorefront } = require('./utils/workflows');

const { logTestResult } = require('./utils/reporter');
const { takeScreenshot } = require('./utils/screenshot');

jest.setTimeout(180000);

describe('Ecommerce Cart Test', () => {

    let driver;

    beforeAll(async () => {

        driver = await buildChromeDriver();
    });

    afterAll(async () => {

        if (driver) {
            await driver.quit();
        }
    });

    test('Add item to cart after login', async () => {

        const start = Date.now();

        try {

            await openStorefront(driver);
            await loginAsDemoCustomer(driver);
            await addFirstProductToCart(driver);

            const cartBadge = await driver.wait(
                until.elementLocated(
                    By.xpath("//span[@class='cartBadge']")
                ),
                10000
            );

            const badgeText = await cartBadge.getText();

            expect(parseInt(badgeText, 10)).toBeGreaterThan(0);

            const screenshot = await takeScreenshot(
                driver,
                'cart-added-success.png'
            );

            logTestResult({
                suite: 'Cart Test',
                testName: 'Add item to cart after login',
                status: 'PASSED',
                functionalities: [
                    'Customer login',
                    'Cart addition',
                    'Cart quantity update',
                    'Cart badge rendering'
                ],
                expected: 'Cart badge should display at least 1 item',
                actual: `Cart badge displayed: ${badgeText}`,
                screenshot,
                duration: `${(Date.now() - start) / 1000}s`
            });

        } catch (error) {

            const screenshot = await takeScreenshot(
                driver,
                'cart-add-failed.png'
            );

            logTestResult({
                suite: 'Cart Test',
                testName: 'Add item to cart after login',
                status: 'FAILED',
                functionalities: [
                    'Cart functionality validation'
                ],
                expected: 'Item should be added to cart',
                actual: 'Cart update failed',
                error: error.stack,
                screenshot,
                duration: `${(Date.now() - start) / 1000}s`
            });

            throw error;
        }
    });
});

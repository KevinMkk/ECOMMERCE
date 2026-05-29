// tests/products.test.js

const { By, until } = require('selenium-webdriver');
const { buildChromeDriver } = require('./utils/driver');
const { openStorefront } = require('./utils/workflows');

const { logTestResult } = require('./utils/reporter');
const { takeScreenshot } = require('./utils/screenshot');

jest.setTimeout(180000);

describe('Ecommerce Products Test', () => {

    let driver;

    beforeAll(async () => {

        driver = await buildChromeDriver();
    });

    afterAll(async () => {

        if (driver) {
            await driver.quit();
        }
    });

    test('Browse products on homepage', async () => {

        const start = Date.now();

        try {

            await openStorefront(driver);

            const productCards = await driver.wait(
                until.elementsLocated(
                    By.className('productCard')
                ),
                10000
            );

            expect(productCards.length).toBeGreaterThan(0);

            const screenshot = await takeScreenshot(
                driver,
                'products-loaded.png'
            );

            logTestResult({
                suite: 'Products Test',
                testName: 'Browse products on homepage',
                status: 'PASSED',
                functionalities: [
                    'Product retrieval',
                    'Homepage rendering',
                    'Product card display'
                ],
                expected: 'Country-selected homepage should display products',
                actual: `${productCards.length} products displayed after selecting shopping country`,
                screenshot,
                duration: `${(Date.now() - start) / 1000}s`
            });

        } catch (error) {

            const screenshot = await takeScreenshot(
                driver,
                'products-load-failed.png'
            );

            logTestResult({
                suite: 'Products Test',
                testName: 'Browse products on homepage',
                status: 'FAILED',
                functionalities: [
                    'Homepage product rendering'
                ],
                expected: 'Products should load',
                actual: 'No products displayed',
                error: error.stack,
                screenshot,
                duration: `${(Date.now() - start) / 1000}s`
            });

            throw error;
        }
    });
});

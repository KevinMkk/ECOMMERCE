// tests/admin.test.js

const { By, until } = require('selenium-webdriver');
const { buildChromeDriver } = require('./utils/driver');
const { clickWhenReady, loginAsAdmin, openStorefront } = require('./utils/workflows');

const { logTestResult } = require('./utils/reporter');
const { takeScreenshot } = require('./utils/screenshot');

jest.setTimeout(180000);

describe('Ecommerce Admin Test', () => {

    let driver;

    beforeAll(async () => {

        driver = await buildChromeDriver();
    });

    afterAll(async () => {

        if (driver) {
            await driver.quit();
        }
    });

    test('Admin login and access admin panel', async () => {

        const start = Date.now();

        try {

            await openStorefront(driver);
            await loginAsAdmin(driver);

            await clickWhenReady(
                driver,
                By.xpath("(//button[contains(@class,'headerAction')][.//span[normalize-space()='Admin']])[last()]")
            );

            const adminPanel = await driver.wait(
                until.elementLocated(
                    By.className('pageAdmin')
                ),
                10000
            );

            expect(adminPanel).toBeTruthy();

            const screenshot = await takeScreenshot(
                driver,
                'admin-panel-success.png'
            );

            logTestResult({
                suite: 'Admin Test',
                testName: 'Admin login and access admin panel',
                status: 'PASSED',
                functionalities: [
                    'Admin authentication',
                    'Admin navigation',
                    'Admin dashboard rendering',
                    'Role access control'
                ],
                expected: 'Admin dashboard should load',
                actual: 'Admin dashboard loaded successfully',
                screenshot,
                duration: `${(Date.now() - start) / 1000}s`
            });

        } catch (error) {

            const screenshot = await takeScreenshot(
                driver,
                'admin-panel-failed.png'
            );

            logTestResult({
                suite: 'Admin Test',
                testName: 'Admin login and access admin panel',
                status: 'FAILED',
                functionalities: [
                    'Admin functionality validation'
                ],
                expected: 'Admin dashboard should open',
                actual: 'Admin dashboard inaccessible',
                error: error.stack,
                screenshot,
                duration: `${(Date.now() - start) / 1000}s`
            });

            throw error;
        }
    });
});

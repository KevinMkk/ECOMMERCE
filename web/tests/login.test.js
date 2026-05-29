// tests/login.test.js

const { By, until } = require('selenium-webdriver');
const { buildChromeDriver } = require('./utils/driver');
const { BASE_URL, loginAsAdmin, loginAsDemoCustomer, openStorefront, typeInto } = require('./utils/workflows');

const { logTestResult } = require('./utils/reporter');
const { takeScreenshot } = require('./utils/screenshot');

jest.setTimeout(180000);

describe('Ecommerce Login Test', () => {

    let driver;

    beforeAll(async () => {

        driver = await buildChromeDriver();
    });

    afterAll(async () => {

        if (driver) {
            await driver.quit();
        }
    });

    test('Loads homepage correctly', async () => {

        const start = Date.now();

        try {

            await openStorefront(driver);

            const title = await driver.getTitle();

            expect(title).toContain('E-Commerce');

            const screenshot = await takeScreenshot(
                driver,
                'homepage-loaded.png'
            );

            logTestResult({
                suite: 'Login Test',
                testName: 'Loads homepage correctly',
                status: 'PASSED',
                functionalities: [
                    'Homepage accessible',
                    'Browser loaded frontend',
                    'Page title validation'
                ],
                expected: 'Homepage should pass the country selection gate and title should contain E-Commerce',
                actual: `Country selected and page title loaded: ${title}`,
                screenshot,
                duration: `${(Date.now() - start) / 1000}s`
            });

        } catch (error) {

            const screenshot = await takeScreenshot(
                driver,
                'homepage-load-failed.png'
            );

            logTestResult({
                suite: 'Login Test',
                testName: 'Loads homepage correctly',
                status: 'FAILED',
                functionalities: [
                    'Homepage accessibility validation'
                ],
                expected: 'Homepage should load successfully',
                actual: 'Homepage failed to load',
                error: error.stack,
                screenshot,
                duration: `${(Date.now() - start) / 1000}s`
            });

            throw error;
        }
    });

    test('Successful login with demo customer', async () => {

        const start = Date.now();

        try {

            await openStorefront(driver);
            await loginAsDemoCustomer(driver);

            const userName = await driver.wait(
                until.elementLocated(
                    By.xpath("//span[contains(text(),'Alice')]")
                ),
                10000
            );

            const text = await userName.getText();

            expect(text).toContain('Alice');

            const screenshot = await takeScreenshot(
                driver,
                'customer-login-success.png'
            );

            logTestResult({
                suite: 'Login Test',
                testName: 'Successful login with demo customer',
                status: 'PASSED',
                functionalities: [
                    'Sign In button accessible',
                    'Demo login available',
                    'Customer authentication',
                    'Session creation',
                    'Username displayed'
                ],
                expected: 'Alice should login successfully',
                actual: `Logged in as: ${text}`,
                screenshot,
                duration: `${(Date.now() - start) / 1000}s`
            });

        } catch (error) {

            const screenshot = await takeScreenshot(
                driver,
                'customer-login-failed.png'
            );

            logTestResult({
                suite: 'Login Test',
                testName: 'Successful login with demo customer',
                status: 'FAILED',
                functionalities: [
                    'Customer authentication validation'
                ],
                expected: 'User should login successfully',
                actual: 'Customer login failed',
                error: error.stack,
                screenshot,
                duration: `${(Date.now() - start) / 1000}s`
            });

            throw error;
        }
    });

    test('Failed login with invalid credentials', async () => {

        const start = Date.now();

        try {

            await openStorefront(driver);

            const signInButton = await driver.wait(
                until.elementLocated(
                    By.xpath("//button[text()='Sign In']")
                ),
                10000
            );

            await signInButton.click();

            await typeInto(driver, By.xpath("//input[@placeholder='your@email.com']"), 'invalid@example.com');
            await typeInto(driver, By.xpath("//input[@placeholder='Your password']"), 'wrongpassword');

            const submitButton = await driver.findElement(
                By.xpath("//button[@type='submit']")
            );

            await submitButton.click();

            await driver.sleep(2000);

            const currentUrl = await driver.getCurrentUrl();

            expect(currentUrl).toBe(`${BASE_URL}/`);

            const screenshot = await takeScreenshot(
                driver,
                'invalid-login-validation.png'
            );

            logTestResult({
                suite: 'Login Test',
                testName: 'Failed login with invalid credentials',
                status: 'PASSED',
                functionalities: [
                    'Login form validation',
                    'Invalid credential rejection',
                    'Authentication security'
                ],
                expected: 'System should reject invalid credentials',
                actual: 'Invalid login blocked successfully',
                screenshot,
                duration: `${(Date.now() - start) / 1000}s`
            });

        } catch (error) {

            const screenshot = await takeScreenshot(
                driver,
                'invalid-login-failure.png'
            );

            logTestResult({
                suite: 'Login Test',
                testName: 'Failed login with invalid credentials',
                status: 'FAILED',
                functionalities: [
                    'Authentication rejection validation'
                ],
                expected: 'Invalid login should fail',
                actual: 'System behavior unexpected',
                error: error.stack,
                screenshot,
                duration: `${(Date.now() - start) / 1000}s`
            });

            throw error;
        }
    });

    test('Successful admin login', async () => {

        const start = Date.now();

        try {

            await openStorefront(driver);
            await loginAsAdmin(driver);

            const adminText = await driver.wait(
                until.elementLocated(
                    By.xpath("//span[contains(text(),'Admin')]")
                ),
                10000
            );

            expect(await adminText.getText()).toContain('Admin');

            const screenshot = await takeScreenshot(
                driver,
                'admin-login-success.png'
            );

            logTestResult({
                suite: 'Login Test',
                testName: 'Successful admin login',
                status: 'PASSED',
                functionalities: [
                    'Admin authentication',
                    'Admin session validation',
                    'Role verification'
                ],
                expected: 'Admin should login successfully',
                actual: 'Admin authenticated successfully',
                screenshot,
                duration: `${(Date.now() - start) / 1000}s`
            });

        } catch (error) {

            const screenshot = await takeScreenshot(
                driver,
                'admin-login-failure.png'
            );

            logTestResult({
                suite: 'Login Test',
                testName: 'Successful admin login',
                status: 'FAILED',
                functionalities: [
                    'Admin authentication validation'
                ],
                expected: 'Admin login should succeed',
                actual: 'Admin login failed',
                error: error.stack,
                screenshot,
                duration: `${(Date.now() - start) / 1000}s`
            });

            throw error;
        }
    });
});

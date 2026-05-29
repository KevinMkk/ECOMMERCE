// tests/orders.test.js

const { By, until } = require('selenium-webdriver');
const { buildChromeDriver } = require('./utils/driver');
const {
    addFirstProductToCart,
    completeCheckout,
    loginAsDemoCustomer,
    openStorefront,
} = require('./utils/workflows');

const { logTestResult } = require('./utils/reporter');
const { takeScreenshot } = require('./utils/screenshot');

jest.setTimeout(180000);

describe('Ecommerce Orders Test', () => {

    let driver;

    beforeAll(async () => {

        driver = await buildChromeDriver();
    });

    afterAll(async () => {

        if (driver) {
            await driver.quit();
        }
    });

    test('View orders after login', async () => {

        const start = Date.now();

        try {

            // STEP 1 - Open application, select shopping country, and login
            await openStorefront(driver);
            await loginAsDemoCustomer(driver);

            // STEP 4 - Validate login success
            const userName = await driver.wait(
                until.elementLocated(
                    By.xpath("//span[contains(text(),'Alice')]")
                ),
                10000
            );

            expect(await userName.getText()).toContain('Alice');

            // STEP 5 - Open orders page
            const ordersButton = await driver.wait(
                until.elementLocated(
                    By.xpath("//span[text()='Orders']")
                ),
                10000
            );

            expect(ordersButton).toBeTruthy();

            await ordersButton.click();

            // STEP 6 - Validate orders page
            const ordersContainer = await driver.wait(
                until.elementLocated(
                    By.className('pageOrders')
                ),
                10000
            );

            expect(ordersContainer).toBeTruthy();

            // STEP 7 - Check if orders exist
            const orders = await driver.findElements(
                By.className('orderCard')
            );

            const screenshot = await takeScreenshot(
                driver,
                'view-orders-success.png'
            );

            logTestResult({
                suite: 'Orders Test',
                testName: 'View orders after login',
                status: 'PASSED',
                functionalities: [
                    'Customer authentication',
                    'Orders page navigation',
                    'Orders retrieval',
                    'Orders rendering',
                    'Authenticated order access'
                ],
                expected: 'Orders page should display customer orders',
                actual: `Orders page loaded successfully with ${orders.length} orders displayed`,
                screenshot,
                duration: `${(Date.now() - start) / 1000}s`
            });

        } catch (error) {

            const screenshot = await takeScreenshot(
                driver,
                'view-orders-failed.png'
            );

            logTestResult({
                suite: 'Orders Test',
                testName: 'View orders after login',
                status: 'FAILED',
                functionalities: [
                    'Orders page validation'
                ],
                expected: 'Orders page should load successfully',
                actual: 'Orders page failed to load or orders inaccessible',
                error: error.stack,
                screenshot,
                duration: `${(Date.now() - start) / 1000}s`
            });

            throw error;
        }
    });

    test('Place an order successfully', async () => {

        const start = Date.now();

        try {

            // STEP 1 - Login, add a product, select cart item, add address, choose payment, and place order
            await openStorefront(driver);
            await loginAsDemoCustomer(driver);
            await addFirstProductToCart(driver);
            const confirmationMessage = await completeCheckout(driver);

            expect(await confirmationMessage.isDisplayed()).toBe(true);

            // STEP 8 - Screenshot evidence
            const screenshot = await takeScreenshot(
                driver,
                'place-order-success.png'
            );

            logTestResult({
                suite: 'Orders Test',
                testName: 'Place an order successfully',
                status: 'PASSED',
                functionalities: [
                    'Customer authentication',
                    'Shopping country selection',
                    'Product cart addition',
                    'Cart item selection',
                    'Shipping address capture',
                    'Payment method selection',
                    'Order review and confirmation',
                    'Purchase workflow completion'
                ],
                expected: 'Customer should complete the full checkout workflow successfully',
                actual: 'Order placed successfully and success modal displayed',
                screenshot,
                duration: `${(Date.now() - start) / 1000}s`
            });

        } catch (error) {

            const screenshot = await takeScreenshot(
                driver,
                'place-order-failed.png'
            );

            logTestResult({
                suite: 'Orders Test',
                testName: 'Place an order successfully',
                status: 'FAILED',
                functionalities: [
                    'Checkout workflow validation'
                ],
                expected: 'Order should be placed successfully',
                actual: 'Checkout process failed',
                error: `
${error.stack}

POSSIBLE CAUSES:
- Cart was empty
- Checkout button not functioning
- Payment processing failure
- Backend API issue
- Database order insert failure
- Confirmation page not rendered
- Session expired during checkout
`,
                screenshot,
                duration: `${(Date.now() - start) / 1000}s`
            });

            throw error;
        }
    });

    test('Order appears in order history after checkout', async () => {

        const start = Date.now();

        try {

            // STEP 1 - Open application, select country, login, and create an order to verify persistence
            await openStorefront(driver);
            await loginAsDemoCustomer(driver);
            await addFirstProductToCart(driver);
            await completeCheckout(driver);
            await driver.navigate().refresh();
            await openStorefront(driver, { reset: false });

            // STEP 3 - Open orders
            const ordersButton = await driver.wait(
                until.elementLocated(
                    By.xpath("//span[text()='Orders']")
                ),
                10000
            );

            await ordersButton.click();

            // STEP 4 - Validate order cards exist
            const orders = await driver.wait(
                until.elementsLocated(
                    By.className('orderCard')
                ),
                10000
            );

            expect(orders.length).toBeGreaterThan(0);

            const screenshot = await takeScreenshot(
                driver,
                'order-history-success.png'
            );

            logTestResult({
                suite: 'Orders Test',
                testName: 'Order appears in order history after checkout',
                status: 'PASSED',
                functionalities: [
                    'Order history retrieval',
                    'Database order persistence',
                    'Customer order history rendering'
                ],
                expected: 'Placed orders should appear in history',
                actual: `${orders.length} orders found in customer history`,
                screenshot,
                duration: `${(Date.now() - start) / 1000}s`
            });

        } catch (error) {

            const screenshot = await takeScreenshot(
                driver,
                'order-history-failed.png'
            );

            logTestResult({
                suite: 'Orders Test',
                testName: 'Order appears in order history after checkout',
                status: 'FAILED',
                functionalities: [
                    'Order history validation'
                ],
                expected: 'Orders should appear in order history',
                actual: 'No orders found in order history',
                error: `
${error.stack}

POSSIBLE CAUSES:
- Orders not saved to database
- Orders API failed
- Frontend rendering issue
- Authentication issue
- Order retrieval query failure
`,
                screenshot,
                duration: `${(Date.now() - start) / 1000}s`
            });

            throw error;
        }
    });
});

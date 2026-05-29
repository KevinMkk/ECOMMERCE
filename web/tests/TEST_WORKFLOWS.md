# Selenium Test Workflows

These Jest tests exercise the Vite frontend through Selenium and require both the backend API on port `4000` and the web app on port `5173`. `tests/globalSetup.cjs` starts both services when they are not already running.

## Required first step: country selection

The application blocks the storefront behind the "Where are you shopping from?" modal until `localStorage.userCountry` is set. Every browser workflow must therefore select a country before waiting for products, login controls, cart controls, or admin controls.

The shared helper in `tests/utils/workflows.js` handles this with:

- `openStorefront(driver)`: resets test-local browser state, opens the app, selects `Lesotho`, and waits for product cards.
- `selectCountryIfPrompted(driver)`: clicks the country option only when the modal is present.

## Covered workflows

- `products.test.js`: country selection, storefront load, product rendering.
- `login.test.js`: country selection, homepage title, demo customer login, invalid login rejection, admin login.
- `cart.test.js`: country selection, customer login, product add-to-cart, cart badge update.
- `orders.test.js`: customer login, orders navigation, full checkout path, order history persistence.
- `admin.test.js`: country selection, admin login, admin dashboard access.

## Full checkout workflow

`completeCheckout(driver)` documents and performs the required checkout path:

1. Open the cart.
2. Select all cart items.
3. Start checkout.
4. Add a Lesotho shipping address.
5. Continue to payment.
6. Choose PayPal.
7. Review the order.
8. Place the order and wait for the success modal.

## Reports and screenshots

Each test writes evidence to `web/reports` through `tests/utils/reporter.js` and `tests/utils/screenshot.js`:

- `test-report.txt`: aggregate human-readable report.
- `summary.json`: machine-readable result summary.
- One text file per test case.
- Screenshots for passed and failed checkpoints.

Run the suite from `web` with:

```bash
npm test
```

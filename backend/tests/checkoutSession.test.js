const assert = require("assert");
const fs = require("fs");
const path = require("path");

const paymentRoutesPath = path.join(__dirname, "../routes/paymentRoutes.js");
const source = fs.readFileSync(paymentRoutesPath, "utf8");

assert.doesNotMatch(
  source,
  /automatic_payment_methods/,
  "Checkout session must not send automatic_payment_methods"
);

assert.match(
  source,
  /payment_method_types:\s*\[["']card["']\]/,
  "Checkout session must use payment_method_types: ['card']"
);

assert.match(source, /success_url/, "success_url must stay in checkout session");
assert.match(source, /cancel_url/, "cancel_url must stay in checkout session");
assert.match(source, /currency: CURRENCY/, "SEK currency helper must stay");

require("../app");
require("../routes/paymentRoutes");
require("../config/shop");

const { CURRENCY } = require("../config/shop");
assert.strictEqual(CURRENCY, "sek");

console.log("payment checkout tests passed");

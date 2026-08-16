const CURRENCY = "sek";
const VAT_RATE = 0.25;
const FREE_SHIPPING_THRESHOLD = 599;
const STANDARD_SHIPPING = 49;
const PROMO_CODE = "RIANI10";
const PROMO_DISCOUNT = 0.1;

const COMPANY = {
  name: process.env.COMPANY_NAME || "Riani Shop",
  orgNr: process.env.COMPANY_ORG_NR || "",
  address: process.env.COMPANY_ADDRESS || "Sweden",
  email: process.env.OWNER_EMAIL || "riani.shop@proton.me",
  country: "SE",
};

function priceToSek(price, source = "normal") {
  const n = Number(price) || 0;
  if (source === "printful") {
    return Math.round(n);
  }
  if (n > 0 && n < 250) {
    return Math.round(n * 10);
  }
  return Math.round(n);
}

function vatFromGross(gross) {
  return Math.round((Number(gross) || 0) * (VAT_RATE / (1 + VAT_RATE)));
}

function shippingFor(subtotal) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
}

function toMinorUnits(amount) {
  return Math.max(0, Math.round(Number(amount) || 0) * 100);
}

module.exports = {
  CURRENCY,
  VAT_RATE,
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING,
  PROMO_CODE,
  PROMO_DISCOUNT,
  COMPANY,
  priceToSek,
  vatFromGross,
  shippingFor,
  toMinorUnits,
};

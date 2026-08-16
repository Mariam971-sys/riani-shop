export const CONTACT_EMAIL = "riani.shop@proton.me";
export const SHOP_COUNTRY = "Sweden";
export const CURRENCY = "SEK";
export const VAT_RATE = 0.25;
export const FREE_SHIPPING_THRESHOLD = 599;
export const STANDARD_SHIPPING = 49;
export const RETURN_DAYS = 14;
export const COMPANY_NAME = "Riani Shop";
export const COMPANY_ORG_NR = "";
export const COMPANY_ADDRESS = "Sweden";

export function priceToSek(price, source = "normal") {
  const n = Number(price) || 0;
  if (source === "printful") {
    return Math.round(n);
  }
  if (n > 0 && n < 250) {
    return Math.round(n * 10);
  }
  return Math.round(n);
}

export function formatSek(amount) {
  return `${Math.round(Number(amount) || 0)} kr`;
}

export function shippingFor(subtotal) {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING;
}

export function vatFromGross(gross) {
  return Math.round((Number(gross) || 0) * (VAT_RATE / (1 + VAT_RATE)));
}

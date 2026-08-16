const mongoose = require("mongoose");
const Product = require("../models/Product");
const {
  PROMO_CODE,
  PROMO_DISCOUNT,
  priceToSek,
  vatFromGross,
  shippingFor,
} = require("../config/shop");
const { getSyncProduct } = require("../utils/printful");

function isPrintfulItem(item) {
  return (
    item?.source === "printful" ||
    String(item?.product || item?.id || "").startsWith("printful-")
  );
}

async function resolveOrderItem(item) {
  const quantity = Math.max(1, Number(item.quantity) || 1);

  if (isPrintfulItem(item)) {
    const printfulId = String(
      item.printfulId ||
        String(item.product || item.id || "").replace(/^printful-/, "")
    );
    const data = await getSyncProduct(printfulId);
    const variants = data?.result?.sync_variants || [];
    const syncProduct = data?.result?.sync_product || {};

    const variant =
      variants.find(
        (entry) =>
          String(entry.id) === String(item.printfulVariantId || "")
      ) || variants[0];

    if (!variant) {
      const error = new Error("Printful variant not found");
      error.statusCode = 400;
      throw error;
    }

    return {
      product: `printful-${printfulId}`,
      name: variant.name || syncProduct.name || item.name,
      image:
        variant.files?.[0]?.preview_url ||
        syncProduct.thumbnail_url ||
        item.image ||
        "",
      price: priceToSek(variant.retail_price, "printful"),
      quantity,
      size: item.size || item.selectedSize || variant.size || "",
      color: item.color || item.selectedColor || variant.color || "",
      source: "printful",
      printfulId,
      printfulVariantId: String(variant.id),
    };
  }

  const productId = item.product || item._id || item.id || item.productId;

  if (!mongoose.Types.ObjectId.isValid(productId)) {
    const error = new Error("One or more products were not found");
    error.statusCode = 400;
    throw error;
  }

  const product = await Product.findById(productId);

  if (!product) {
    const error = new Error("One or more products were not found");
    error.statusCode = 400;
    throw error;
  }

  const unitPrice =
    product.isOnSale && Number(product.salePrice) > 0
      ? product.salePrice
      : product.price;

  return {
    product: String(product._id),
    name: product.name,
    image: product.image || product.images?.[0] || item.image || "",
    price: priceToSek(unitPrice, "normal"),
    quantity,
    size: item.size || item.selectedSize || "",
    color: item.color || item.selectedColor || "",
    source: "normal",
    printfulId: "",
    printfulVariantId: "",
  };
}

function validateShipping(shippingAddress) {
  if (
    !shippingAddress ||
    !shippingAddress.fullName ||
    !shippingAddress.email ||
    !shippingAddress.phone ||
    !shippingAddress.address ||
    !shippingAddress.city ||
    !shippingAddress.postalCode ||
    !shippingAddress.country
  ) {
    const error = new Error("Complete shipping address is required");
    error.statusCode = 400;
    throw error;
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(shippingAddress.email))) {
    const error = new Error("Enter a valid email address");
    error.statusCode = 400;
    throw error;
  }
}

async function buildOrderFromPayload({
  orderItems,
  shippingAddress,
  promoCode,
}) {
  if (!Array.isArray(orderItems) || orderItems.length === 0) {
    const error = new Error("No order items");
    error.statusCode = 400;
    throw error;
  }

  validateShipping(shippingAddress);

  const resolvedItems = [];
  for (const item of orderItems) {
    resolvedItems.push(await resolveOrderItem(item));
  }

  const itemsPrice = resolvedItems.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  const promoApplied =
    String(promoCode || "").trim().toUpperCase() === PROMO_CODE;
  const discount = promoApplied ? Math.round(itemsPrice * PROMO_DISCOUNT) : 0;
  const shippingPrice = shippingFor(itemsPrice - discount);
  const totalPrice = itemsPrice - discount + shippingPrice;
  const taxPrice = vatFromGross(totalPrice);

  return {
    orderItems: resolvedItems,
    shippingAddress: {
      fullName: shippingAddress.fullName.trim(),
      email: shippingAddress.email.trim().toLowerCase(),
      phone: shippingAddress.phone.trim(),
      address: shippingAddress.address.trim(),
      city: shippingAddress.city.trim(),
      postalCode: shippingAddress.postalCode.trim(),
      country: shippingAddress.country.trim(),
    },
    itemsPrice,
    discount,
    shippingPrice,
    taxPrice,
    totalPrice,
    promoCode: promoApplied ? PROMO_CODE : "",
    currency: "SEK",
  };
}

module.exports = {
  buildOrderFromPayload,
};

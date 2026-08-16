const PRINTFUL_API_URL = "https://api.printful.com";

function printfulHeaders() {
  const token = process.env.PRINTFUL_API_TOKEN;
  if (!token) {
    return null;
  }

  return {
    Authorization: `Bearer ${token.trim()}`,
    "Content-Type": "application/json",
  };
}

async function printfulRequest(path, options = {}) {
  const headers = printfulHeaders();
  if (!headers) {
    const error = new Error("PRINTFUL_API_TOKEN is missing");
    error.statusCode = 503;
    throw error;
  }

  const response = await fetch(`${PRINTFUL_API_URL}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(
      data?.error?.message || data?.message || "Printful request failed"
    );
    error.statusCode = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

async function getSyncProduct(id) {
  return printfulRequest(`/sync/products/${id}`);
}

function countryToCode(country) {
  const value = String(country || "").trim().toLowerCase();
  if (value === "sweden" || value === "sverige" || value === "se") {
    return "SE";
  }
  if (value.length === 2) {
    return value.toUpperCase();
  }
  return "SE";
}

async function createPrintfulOrder(order) {
  const printfulItems = (order.orderItems || []).filter(
    (item) => item.source === "printful" && item.printfulVariantId
  );

  if (printfulItems.length === 0) {
    return null;
  }

  const shipping = order.shippingAddress || {};

  const payload = {
    recipient: {
      name: shipping.fullName,
      address1: shipping.address,
      city: shipping.city,
      country_code: countryToCode(shipping.country),
      zip: shipping.postalCode,
      email: shipping.email,
      phone: shipping.phone || "",
    },
    items: printfulItems.map((item) => ({
      sync_variant_id: Number(item.printfulVariantId),
      quantity: Number(item.quantity || 1),
    })),
    external_id: String(order._id),
    confirm: true,
  };

  const data = await printfulRequest("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return data?.result || data;
}

module.exports = {
  printfulRequest,
  getSyncProduct,
  createPrintfulOrder,
  countryToCode,
};

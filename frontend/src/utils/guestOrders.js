const GUEST_ORDERS_KEY = "rianiGuestOrders";
const LAST_ORDER_KEY = "rianiLastOrder";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (error) {
    console.error(`Could not read ${key}:`, error);
    return fallback;
  }
}

export function loadGuestOrders() {
  const orders = readJson(GUEST_ORDERS_KEY, []);
  return Array.isArray(orders) ? orders : [];
}

export function saveGuestOrder(order) {
  if (!order?._id && !order?.id) {
    return;
  }

  const entry = {
    ...order,
    _id: order._id || order.id,
  };

  const next = [
    entry,
    ...loadGuestOrders().filter(
      (item) => String(item._id) !== String(entry._id)
    ),
  ].slice(0, 20);

  try {
    localStorage.setItem(GUEST_ORDERS_KEY, JSON.stringify(next));
  } catch (error) {
    console.error("Could not save guest order:", error);
  }
}

export function saveLastOrder(order) {
  if (!order) {
    return;
  }

  try {
    sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
  } catch (error) {
    console.error("Could not save last order:", error);
  }
}

export function loadLastOrder() {
  try {
    const raw = sessionStorage.getItem(LAST_ORDER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error("Could not read last order:", error);
    return null;
  }
}

export function getGuestOrderEmail(orderId) {
  const match = loadGuestOrders().find(
    (order) => String(order._id || order.id) === String(orderId)
  );

  return match?.shippingAddress?.email || match?.email || "";
}

const { COMPANY } = require("../config/shop");

function textToMessage(lines) {
  return lines.filter(Boolean).join("\n");
}

async function sendWeb3Forms({ subject, message, replyTo }) {
  const accessKey = process.env.WEB3FORMS_ACCESS_KEY;
  if (!accessKey) {
    console.warn("WEB3FORMS_ACCESS_KEY is missing; email not sent");
    return false;
  }

  const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      access_key: accessKey,
      subject,
      from_name: "Riani Shop",
      email: replyTo || COMPANY.email,
      message,
    }),
  });

  const data = await response.json().catch(() => ({}));
  return Boolean(data.success);
}

async function sendResend({ to, subject, text }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM || "Riani Shop <orders@riani-shop.com>",
      to: [to],
      subject,
      text,
    }),
  });

  return response.ok;
}

function formatOrderLines(order) {
  const items = (order.orderItems || []).map((item) => {
    return `- ${item.name} x${item.quantity} (${item.price} kr)`;
  });

  return textToMessage([
    `Order: ${order._id}`,
    `Status: ${order.status}`,
    `Paid: ${order.isPaid ? "yes" : "no"}`,
    `Payment: ${order.paymentMethod}`,
    `Total: ${order.totalPrice} kr (incl. VAT ${order.taxPrice} kr)`,
    `Shipping: ${order.shippingPrice} kr`,
    "",
    "Items:",
    ...items,
    "",
    "Ship to:",
    order.shippingAddress?.fullName,
    order.shippingAddress?.address,
    `${order.shippingAddress?.postalCode} ${order.shippingAddress?.city}`,
    order.shippingAddress?.country,
    order.shippingAddress?.email,
    order.shippingAddress?.phone,
  ]);
}

async function sendOrderEmails(order) {
  const customerEmail = order.shippingAddress?.email;
  const message = formatOrderLines(order);

  const ownerSent = await sendWeb3Forms({
    subject: `New Riani Shop order ${order._id}`,
    message,
    replyTo: customerEmail,
  });

  let customerSent = false;
  if (customerEmail) {
    customerSent = await sendResend({
      to: customerEmail,
      subject: `Order confirmation ${String(order._id).slice(-8).toUpperCase()}`,
      text: `Thank you for your order at Riani Shop.\n\n${message}`,
    });

    if (!customerSent) {
      await sendWeb3Forms({
        subject: `Customer copy: order ${order._id} for ${customerEmail}`,
        message: `Send this confirmation to the customer (${customerEmail}):\n\n${message}`,
        replyTo: customerEmail,
      });
    }
  }

  return { ownerSent, customerSent };
}

module.exports = {
  sendOrderEmails,
};

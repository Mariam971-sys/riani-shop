function Shipping() {
  return (
    <main
      style={{
        maxWidth: "900px",
        margin: "60px auto",
        padding: "20px",
        lineHeight: "1.8",
      }}
    >
      <h1>Shipping Information</h1>

      <p>
        At Riani Shop, we aim to deliver your order quickly and safely.
      </p>

      <h2>Delivery Time</h2>

      <p>
        Orders are usually processed within 1–2 business days.
      </p>

      <p>
        Estimated delivery:
      </p>

      <ul>
        <li>Sweden: 2–5 business days</li>
        <li>Europe: 3–7 business days</li>
        <li>International: 5–10 business days</li>
      </ul>

      <h2>Shipping Cost</h2>

      <p>
        Shipping costs are calculated at checkout based on your location.
      </p>

      <h2>Order Tracking</h2>

      <p>
        Once your order has been shipped, you will receive a tracking number by email.
      </p>

      <h2>Need Help?</h2>

      <p>
        Contact us at <strong>support@riani-shop.com</strong> if you have any questions about your shipment.
      </p>
    </main>
  );
}

export default Shipping;
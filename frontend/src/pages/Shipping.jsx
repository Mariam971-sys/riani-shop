import { CONTACT_EMAIL, FREE_SHIPPING_THRESHOLD } from "../config/shop";

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
        Delivery in Sweden is free on orders over {FREE_SHIPPING_THRESHOLD} kr.
        Standard shipping is 49 kr.
      </p>

      <h2>Order Tracking</h2>

      <p>
        After you place an order you can follow it from My Orders.
        We will also email you if we need more delivery information.
      </p>

      <h2>Need Help?</h2>

      <p>
        Contact us at <strong>{CONTACT_EMAIL}</strong> if you have any
        questions about your shipment.
      </p>
    </main>
  );
}

export default Shipping;

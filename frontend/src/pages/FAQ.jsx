import { CONTACT_EMAIL, RETURN_DAYS } from "../config/shop";

function FAQ() {
  return (
    <main
      style={{
        maxWidth: "900px",
        margin: "60px auto",
        padding: "20px",
        lineHeight: "1.8",
      }}
    >
      <h1>Frequently Asked Questions</h1>

      <h3>How long does shipping take?</h3>
      <p>
        Shipping usually takes 2–7 business days depending on your location.
        Orders in Sweden are typically delivered in 2–5 business days.
      </p>

      <h3>Can I return my order?</h3>
      <p>
        Yes. Consumers in Sweden/EU may withdraw within {RETURN_DAYS} days of
        receiving the order. Unused items can also be returned within 30 days.
      </p>

      <h3>Which payment methods do you accept?</h3>
      <p>
        Checkout uses Stripe in SEK. You can pay with card.
      </p>

      <h3>How can I contact customer support?</h3>
      <p>
        Email us at {CONTACT_EMAIL} and we will reply as soon as possible.
      </p>
    </main>
  );
}

export default FAQ;

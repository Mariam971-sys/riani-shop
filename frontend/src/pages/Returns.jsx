import { CONTACT_EMAIL, RETURN_DAYS } from "../config/shop";

function Returns() {
  return (
    <main
      style={{
        maxWidth: "900px",
        margin: "60px auto",
        padding: "20px",
        lineHeight: "1.8",
      }}
    >
      <h1>Returns & Refunds</h1>

      <p>
        We want you to be happy with your purchase from Riani Shop.
        If you shop as a consumer in Sweden/EU, you have a {RETURN_DAYS}-day
        right of withdrawal from the day you receive the order.
      </p>

      <h2>Return Conditions</h2>

      <ul>
        <li>The item must be unused and unworn.</li>
        <li>The item must be in its original condition.</li>
        <li>Original tags and packaging should be included.</li>
        <li>Proof of purchase may be required.</li>
      </ul>

      <h2>How to Make a Return</h2>

      <p>
        Contact our customer support before sending your return.
        We will provide you with return instructions.
      </p>

      <h2>Refunds</h2>

      <p>
        For cash on delivery orders, approved returns are refunded after we
        receive and inspect the item.
      </p>

      <h2>Need Help?</h2>

      <p>
        Contact us at <strong>{CONTACT_EMAIL}</strong>.
      </p>
    </main>
  );
}

export default Returns;

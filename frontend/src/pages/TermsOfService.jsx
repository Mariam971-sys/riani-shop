import { CONTACT_EMAIL, SHOP_COUNTRY, COMPANY_ORG_NR, COMPANY_ADDRESS } from "../config/shop";
import "../styles/LegalPages.css";

function TermsOfService() {
  return (
    <main className="legal-page">
      <div className="legal-container">
        <h1>Terms of Service</h1>
        <p className="legal-updated">Last updated: August 16, 2026</p>

        <section>
          <h2>1. About Riani Shop</h2>
          <p>
            These terms apply when you shop at Riani Shop, an online store
            based in {SHOP_COUNTRY}. Address: {COMPANY_ADDRESS}.
            {COMPANY_ORG_NR ? ` Organisation number: ${COMPANY_ORG_NR}.` : ""}
            By placing an order you agree to these terms.
          </p>
        </section>

        <section>
          <h2>2. Orders</h2>
          <p>
            When you place an order you receive an order confirmation on the
            website. We may contact you by email if we need more information
            before we ship.
          </p>
        </section>

        <section>
          <h2>3. Prices and payment</h2>
          <p>
            Prices are shown in SEK and include 25% Swedish VAT (moms). Payment
            is made at checkout through Stripe.
          </p>
        </section>

        <section>
          <h2>4. Delivery</h2>
          <p>
            We ship to {SHOP_COUNTRY} and selected other countries. Delivery
            times are estimates and can vary by location and stock.
          </p>
        </section>

        <section>
          <h2>5. Right of withdrawal</h2>
          <p>
            If you shop as a consumer in the EU/{SHOP_COUNTRY}, you may cancel
            your purchase within 14 days of receiving the goods, in line with
            the distance selling rules. See our Returns page for how to make a
            return.
          </p>
        </section>

        <section>
          <h2>6. Contact</h2>
          <p>
            Questions about these terms:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
          </p>
        </section>
      </div>
    </main>
  );
}

export default TermsOfService;

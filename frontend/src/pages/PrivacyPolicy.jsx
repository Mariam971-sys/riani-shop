import "./LegalPages.css";

function PrivacyPolicy() {
  return (
    <main className="legal-page">
      <div className="legal-container">
        <h1>Privacy Policy</h1>
        <p className="legal-updated">Last updated: August 6, 2026</p>

        <section>
          <h2>1. Information We Collect</h2>
          <p>
            We may collect your name, email address, delivery address, phone
            number, and order information when you use Riani Shop.
          </p>
        </section>

        <section>
          <h2>2. How We Use Your Information</h2>
          <p>
            We use your information to process orders, provide customer
            support, improve our website, and communicate important updates.
          </p>
        </section>

        <section>
          <h2>3. Payment Information</h2>
          <p>
            Payment information is processed securely by our payment providers.
            Riani Shop does not store complete card details on its servers.
          </p>
        </section>

        <section>
          <h2>4. Cookies</h2>
          <p>
            We may use cookies to improve website functionality, remember your
            preferences, and understand how visitors use the website.
          </p>
        </section>

        <section>
          <h2>5. Sharing Your Information</h2>
          <p>
            We only share necessary information with trusted service providers,
            such as payment processors and delivery companies.
          </p>
        </section>

        <section>
          <h2>6. Your Rights</h2>
          <p>
            You may request access to, correction of, or deletion of your
            personal information by contacting us.
          </p>
        </section>

        <section>
          <h2>7. Contact Us</h2>
          <p>
            For questions about this Privacy Policy, contact us at:
          </p>
          <p>
            Email:{" "}
            <a href="mailto:support@riani-shop.com">
              support@riani-shop.com
            </a>
          </p>
        </section>
      </div>
    </main>
  );
}

export default PrivacyPolicy;
import "../styles/Newsletter.css";

function Newsletter() {
  return (
    <section className="newsletter">

      <p>STAY CONNECTED</p>

      <h2>Join Our Newsletter</h2>

      <span>
        Get updates about new arrivals, special offers and fashion trends.
      </span>

      <form className="newsletter-form">

        <input
          type="email"
          placeholder="Enter your email"
        />

        <button type="submit">
          Subscribe
        </button>

      </form>

    </section>
  );
}

export default Newsletter;
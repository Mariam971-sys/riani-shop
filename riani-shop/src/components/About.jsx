import "../styles/About.css";
import aboutImage from "../assets/images/about.jpg";

function About() {
  return (
    <section className="about">
      <div className="about-image">
        <img
          src={aboutImage}
          alt="Riani Shop fashion store"
          loading="lazy"
          decoding="async"
          width="800"
          height="600"
        />
      </div>

      <div className="about-content">
        <p className="about-small-title">ABOUT RIANI SHOP</p>

        <h2>Premium Fashion For Modern People</h2>

        <p className="about-description">
          At Riani Shop, we believe fashion is more than clothing. Our mission
          is to bring you quality products that combine style, comfort and
          elegance.
        </p>

        <div className="about-benefits">
          <div className="about-benefit">
            <h3>Premium Quality</h3>
            <p>We carefully select quality products for our customers.</p>
          </div>

          <div className="about-benefit">
            <h3>Fast Delivery</h3>
            <p>We deliver your orders quickly and safely.</p>
          </div>

          <div className="about-benefit">
            <h3>Secure Payment</h3>
            <p>Your payment information is protected during checkout.</p>
          </div>
        </div>

        <button type="button" className="about-button">
          Learn More
        </button>
      </div>
    </section>
  );
}

export default About;
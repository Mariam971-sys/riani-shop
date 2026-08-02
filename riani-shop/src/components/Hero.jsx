import "../styles/Hero.css";
import heroImage from "../assets/images/hero.png";

function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="hero-small-title">NEW COLLECTION</p>

        <h1>
          Discover Your <br />
          Perfect Style
        </h1>

        <p className="hero-description">
          Discover premium fashion pieces designed to bring confidence,
          comfort and timeless style to your everyday look.
        </p>

        <div className="hero-buttons">
          <button className="hero-button">Shop Now</button>
          <button className="outline-button">Explore</button>
        </div>
      </div>

      <div className="hero-image">
        <img
          src={heroImage}
          alt="Riani Shop new fashion collection"
          width="800"
          height="650"
          fetchPriority="high"
          decoding="async"
        />
      </div>
    </section>
  );
}

export default Hero;
import { Link } from "react-router-dom";
import "../styles/BestSellerCard.css";

function BestSellerCard({
  image,
  category,
  name,
  price,
}) {
  const shopLink = `/shop?category=${encodeURIComponent(
    category
  )}&search=${encodeURIComponent(name)}`;

  return (
    <Link to={shopLink} className="best-card-link">
      <div className="best-card">
        <span className="sale-badge">SALE</span>

        <div className="best-image">
          <img
            src={image}
            alt={name}
            loading="lazy"
            decoding="async"
            width="400"
            height="480"
          />
        </div>

        <div className="best-info">
          <p className="best-category">{category}</p>

          <h3>{name}</h3>

          <div className="stars">★★★★★</div>

          <h4>${Number(price).toFixed(2)}</h4>

          <button type="button">
            Shop Now
          </button>
        </div>
      </div>
    </Link>
  );
}

export default BestSellerCard;
import { FaHeart, FaStar } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import "../styles/ProductCard.css";

function ProductCard({
  id,
  image,
  category,
  brand,
  name,
  price,
}) {
  const navigate = useNavigate();

  function handleShopNow() {
    navigate(`/product/${id}`);
  }

  return (
    <article className="product-card">
      <div className="product-image">
        <img src={image} alt={name} />

        <button
          type="button"
          className="wishlist-button"
          aria-label="Add to wishlist"
        >
          <FaHeart />
        </button>
      </div>

      <div className="product-info">
        <p className="product-category">
          {brand ? `${brand} · ` : ""}
          {category}
        </p>

        <h3 className="product-name">{name}</h3>

        <div className="product-rating">
          <FaStar />
          <FaStar />
          <FaStar />
          <FaStar />
          <FaStar />
        </div>

        <p className="product-price">
          ${Number(price || 0).toFixed(2)}
        </p>

        <button
          type="button"
          className="shop-now-button"
          onClick={handleShopNow}
        >
          Shop Now
        </button>
      </div>
    </article>
  );
}

export default ProductCard;
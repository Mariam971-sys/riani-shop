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
  rating = 0,
  numReviews = 0,
}) {
  const navigate = useNavigate();
  const displayRating = Number(rating || 0);
  const filledStars = Math.round(displayRating);

  function handleShopNow() {
    navigate(`/product/${id}`);
  }

  return (
    <article className="product-card">
      <div className="product-image">
        <img
          src={image}
          alt={name}
          loading="lazy"
          decoding="async"
          width="400"
          height="500"
        />

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

        <div
          className="product-rating"
          aria-label={
            displayRating > 0
              ? `Rated ${displayRating.toFixed(1)} out of 5 from ${numReviews} reviews`
              : "No reviews yet"
          }
        >
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              color={star <= filledStars ? "#f5a623" : "#ddd"}
            />
          ))}
          {numReviews > 0 && (
            <span className="product-review-count">
              ({numReviews})
            </span>
          )}
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

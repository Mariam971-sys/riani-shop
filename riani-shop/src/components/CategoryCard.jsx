import { useNavigate } from "react-router-dom";
import "../styles/Categories.css";

function CategoryCard({ image, title }) {
  const navigate = useNavigate();

  function handleClick() {
    navigate(`/shop?category=${title}`);
  }

  return (
    <div
      className="category-card"
      onClick={handleClick}
      style={{ cursor: "pointer" }}
    >
      <img
        src={image}
        alt={title}
        loading="lazy"
        decoding="async"
        width="600"
        height="750"
      />

      <div className="category-overlay">
        <h3>{title}</h3>

        <button type="button">
          Shop Now
        </button>
      </div>
    </div>
  );
}

export default CategoryCard;
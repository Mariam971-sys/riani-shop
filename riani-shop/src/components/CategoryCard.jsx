import "../styles/Categories.css";

function CategoryCard({ image, title }) {
  return (
    <div className="category-card">
      <img src={image} alt={title} />

      <div className="category-overlay">
        <h3>{title}</h3>
        <button>Shop Now</button>
      </div>
    </div>
  );
}

export default CategoryCard;
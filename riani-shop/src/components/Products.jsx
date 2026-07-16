import "../styles/ProductCard.css";

function ProductCard({ image, category, name, price }) {
  return (
    <div className="product-card">
      <div className="product-image">
        <img src={image} alt={name} />
      </div>

      <div className="product-info">
        <p className="product-category">{category}</p>

        <h3>{name}</h3>

        <p className="product-price">${price}</p>

        <button>Add To Cart</button>
      </div>
    </div>
  );
}

export default ProductCard;
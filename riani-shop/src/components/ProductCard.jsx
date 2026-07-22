import { useContext } from "react";
import { FaHeart } from "react-icons/fa";

import { CartContext } from "../context/CartContext";
import { WishlistContext } from "../context/WishlistContext";

import "../styles/ProductCard.css";

function ProductCard({
  id,
  image,
  category,
  name,
  price,
}) {
  const { addToCart } = useContext(CartContext);

  const { wishlist, setWishlist } =
    useContext(WishlistContext);

  const isInWishlist = wishlist.some(
    (item) => String(item.id) === String(id)
  );

  function handleAddToCart() {
    addToCart({
      id,
      image,
      category,
      name,
      price,
    });
  }

  function toggleWishlist() {
    if (isInWishlist) {
      setWishlist(
        wishlist.filter(
          (item) => String(item.id) !== String(id)
        )
      );
    } else {
      setWishlist([
        ...wishlist,
        {
          id,
          image,
          category,
          name,
          price,
        },
      ]);
    }
  }

  return (
    <div className="product-card">
      <div className="product-image">
        <button
          type="button"
          className={`wishlist-button ${
            isInWishlist ? "wishlist-active" : ""
          }`}
          onClick={toggleWishlist}
          aria-label="Toggle wishlist"
        >
          <FaHeart />
        </button>

        <img src={image} alt={name} />
      </div>

      <div className="product-info">
        <p className="product-category">
          {category || "Uncategorized"}
        </p>

        <h3 className="product-name">
          {name}
        </h3>

        <p className="product-price">
          ${Number(price || 0).toFixed(2)}
        </p>

        <button
          type="button"
          className="add-cart-button"
          onClick={handleAddToCart}
        >
          Add To Cart
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
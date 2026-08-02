import { useContext } from "react";
import { Link } from "react-router-dom";
import { WishlistContext } from "../context/WishlistContext";

function Wishlist() {
  const { wishlist, setWishlist } = useContext(WishlistContext);

  function removeItem(id) {
    const updatedWishlist = wishlist.filter(
      (item) => item.id !== id
    );

    setWishlist(updatedWishlist);
  }

  if (wishlist.length === 0) {
    return (
      <div style={{ padding: "50px", textAlign: "center" }}>
        <h1>❤️ My Wishlist</h1>
        <p>Your wishlist is empty.</p>

        <Link to="/shop">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "40px" }}>
      <h1>❤️ My Wishlist</h1>

      {wishlist.map((product) => (
        <div
          key={product.id}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "20px",
            border: "1px solid #ddd",
            padding: "20px",
            borderRadius: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
            }}
          >
            <img
              src={product.image}
              alt={product.name}
              width="100"
            />

            <div>
              <h3>{product.name}</h3>
              <p>{product.category}</p>
              <h4>${product.price}</h4>
            </div>
          </div>

          <button
            onClick={() => removeItem(product.id)}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
}

export default Wishlist;
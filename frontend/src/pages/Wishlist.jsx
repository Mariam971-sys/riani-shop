import { useContext } from "react";
import { Link } from "react-router-dom";

import { WishlistContext } from "../context/WishlistContext";

function Wishlist() {
  const {
    wishlist,
    removeFromWishlist,
  } = useContext(WishlistContext);

  function getProductId(product) {
    return product._id || product.id;
  }

  function getProductImage(product) {
    if (
      Array.isArray(product.images) &&
      product.images.length > 0
    ) {
      return product.images[0];
    }

    return product.image;
  }

  if (wishlist.length === 0) {
    return (
      <main
        style={{
          padding: "80px 20px",
          textAlign: "center",
        }}
      >
        <h1>❤️ My Wishlist</h1>

        <p
          style={{
            color: "#666",
            marginBottom: "30px",
          }}
        >
          Your wishlist is empty.
        </p>

        <Link
          to="/shop"
          style={{
            display: "inline-block",
            padding: "14px 28px",
            background: "#111",
            color: "#fff",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "600",
          }}
        >
          Continue Shopping
        </Link>
      </main>
    );
  }

  return (
    <main
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "50px 20px",
      }}
    >
      <h1
        style={{
          marginBottom: "10px",
        }}
      >
        ❤️ My Wishlist
      </h1>

      <p
        style={{
          color: "#666",
          marginBottom: "40px",
        }}
      >
        {wishlist.length} saved product
        {wishlist.length > 1 ? "s" : ""}
      </p>

      {wishlist.map((product) => (
        <div
          key={getProductId(product)}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "20px",
            padding: "20px",
            marginBottom: "20px",
            border: "1px solid #e5e5e5",
            borderRadius: "12px",
            background: "#fff",
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
              src={getProductImage(product)}
              alt={product.name}
              style={{
                width: "120px",
                height: "140px",
                objectFit: "cover",
                borderRadius: "10px",
              }}
            />

            <div>
              <p
                style={{
                  color: "#888",
                  marginBottom: "5px",
                }}
              >
                {product.category}
              </p>

              <h3
                style={{
                  marginBottom: "10px",
                }}
              >
                {product.name}
              </h3>

              <strong
                style={{
                  fontSize: "20px",
                }}
              >
                ${Number(product.price).toFixed(2)}
              </strong>
            </div>
          </div>

          <button
            type="button"
            onClick={() =>
              removeFromWishlist(
                getProductId(product)
              )
            }
            style={{
              padding: "12px 20px",
              border: "none",
              borderRadius: "8px",
              background: "#d62828",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Remove
          </button>
        </div>
      ))}
    </main>
  );
}

export default Wishlist;
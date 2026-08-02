import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { CartContext } from "../context/CartContext";
import { mediaUrl } from "../config/api";

function Cart() {
  const navigate = useNavigate();

  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    clearCart,
    totalItems,
    totalPrice,
  } = useContext(CartContext);

  function getItemId(item) {
    return item.id || item._id || item.productId;
  }

  function getItemSize(item) {
    return item.selectedSize || item.size || null;
  }

  function getItemColor(item) {
    return item.selectedColor || item.color || null;
  }

  function getImageUrl(image) {
    if (!image) {
      return "";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://") ||
      image.startsWith("data:")
    ) {
      return image;
    }

    if (image.startsWith("/uploads")) {
      return mediaUrl(image);
    }

    return image;
  }

  function handleRemove(item) {
    const productId = getItemId(item);
    const size = getItemSize(item);
    const color = getItemColor(item);

    removeFromCart(productId, size, color);
  }

  function handleIncrease(item) {
    const productId = getItemId(item);
    const size = getItemSize(item);
    const color = getItemColor(item);

    increaseQuantity(productId, size, color);
  }

  function handleDecrease(item) {
    const productId = getItemId(item);
    const size = getItemSize(item);
    const color = getItemColor(item);

    decreaseQuantity(productId, size, color);
  }

  function handleClearCart() {
    const confirmed = window.confirm(
      "Are you sure you want to remove all products from the cart?"
    );

    if (confirmed) {
      clearCart();
    }
  }

  if (cart.length === 0) {
    return (
      <main style={emptyCartPageStyle}>
        <div style={emptyCartCardStyle}>
          <div style={emptyCartIconStyle}>🛒</div>

          <h1 style={emptyCartTitleStyle}>
            Your cart is empty
          </h1>

          <p style={emptyCartTextStyle}>
            Add products to your cart before continuing to
            checkout.
          </p>

          <button
            type="button"
            onClick={() => navigate("/shop")}
            style={primaryButtonStyle}
          >
            Continue Shopping
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={pageHeaderStyle}>
        <div>
          <p style={pageLabelStyle}>Riani Shop</p>

          <h1 style={pageTitleStyle}>Shopping Cart</h1>

          <p style={pageSubtitleStyle}>
            {totalItems} {totalItems === 1 ? "item" : "items"} in
            your cart
          </p>
        </div>

        <button
          type="button"
          onClick={handleClearCart}
          style={clearCartButtonStyle}
        >
          Clear Cart
        </button>
      </div>

      <div style={cartLayoutStyle}>
        <section style={cartItemsSectionStyle}>
          {cart.map((item, index) => {
            const productId = getItemId(item);
            const selectedSize = getItemSize(item);
            const selectedColor = getItemColor(item);

            const price = Number(item.price || 0);
            const quantity = Number(item.quantity || 1);
            const stock = Number(item.countInStock ?? 9999);
            const subtotal = price * quantity;

            const cartKey = [
              productId,
              selectedSize || "no-size",
              selectedColor || "no-color",
              index,
            ].join("-");

            return (
              <article key={cartKey} style={cartItemStyle}>
                <button
                  type="button"
                  onClick={() =>
                    navigate(`/product/${productId}`)
                  }
                  style={imageButtonStyle}
                  aria-label={`Open ${item.name}`}
                >
                  {item.image ? (
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      style={productImageStyle}
                    />
                  ) : (
                    <div style={noImageStyle}>No image</div>
                  )}
                </button>

                <div style={productInformationStyle}>
                  <p style={categoryStyle}>
                    {item.category || "Product"}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/product/${productId}`)
                    }
                    style={productNameButtonStyle}
                  >
                    {item.name}
                  </button>

                  {item.brand && (
                    <p style={brandStyle}>
                      Brand: {item.brand}
                    </p>
                  )}

                  <div style={variantContainerStyle}>
                    {selectedSize && (
                      <span style={variantBadgeStyle}>
                        Size: {selectedSize}
                      </span>
                    )}

                    {selectedColor && (
                      <span style={variantBadgeStyle}>
                        Color: {selectedColor}
                      </span>
                    )}
                  </div>

                  <div style={mobilePriceStyle}>
                    ${price.toFixed(2)}
                  </div>

                  <div style={itemControlsStyle}>
                    <div style={quantityControlStyle}>
                      <button
                        type="button"
                        onClick={() => handleDecrease(item)}
                        style={quantityButtonStyle}
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        −
                      </button>

                      <span style={quantityValueStyle}>
                        {quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleIncrease(item)}
                        disabled={quantity >= stock}
                        style={{
                          ...quantityButtonStyle,
                          opacity: quantity >= stock ? 0.45 : 1,
                          cursor:
                            quantity >= stock
                              ? "not-allowed"
                              : "pointer",
                        }}
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        +
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(item)}
                      style={removeButtonStyle}
                    >
                      Remove
                    </button>
                  </div>

                  {stock !== 9999 && (
                    <p
                      style={{
                        ...stockTextStyle,
                        color:
                          stock > 0 ? "#267a3a" : "#b00020",
                      }}
                    >
                      {stock > 0
                        ? `${stock} available`
                        : "Out of stock"}
                    </p>
                  )}
                </div>

                <div style={priceSectionStyle}>
                  <span style={unitPriceStyle}>
                    ${price.toFixed(2)} each
                  </span>

                  <strong style={subtotalStyle}>
                    ${subtotal.toFixed(2)}
                  </strong>
                </div>
              </article>
            );
          })}
        </section>

        <aside style={orderSummaryStyle}>
          <h2 style={summaryTitleStyle}>Order Summary</h2>

          <div style={summaryRowsStyle}>
            <div style={summaryRowStyle}>
              <span>Items</span>
              <span>{totalItems}</span>
            </div>

            <div style={summaryRowStyle}>
              <span>Subtotal</span>
              <span>${Number(totalPrice).toFixed(2)}</span>
            </div>

            <div style={summaryRowStyle}>
              <span>Delivery</span>
              <span>Calculated at checkout</span>
            </div>
          </div>

          <div style={totalRowStyle}>
            <span>Total</span>

            <strong>${Number(totalPrice).toFixed(2)}</strong>
          </div>

          <button
            type="button"
            onClick={() => navigate("/checkout")}
            style={checkoutButtonStyle}
          >
            Proceed to Checkout
          </button>

          <button
            type="button"
            onClick={() => navigate("/shop")}
            style={continueShoppingButtonStyle}
          >
            Continue Shopping
          </button>

          <div style={summaryInformationStyle}>
            <p>✓ Secure checkout</p>
            <p>✓ Fast delivery</p>
            <p>✓ Easy returns</p>
          </div>
        </aside>
      </div>
    </main>
  );
}

const pageStyle = {
  maxWidth: "1250px",
  margin: "0 auto",
  padding: "50px 20px 90px",
};

const pageHeaderStyle = {
  display: "flex",
  alignItems: "flex-end",
  justifyContent: "space-between",
  gap: "20px",
  marginBottom: "35px",
  flexWrap: "wrap",
};

const pageLabelStyle = {
  margin: "0 0 8px",
  color: "#777777",
  fontSize: "13px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "1.2px",
};

const pageTitleStyle = {
  margin: 0,
  fontSize: "clamp(32px, 5vw, 48px)",
};

const pageSubtitleStyle = {
  margin: "8px 0 0",
  color: "#666666",
};

const clearCartButtonStyle = {
  padding: "10px 15px",
  border: "1px solid #d6d6d6",
  borderRadius: "7px",
  backgroundColor: "#ffffff",
  color: "#b00020",
  fontWeight: "700",
  cursor: "pointer",
};

const cartLayoutStyle = {
  display: "grid",
  gridTemplateColumns:
    "minmax(0, 1.7fr) minmax(300px, 0.8fr)",
  gap: "35px",
  alignItems: "start",
};

const cartItemsSectionStyle = {
  minWidth: 0,
};

const cartItemStyle = {
  display: "grid",
  gridTemplateColumns: "135px minmax(0, 1fr) auto",
  gap: "22px",
  alignItems: "center",
  padding: "22px 0",
  borderBottom: "1px solid #e5e5e5",
};

const imageButtonStyle = {
  width: "135px",
  height: "155px",
  padding: 0,
  overflow: "hidden",
  border: "none",
  borderRadius: "10px",
  backgroundColor: "#f5f5f5",
  cursor: "pointer",
};

const productImageStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const noImageStyle = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#777777",
  fontSize: "13px",
};

const productInformationStyle = {
  minWidth: 0,
};

const categoryStyle = {
  margin: "0 0 5px",
  color: "#888888",
  fontSize: "13px",
  fontWeight: "600",
  textTransform: "uppercase",
};

const productNameButtonStyle = {
  display: "block",
  padding: 0,
  border: "none",
  background: "transparent",
  color: "#111111",
  fontSize: "20px",
  fontWeight: "750",
  textAlign: "left",
  cursor: "pointer",
};

const brandStyle = {
  margin: "7px 0 0",
  color: "#666666",
  fontSize: "14px",
};

const variantContainerStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
  marginTop: "12px",
};

const variantBadgeStyle = {
  padding: "6px 10px",
  borderRadius: "5px",
  backgroundColor: "#f1f1f1",
  color: "#444444",
  fontSize: "13px",
};

const mobilePriceStyle = {
  marginTop: "13px",
  fontWeight: "700",
};

const itemControlsStyle = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  marginTop: "18px",
  flexWrap: "wrap",
};

const quantityControlStyle = {
  display: "flex",
  alignItems: "center",
  overflow: "hidden",
  border: "1px solid #d6d6d6",
  borderRadius: "7px",
};

const quantityButtonStyle = {
  width: "40px",
  height: "38px",
  border: "none",
  backgroundColor: "#f4f4f4",
  fontSize: "20px",
  cursor: "pointer",
};

const quantityValueStyle = {
  minWidth: "43px",
  textAlign: "center",
  fontWeight: "700",
};

const removeButtonStyle = {
  padding: "8px 0",
  border: "none",
  background: "transparent",
  color: "#b00020",
  fontWeight: "700",
  cursor: "pointer",
};

const stockTextStyle = {
  margin: "12px 0 0",
  fontSize: "13px",
  fontWeight: "600",
};

const priceSectionStyle = {
  minWidth: "105px",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "8px",
};

const unitPriceStyle = {
  color: "#777777",
  fontSize: "13px",
};

const subtotalStyle = {
  fontSize: "18px",
};

const orderSummaryStyle = {
  position: "sticky",
  top: "25px",
  padding: "26px",
  border: "1px solid #e1e1e1",
  borderRadius: "12px",
  backgroundColor: "#fafafa",
};

const summaryTitleStyle = {
  margin: "0 0 24px",
  fontSize: "24px",
};

const summaryRowsStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "16px",
  paddingBottom: "22px",
  borderBottom: "1px solid #dddddd",
};

const summaryRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  color: "#555555",
  fontSize: "14px",
};

const totalRowStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  margin: "22px 0",
  fontSize: "20px",
};

const checkoutButtonStyle = {
  width: "100%",
  padding: "15px 20px",
  border: "none",
  borderRadius: "8px",
  backgroundColor: "#111111",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
};

const continueShoppingButtonStyle = {
  width: "100%",
  marginTop: "12px",
  padding: "14px 20px",
  border: "1px solid #222222",
  borderRadius: "8px",
  backgroundColor: "#ffffff",
  color: "#222222",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
};

const summaryInformationStyle = {
  marginTop: "22px",
  color: "#666666",
  fontSize: "13px",
  lineHeight: 1.7,
};

const emptyCartPageStyle = {
  minHeight: "70vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "50px 20px",
};

const emptyCartCardStyle = {
  maxWidth: "500px",
  padding: "50px 35px",
  border: "1px solid #e5e5e5",
  borderRadius: "15px",
  textAlign: "center",
  backgroundColor: "#ffffff",
};

const emptyCartIconStyle = {
  fontSize: "55px",
};

const emptyCartTitleStyle = {
  margin: "20px 0 10px",
};

const emptyCartTextStyle = {
  margin: "0 auto 25px",
  color: "#666666",
  lineHeight: 1.6,
};

const primaryButtonStyle = {
  padding: "14px 28px",
  border: "none",
  borderRadius: "7px",
  backgroundColor: "#111111",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
};

export default Cart;
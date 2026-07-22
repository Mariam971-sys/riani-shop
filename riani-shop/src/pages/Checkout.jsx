import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { CartContext } from "../context/CartContext";

function Checkout() {
  const { cart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const itemsPrice = cart.reduce((total, item) => {
    const price = Number(item.price || 0);
    const quantity = Number(item.quantity || 1);

    return total + price * quantity;
  }, 0);

  const shippingPrice = itemsPrice >= 100 ? 0 : 10;
  const taxPrice = itemsPrice * 0.05;
  const totalPrice = itemsPrice + shippingPrice + taxPrice;

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }));
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const allFieldsFilled = Object.values(formData).every(
      (value) => value.trim() !== ""
    );

    if (!allFieldsFilled) {
      setError("Please fill in all fields.");
      return;
    }

    if (!isValidEmail(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    let token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("userInfo");

    if (!token && savedUser) {
      try {
        const userInfo = JSON.parse(savedUser);
        token = userInfo.token;
      } catch (readError) {
        console.error(
          "Could not read user information:",
          readError
        );
      }
    }

    if (!token) {
      alert("Please login before placing an order.");
      navigate("/login");
      return;
    }

    const orderItems = cart.map((item) => ({
      product: item.productId || item._id || item.id,
      name: item.name,
      image: item.image || item.images?.[0] || "",
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 1),
      size: item.selectedSize || item.size || null,
      color: item.selectedColor || item.color || null,
    }));

    const orderData = {
      orderItems,

      shippingAddress: {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        postalCode: formData.postalCode.trim(),
        country: formData.country.trim(),
      },

      paymentMethod: "Cash on Delivery",

      itemsPrice: Number(itemsPrice.toFixed(2)),
      shippingPrice: Number(shippingPrice.toFixed(2)),
      taxPrice: Number(taxPrice.toFixed(2)),
      totalPrice: Number(totalPrice.toFixed(2)),
    };

    try {
      setLoading(true);

      const { data } = await axios.post(
        "http://localhost:5000/api/orders",
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      clearCart();
      localStorage.removeItem("cart");

      navigate("/order-success", {
        state: {
          order: data,
        },
      });
    } catch (requestError) {
      console.error("Place order error:", requestError);

      setError(
        requestError.response?.data?.message ||
          "Order could not be placed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  if (cart.length === 0) {
    return (
      <main style={emptyPageStyle}>
        <div style={emptyCardStyle}>
          <div style={emptyIconStyle}>🛒</div>

          <h1 style={emptyTitleStyle}>Checkout</h1>

          <p style={emptyTextStyle}>
            Your cart is empty. Add products before continuing.
          </p>

          <button
            type="button"
            onClick={() => navigate("/shop")}
            style={buttonStyle}
          >
            Continue Shopping
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={headerStyle}>
        <p style={labelStyle}>Riani Shop</p>
        <h1 style={titleStyle}>Checkout</h1>
        <p style={subtitleStyle}>
          Enter your shipping details and review your order.
        </p>
      </div>

      {error && <p style={errorStyle}>{error}</p>}

      <div style={checkoutLayoutStyle}>
        <form onSubmit={handleSubmit} style={formCardStyle}>
          <h2 style={sectionTitleStyle}>
            Shipping Information
          </h2>

          <label style={labelTextStyle}>
            Full name
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              value={formData.fullName}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </label>

          <label style={labelTextStyle}>
            Email
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </label>

          <label style={labelTextStyle}>
            Address
            <input
              type="text"
              name="address"
              placeholder="Street address"
              value={formData.address}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </label>

          <div style={twoColumnStyle}>
            <label style={labelTextStyle}>
              City
              <input
                type="text"
                name="city"
                placeholder="City"
                value={formData.city}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </label>

            <label style={labelTextStyle}>
              Postal code
              <input
                type="text"
                name="postalCode"
                placeholder="Postal code"
                value={formData.postalCode}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </label>
          </div>

          <label style={labelTextStyle}>
            Country
            <input
              type="text"
              name="country"
              placeholder="Country"
              value={formData.country}
              onChange={handleChange}
              style={inputStyle}
              required
            />
          </label>

          <div style={paymentBoxStyle}>
            <p style={paymentLabelStyle}>Payment method</p>
            <strong>Cash on Delivery</strong>
            <p style={paymentTextStyle}>
              You will pay when your order is delivered.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              width: "100%",
              opacity: loading ? 0.65 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Placing Order..." : "Place Order"}
          </button>
        </form>

        <section style={summaryCardStyle}>
          <h2 style={sectionTitleStyle}>Order Summary</h2>

          <div>
            {cart.map((item, index) => {
              const productId =
                item.productId || item._id || item.id;

              const selectedSize =
                item.selectedSize || item.size || null;

              const selectedColor =
                item.selectedColor || item.color || null;

              const quantity = Number(item.quantity || 1);
              const price = Number(item.price || 0);

              const cartKey = [
                productId,
                selectedSize || "no-size",
                selectedColor || "no-color",
                index,
              ].join("-");

              return (
                <div key={cartKey} style={summaryItemStyle}>
                  <div>
                    <p style={productNameStyle}>
                      {item.name} × {quantity}
                    </p>

                    {(selectedSize || selectedColor) && (
                      <p style={variantTextStyle}>
                        {selectedSize &&
                          `Size: ${selectedSize}`}

                        {selectedSize &&
                          selectedColor &&
                          " · "}

                        {selectedColor &&
                          `Color: ${selectedColor}`}
                      </p>
                    )}
                  </div>

                  <strong>
                    ${(price * quantity).toFixed(2)}
                  </strong>
                </div>
              );
            })}
          </div>

          <div style={priceRowsStyle}>
            <div style={priceRowStyle}>
              <span>Items</span>
              <strong>${itemsPrice.toFixed(2)}</strong>
            </div>

            <div style={priceRowStyle}>
              <span>Shipping</span>
              <strong>
                {shippingPrice === 0
                  ? "Free"
                  : `$${shippingPrice.toFixed(2)}`}
              </strong>
            </div>

            <div style={priceRowStyle}>
              <span>Tax</span>
              <strong>${taxPrice.toFixed(2)}</strong>
            </div>
          </div>

          <div style={totalRowStyle}>
            <span>Total</span>
            <strong>${totalPrice.toFixed(2)}</strong>
          </div>

          <div style={summaryInformationStyle}>
            <p>✓ Secure checkout</p>
            <p>✓ Free shipping over $100</p>
            <p>✓ Cash on delivery</p>
          </div>
        </section>
      </div>
    </main>
  );
}

const pageStyle = {
  maxWidth: "1150px",
  margin: "0 auto",
  padding: "50px 20px 90px",
};

const headerStyle = {
  marginBottom: "30px",
};

const labelStyle = {
  margin: "0 0 7px",
  color: "#777",
  fontSize: "13px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "1.2px",
};

const titleStyle = {
  margin: 0,
  fontSize: "clamp(34px, 5vw, 48px)",
};

const subtitleStyle = {
  margin: "8px 0 0",
  color: "#666",
};

const errorStyle = {
  padding: "13px 15px",
  marginBottom: "25px",
  border: "1px solid #ffc2c2",
  borderRadius: "8px",
  backgroundColor: "#ffe9e9",
  color: "#b00020",
};

const checkoutLayoutStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(320px, 1fr))",
  gap: "35px",
  alignItems: "start",
};

const formCardStyle = {
  padding: "28px",
  border: "1px solid #e1e1e1",
  borderRadius: "12px",
  backgroundColor: "#fff",
};

const summaryCardStyle = {
  position: "sticky",
  top: "25px",
  padding: "28px",
  border: "1px solid #e1e1e1",
  borderRadius: "12px",
  backgroundColor: "#fafafa",
};

const sectionTitleStyle = {
  margin: "0 0 25px",
  fontSize: "24px",
};

const labelTextStyle = {
  display: "block",
  marginBottom: "17px",
  color: "#333",
  fontSize: "14px",
  fontWeight: "700",
};

const inputStyle = {
  width: "100%",
  marginTop: "7px",
  padding: "13px",
  boxSizing: "border-box",
  border: "1px solid #ccc",
  borderRadius: "7px",
  fontSize: "15px",
  outline: "none",
};

const twoColumnStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(150px, 1fr))",
  gap: "15px",
};

const paymentBoxStyle = {
  padding: "16px",
  marginTop: "5px",
  border: "1px solid #ddd",
  borderRadius: "8px",
  backgroundColor: "#f8f8f8",
};

const paymentLabelStyle = {
  margin: "0 0 6px",
  color: "#666",
  fontSize: "13px",
};

const paymentTextStyle = {
  margin: "6px 0 0",
  color: "#666",
  fontSize: "13px",
};

const buttonStyle = {
  marginTop: "20px",
  padding: "14px 25px",
  border: "none",
  borderRadius: "7px",
  backgroundColor: "#222",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "700",
  cursor: "pointer",
};

const summaryItemStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  padding: "15px 0",
  borderBottom: "1px solid #ddd",
};

const productNameStyle = {
  margin: 0,
  fontWeight: "700",
};

const variantTextStyle = {
  margin: "6px 0 0",
  color: "#666",
  fontSize: "13px",
};

const priceRowsStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "14px",
  padding: "24px 0",
  borderBottom: "1px solid #ddd",
};

const priceRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  color: "#555",
};

const totalRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  paddingTop: "22px",
  fontSize: "21px",
};

const summaryInformationStyle = {
  marginTop: "24px",
  color: "#666",
  fontSize: "13px",
  lineHeight: 1.7,
};

const emptyPageStyle = {
  minHeight: "70vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "50px 20px",
};

const emptyCardStyle = {
  maxWidth: "500px",
  padding: "45px 35px",
  border: "1px solid #e4e4e4",
  borderRadius: "14px",
  backgroundColor: "#fff",
  textAlign: "center",
};

const emptyIconStyle = {
  fontSize: "52px",
};

const emptyTitleStyle = {
  margin: "18px 0 10px",
};

const emptyTextStyle = {
  margin: "0 0 20px",
  color: "#666",
};

export default Checkout;
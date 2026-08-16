import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { CartContext } from "../context/CartContext";
import { apiUrl } from "../config/api";
import {
  formatSek,
  priceToSek,
  shippingFor,
  vatFromGross,
} from "../config/shop";
import "../styles/Checkout.css";

function Checkout() {
  const navigate = useNavigate();

  const cartContext = useContext(CartContext) || {};

  const cartItems =
    cartContext.cartItems ||
    cartContext.cart ||
    cartContext.items ||
    [];

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Sweden",
  });

  const [error, setError] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  const itemsPrice = useMemo(() => {
    return cartItems.reduce((total, item) => {
      return (
        total +
        priceToSek(item.price, item.source) *
          Number(item.quantity || 1)
      );
    }, 0);
  }, [cartItems]);

  const shippingPrice = shippingFor(itemsPrice);
  const totalPrice = itemsPrice + shippingPrice;
  const taxPrice = vatFromGross(totalPrice);

  function validateForm() {
    if (!formData.fullName.trim()) {
      return "Enter your full name.";
    }

    if (!formData.email.trim()) {
      return "Enter your email.";
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      return "Enter a valid email address.";
    }

    if (!formData.phone.trim()) {
      return "Enter your phone number.";
    }

    if (!formData.address.trim()) {
      return "Enter your address.";
    }

    if (!formData.city.trim()) {
      return "Enter your city.";
    }

    if (!formData.postalCode.trim()) {
      return "Enter your postal code.";
    }

    if (!formData.country.trim()) {
      return "Enter your country.";
    }

    return "";
  }

  async function handlePlaceOrder(event) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    if (cartItems.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    try {
      setPlacingOrder(true);
      setError("");

      const orderItems = cartItems.map((item) => {
        const productId =
          item.product ||
          item._id ||
          item.id ||
          item.productId;

        return {
          product: String(productId),
          name: item.name,
          image:
            item.image ||
            item.images?.[0] ||
            "",
          quantity: Number(item.quantity || 1),
          size:
            item.selectedSize ||
            item.size ||
            "",
          color:
            item.selectedColor ||
            item.color ||
            "",
          source: item.source || "normal",
          printfulId: item.printfulId || "",
          printfulVariantId:
            item.printfulVariantId || "",
        };
      });

      const token = localStorage.getItem("token");

      const { data } = await axios.post(
        apiUrl("/payments/create-checkout-session"),
        {
          orderItems,
          shippingAddress: {
            fullName: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            postalCode: formData.postalCode,
            country: formData.country,
          },
        },
        token
          ? {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          : {}
      );

      if (!data?.url) {
        setError("Payment page could not be created.");
        return;
      }

      window.location.href = data.url;
    } catch (currentError) {
      console.error(
        "Create order error:",
        currentError
      );

      setError(
        currentError.response?.data?.message ||
          "Order could not be created. Please try again."
      );
    } finally {
      setPlacingOrder(false);
    }
  }

  if (cartItems.length === 0) {
    return (
      <main style={emptyPageStyle}>
        <h1>Your cart is empty</h1>

        <button
          type="button"
          onClick={() => navigate("/shop")}
          style={blackButtonStyle}
        >
          Back to Shop
        </button>
      </main>
    );
  }

  return (
    <main className="checkout-page" style={pageStyle}>
      <p style={smallTitleStyle}>RIANI SHOP</p>

      <h1 className="checkout-title" style={mainTitleStyle}>Checkout</h1>

      <p style={subtitleStyle}>
        Enter your shipping details and review your order.
      </p>

      <div className="checkout-steps" style={stepsStyle}>
        <div style={stepStyle}>
          <span style={stepNumberStyle}>1</span>
          <strong>Shipping</strong>
        </div>

        <div className="checkout-step-line" style={stepLineStyle} />

        <div style={stepStyle}>
          <span style={stepNumberStyle}>2</span>
          <strong>Delivery</strong>
        </div>

        <div className="checkout-step-line" style={stepLineStyle} />

        <div style={stepStyle}>
          <span style={stepNumberStyle}>3</span>
          <strong>Review</strong>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder}>
        <div className="checkout-grid" style={checkoutGridStyle}>
          <section className="checkout-card" style={cardStyle}>
            <h2 style={sectionTitleStyle}>
              Shipping Information
            </h2>

            <div className="checkout-two-cols" style={twoColumnsStyle}>
              <Field
                label="Full name"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
              />

              <Field
                label="Phone number"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+46 70 123 45 67"
              />
            </div>

            <Field
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />

            <Field
              label="Address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address"
            />

            <div className="checkout-two-cols" style={twoColumnsStyle}>
              <Field
                label="City"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
              />

              <Field
                label="Postal code"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="Postal code"
              />
            </div>

            <Field
              label="Country"
              name="country"
              value={formData.country}
              onChange={handleChange}
              placeholder="Country"
            />

            <p style={secureTextStyle}>
              Pay with card. Prices include 25% Swedish VAT.
            </p>

            {error && (
              <p style={errorStyle}>{error}</p>
            )}

            <button
              type="submit"
              disabled={placingOrder}
              style={{
                ...placeOrderButtonStyle,
                opacity: placingOrder ? 0.6 : 1,
                cursor: placingOrder
                  ? "not-allowed"
                  : "pointer",
              }}
            >
              {placingOrder
                ? "Redirecting to payment..."
                : "Pay with Stripe"}
            </button>
          </section>

          <aside className="checkout-card" style={cardStyle}>
            <h2 style={sectionTitleStyle}>
              Order Summary
            </h2>

            {cartItems.map((item, index) => {
              const itemId =
                item._id ||
                item.id ||
                item.productId ||
                index;

              const quantity =
                Number(item.quantity || 1);

              return (
                <div
                  key={`${itemId}-${index}`}
                  className="checkout-item"
                  style={orderItemStyle}
                >
                  <img
                    src={
                      item.image ||
                      item.images?.[0] ||
                      ""
                    }
                    alt={item.name}
                    style={orderImageStyle}
                  />

                  <div style={orderInfoStyle}>
                    <strong>{item.name}</strong>

                    <small>
                      Quantity: {quantity}
                    </small>

                    {(item.selectedSize ||
                      item.size) && (
                      <small>
                        Size:{" "}
                        {item.selectedSize ||
                          item.size}
                      </small>
                    )}

                    {(item.selectedColor ||
                      item.color) && (
                      <small>
                        Color:{" "}
                        {item.selectedColor ||
                          item.color}
                      </small>
                    )}
                  </div>

                  <strong>
                    {formatSek(
                      priceToSek(item.price, item.source) *
                        quantity
                    )}
                  </strong>
                </div>
              );
            })}

            <hr style={dividerStyle} />

            <SummaryRow
              label="Subtotal"
              value={formatSek(itemsPrice)}
            />

            <SummaryRow
              label="Shipping"
              value={
                shippingPrice === 0
                  ? "Free"
                  : formatSek(shippingPrice)
              }
            />

            <SummaryRow
              label="VAT (25% included)"
              value={formatSek(taxPrice)}
            />

            <SummaryRow
              label="Total"
              value={formatSek(totalPrice)}
              bold
            />

            <p style={secureTextStyle}>
              Secure checkout with Stripe. Card payments are available.
            </p>

            <p style={secureTextStyle}>
              🔒 Secure checkout
            </p>
          </aside>
        </div>
      </form>
    </main>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}) {
  return (
    <label style={fieldStyle}>
      <strong>{label}</strong>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={inputStyle}
      />
    </label>
  );
}

function SummaryRow({
  label,
  value,
  bold = false,
}) {
  return (
    <div style={summaryRowStyle}>
      <span
        style={{
          fontWeight: bold ? "700" : "400",
        }}
      >
        {label}
      </span>

      <span
        style={{
          fontWeight: bold ? "700" : "400",
        }}
      >
        {value}
      </span>
    </div>
  );
}

const pageStyle = {
  maxWidth: "1500px",
  margin: "0 auto",
  padding: "30px 45px 80px",
};

const smallTitleStyle = {
  letterSpacing: "2px",
  color: "#555",
  fontWeight: "700",
};

const mainTitleStyle = {
  margin: "5px 0 10px",
  fontSize: "58px",
};

const subtitleStyle = {
  color: "#666",
  fontSize: "18px",
};

const stepsStyle = {
  display: "flex",
  alignItems: "center",
  maxWidth: "620px",
  margin: "32px 0 38px",
};

const stepStyle = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const stepNumberStyle = {
  width: "31px",
  height: "31px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  background: "#111",
  color: "#fff",
};

const stepLineStyle = {
  width: "150px",
  height: "1px",
  margin: "0 15px",
  background: "#ccc",
};

const checkoutGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "minmax(0, 1.65fr) minmax(350px, 1fr)",
  gap: "42px",
};

const cardStyle = {
  padding: "36px",
  border: "1px solid #ddd",
  borderRadius: "18px",
  background: "#fff",
};

const sectionTitleStyle = {
  marginTop: 0,
  marginBottom: "28px",
  fontSize: "30px",
};

const twoColumnsStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "20px",
};

const fieldStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "9px",
  marginBottom: "22px",
};

const inputStyle = {
  width: "100%",
  minHeight: "56px",
  boxSizing: "border-box",
  padding: "0 16px",
  border: "1px solid #ccc",
  borderRadius: "9px",
  fontSize: "16px",
};

const orderItemStyle = {
  display: "grid",
  gridTemplateColumns: "80px 1fr auto",
  gap: "16px",
  alignItems: "center",
  marginBottom: "22px",
};

const orderImageStyle = {
  width: "80px",
  height: "95px",
  objectFit: "contain",
  background: "#f5f5f5",
  borderRadius: "8px",
};

const orderInfoStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "5px",
};

const dividerStyle = {
  border: "none",
  borderTop: "1px solid #ddd",
  margin: "25px 0",
};

const blackButtonStyle = {
  padding: "12px 22px",
  border: "none",
  borderRadius: "8px",
  background: "#111",
  color: "#fff",
  fontWeight: "700",
  cursor: "pointer",
};

const placeOrderButtonStyle = {
  width: "100%",
  marginTop: "15px",
  padding: "17px",
  border: "none",
  borderRadius: "9px",
  background: "#111",
  color: "#fff",
  fontSize: "17px",
  fontWeight: "700",
  cursor: "pointer",
};

const summaryRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  margin: "13px 0",
};

const errorStyle = {
  padding: "12px",
  borderRadius: "8px",
  background: "#ffe5e5",
  color: "#b00020",
};

const secureTextStyle = {
  marginTop: "28px",
  color: "#555",
  textAlign: "center",
};

const emptyPageStyle = {
  minHeight: "60vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "20px",
};

export default Checkout;
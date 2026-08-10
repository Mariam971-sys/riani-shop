import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { CartContext } from "../context/CartContext";

function Checkout() {
  const navigate = useNavigate();

  const cartContext = useContext(CartContext) || {};

  // Works with several common CartContext names
  const cartItems =
    cartContext.cartItems ||
    cartContext.cart ||
    cartContext.items ||
    [];

  const clearCart =
    cartContext.clearCart ||
    (() => {});

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    country: "Sweden",
  });

  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  function formatPrice(item, amount) {
    const value = Number(amount || 0);

    if (item?.source === "printful") {
      return `${value.toFixed(0)} kr`;
    }

    return `$${value.toFixed(2)}`;
  }

  const printfulItems = cartItems.filter(
    (item) => item.source === "printful"
  );

  const normalItems = cartItems.filter(
    (item) => item.source !== "printful"
  );

  const printfulSubtotal = useMemo(() => {
    return printfulItems.reduce((total, item) => {
      return (
        total +
        Number(item.price || 0) *
          Number(item.quantity || 1)
      );
    }, 0);
  }, [printfulItems]);

  const normalSubtotal = useMemo(() => {
    return normalItems.reduce((total, item) => {
      return (
        total +
        Number(item.price || 0) *
          Number(item.quantity || 1)
      );
    }, 0);
  }, [normalItems]);

  const printfulDiscount =
    promoApplied ? printfulSubtotal * 0.1 : 0;

  const normalDiscount =
    promoApplied ? normalSubtotal * 0.1 : 0;

  const printfulTotal =
    printfulSubtotal - printfulDiscount;

  const normalTotal =
    normalSubtotal - normalDiscount;

  function handlePromoCode() {
    if (
      promoCode.trim().toUpperCase() === "RIANI10"
    ) {
      setPromoApplied(true);
      setError("");
    } else {
      setPromoApplied(false);
      setError("Invalid promo code.");
    }
  }

  function validateForm() {
    if (!formData.fullName.trim()) {
      return "Enter your full name.";
    }

    if (!formData.email.trim()) {
      return "Enter your email.";
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

    return "";
  }

  function handlePlaceOrder(event) {
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

    const order = {
      shipping: formData,
      items: cartItems,
      createdAt: new Date().toISOString(),
    };

    console.log("Order:", order);

    clearCart();

    navigate("/order-success");
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
    <main style={pageStyle}>
      <p style={smallTitleStyle}>RIANI SHOP</p>

      <h1 style={mainTitleStyle}>Checkout</h1>

      <p style={subtitleStyle}>
        Enter your shipping details and review your
        order.
      </p>

      <div style={stepsStyle}>
        <div style={stepStyle}>
          <span style={stepNumberStyle}>1</span>
          <strong>Shipping</strong>
        </div>

        <div style={stepLineStyle} />

        <div style={stepStyle}>
          <span style={stepNumberStyle}>2</span>
          <strong>Delivery</strong>
        </div>

        <div style={stepLineStyle} />

        <div style={stepStyle}>
          <span style={stepNumberStyle}>3</span>
          <strong>Review</strong>
        </div>
      </div>

      <form onSubmit={handlePlaceOrder}>
        <div style={checkoutGridStyle}>
          {/* LEFT SIDE */}
          <section style={cardStyle}>
            <h2 style={sectionTitleStyle}>
              Shipping Information
            </h2>

            <div style={twoColumnsStyle}>
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

            <div style={twoColumnsStyle}>
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

            {error && (
              <p style={errorStyle}>{error}</p>
            )}

            <button
              type="submit"
              style={placeOrderButtonStyle}
            >
              Place Order
            </button>
          </section>

          {/* RIGHT SIDE */}
          <aside style={cardStyle}>
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

              const itemPrice =
                Number(item.price || 0);

              return (
                <div
                  key={`${itemId}-${index}`}
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
                    {formatPrice(
                      item,
                      itemPrice * quantity
                    )}
                  </strong>
                </div>
              );
            })}

            <hr style={dividerStyle} />

            <h3>Promo Code</h3>

            <div style={promoStyle}>
              <input
                value={promoCode}
                onChange={(event) =>
                  setPromoCode(event.target.value)
                }
                placeholder="ENTER PROMO CODE"
                style={promoInputStyle}
              />

              <button
                type="button"
                onClick={handlePromoCode}
                style={blackButtonStyle}
              >
                Apply
              </button>
            </div>

            <small>
              Test code: <strong>RIANI10</strong>
            </small>

            <hr style={dividerStyle} />

            {printfulItems.length > 0 && (
              <>
                <SummaryRow
                  label="Printful items"
                  value={`${printfulSubtotal.toFixed(
                    0
                  )} kr`}
                />

                {promoApplied && (
                  <SummaryRow
                    label="Discount"
                    value={`-${printfulDiscount.toFixed(
                      0
                    )} kr`}
                  />
                )}

                <SummaryRow
                  label="Printful total"
                  value={`${printfulTotal.toFixed(
                    0
                  )} kr`}
                  bold
                />
              </>
            )}

            {normalItems.length > 0 && (
              <>
                <SummaryRow
                  label="Other items"
                  value={`$${normalSubtotal.toFixed(
                    2
                  )}`}
                />

                {promoApplied && (
                  <SummaryRow
                    label="Discount"
                    value={`-$${normalDiscount.toFixed(
                      2
                    )}`}
                  />
                )}

                <SummaryRow
                  label="Other total"
                  value={`$${normalTotal.toFixed(
                    2
                  )}`}
                  bold
                />
              </>
            )}

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

const promoStyle = {
  display: "flex",
  gap: "12px",
  marginBottom: "8px",
};

const promoInputStyle = {
  flex: 1,
  minWidth: 0,
  height: "50px",
  padding: "0 14px",
  border: "1px solid #ccc",
  borderRadius: "8px",
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
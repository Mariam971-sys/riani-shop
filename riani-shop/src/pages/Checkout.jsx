import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { CartContext } from "../context/CartContext";
import { apiUrl, mediaUrl } from "../config/api";

function Checkout() {
  const { cart, clearCart } = useContext(CartContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    notes: "",
  });

  const [deliveryMethod, setDeliveryMethod] =
    useState("standard");

  const [promoCode, setPromoCode] = useState("");
  const [appliedPromoCode, setAppliedPromoCode] =
    useState("");
  const [promoMessage, setPromoMessage] = useState("");

  const [termsAccepted, setTermsAccepted] =
    useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const itemsPrice = cart.reduce((total, item) => {
    const price = Number(item.price || 0);
    const quantity = Number(item.quantity || 1);

    return total + price * quantity;
  }, 0);

  const discountPrice =
    appliedPromoCode === "RIANI10"
      ? itemsPrice * 0.1
      : 0;

  const standardShippingPrice =
    itemsPrice >= 100 ? 0 : 10;

  const shippingPrice =
    deliveryMethod === "express"
      ? 20
      : standardShippingPrice;

  const taxablePrice = Math.max(
    itemsPrice - discountPrice,
    0
  );

  const taxPrice = taxablePrice * 0.05;

  const totalPrice =
    taxablePrice + shippingPrice + taxPrice;

  const estimatedDelivery =
    deliveryMethod === "express"
      ? "1–2 business days"
      : "3–5 business days";

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

  function isValidPhone(phone) {
    const cleanedPhone = phone.replace(
      /[\s()-]/g,
      ""
    );

    return /^\+?[0-9]{7,15}$/.test(cleanedPhone);
  }

  function handleApplyPromoCode() {
    const cleanedCode = promoCode
      .trim()
      .toUpperCase();

    setPromoMessage("");
    setError("");

    if (!cleanedCode) {
      setAppliedPromoCode("");
      setPromoMessage("Enter a promo code.");
      return;
    }

    if (cleanedCode === "RIANI10") {
      setAppliedPromoCode("RIANI10");
      setPromoCode("RIANI10");
      setPromoMessage(
        "Promo code applied. You received 10% off."
      );

      return;
    }

    setAppliedPromoCode("");
    setPromoMessage("Invalid promo code.");
  }

  function handleRemovePromoCode() {
    setPromoCode("");
    setAppliedPromoCode("");
    setPromoMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");

    const requiredFields = [
      formData.fullName,
      formData.email,
      formData.phone,
      formData.address,
      formData.city,
      formData.postalCode,
      formData.country,
    ];

    const allRequiredFieldsFilled =
      requiredFields.every(
        (value) => value.trim() !== ""
      );

    if (!allRequiredFieldsFilled) {
      setError("Please fill in all required fields.");
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    if (!isValidEmail(formData.email)) {
      setError(
        "Please enter a valid email address."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    if (!isValidPhone(formData.phone)) {
      setError(
        "Please enter a valid phone number."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    if (!termsAccepted) {
      setError(
        "You must accept the Terms & Conditions before placing the order."
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    if (cart.length === 0) {
      setError("Your cart is empty.");
      return;
    }

    let token = localStorage.getItem("token");

    const savedUser =
      localStorage.getItem("userInfo");

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

    const orderItems = cart.map((item) => ({
      product:
        item.productId || item._id || item.id,

      name: item.name,

      image:
        item.image ||
        item.images?.[0] ||
        "",

      price: Number(item.price || 0),

      quantity: Number(item.quantity || 1),

      size:
        item.selectedSize ||
        item.size ||
        null,

      color:
        item.selectedColor ||
        item.color ||
        null,
    }));

    const orderData = {
      orderItems,

      shippingAddress: {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        city: formData.city.trim(),
        postalCode: formData.postalCode.trim(),
        country: formData.country.trim(),
      },

      deliveryMethod:
        deliveryMethod === "express"
          ? "Express Delivery"
          : "Standard Delivery",

      estimatedDelivery,

      paymentMethod: "Cash on Delivery",

      promoCode: appliedPromoCode || null,

      discountPrice: Number(
        discountPrice.toFixed(2)
      ),

      notes: formData.notes.trim(),

      itemsPrice: Number(
        itemsPrice.toFixed(2)
      ),

      shippingPrice: Number(
        shippingPrice.toFixed(2)
      ),

      taxPrice: Number(
        taxPrice.toFixed(2)
      ),

      totalPrice: Number(
        totalPrice.toFixed(2)
      ),
    };

    try {
      setLoading(true);

      const headers = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const { data } = await axios.post(
        apiUrl("/api/orders"),
        orderData,
        { headers }
      );

      clearCart();
      localStorage.removeItem("cart");

      navigate("/order-success", {
        state: {
          order: data,
        },
      });
    } catch (requestError) {
      console.error(
        "Place order error:",
        requestError
      );

      setError(
        requestError.response?.data?.message ||
          (requestError.message === "Network Error" ||
          !requestError.response
            ? "Cannot reach the server. Check that the backend API URL is set correctly."
            : "Order could not be placed. Please try again.")
      );

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } finally {
      setLoading(false);
    }
  }

  if (cart.length === 0) {
    return (
      <main style={emptyPageStyle}>
        <div style={emptyCardStyle}>
          <div style={emptyIconStyle}>🛒</div>

          <h1 style={emptyTitleStyle}>
            Checkout
          </h1>

          <p style={emptyTextStyle}>
            Your cart is empty. Add products
            before continuing.
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
        <p style={pageLabelStyle}>
          Riani Shop
        </p>

        <h1 style={titleStyle}>Checkout</h1>

        <p style={subtitleStyle}>
          Enter your shipping details and review your
          order. You can place an order as a guest —
          login is optional.
        </p>
      </div>

      <div style={checkoutStepsStyle}>
        <div style={activeStepStyle}>
          <span style={stepNumberStyle}>1</span>
          Shipping
        </div>

        <div style={stepLineStyle} />

        <div style={activeStepStyle}>
          <span style={stepNumberStyle}>2</span>
          Delivery
        </div>

        <div style={stepLineStyle} />

        <div style={activeStepStyle}>
          <span style={stepNumberStyle}>3</span>
          Review
        </div>
      </div>

      {error && (
        <p style={errorStyle}>{error}</p>
      )}

      <div style={checkoutLayoutStyle}>
        <form
          onSubmit={handleSubmit}
          style={formCardStyle}
        >
          <section style={formSectionStyle}>
            <h2 style={sectionTitleStyle}>
              Shipping Information
            </h2>

            <div style={twoColumnStyle}>
              <label style={labelTextStyle}>
                Full name
                <input
                  type="text"
                  name="fullName"
                  placeholder="Enter your full name"
                  value={formData.fullName}
                  onChange={handleChange}
                  style={inputStyle}
                  autoComplete="name"
                  required
                />
              </label>

              <label style={labelTextStyle}>
                Phone number
                <input
                  type="tel"
                  name="phone"
                  placeholder="+46 70 123 45 67"
                  value={formData.phone}
                  onChange={handleChange}
                  style={inputStyle}
                  autoComplete="tel"
                  required
                />
              </label>
            </div>

            <label style={labelTextStyle}>
              Email
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                style={inputStyle}
                autoComplete="email"
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
                autoComplete="street-address"
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
                  autoComplete="address-level2"
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
                  autoComplete="postal-code"
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
                autoComplete="country-name"
                required
              />
            </label>
          </section>

          <section style={formSectionStyle}>
            <h2 style={sectionTitleStyle}>
              Delivery Method
            </h2>

            <div style={deliveryOptionsStyle}>
              <label
                style={{
                  ...deliveryOptionStyle,
                  borderColor:
                    deliveryMethod === "standard"
                      ? "#111111"
                      : "#dddddd",
                  backgroundColor:
                    deliveryMethod === "standard"
                      ? "#f7f7f7"
                      : "#ffffff",
                }}
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="standard"
                  checked={
                    deliveryMethod === "standard"
                  }
                  onChange={(event) =>
                    setDeliveryMethod(
                      event.target.value
                    )
                  }
                />

                <div style={deliveryTextStyle}>
                  <strong>
                    Standard Delivery
                  </strong>

                  <span style={deliveryDescriptionStyle}>
                    3–5 business days
                  </span>
                </div>

                <strong>
                  {standardShippingPrice === 0
                    ? "Free"
                    : `$${standardShippingPrice.toFixed(
                        2
                      )}`}
                </strong>
              </label>

              <label
                style={{
                  ...deliveryOptionStyle,
                  borderColor:
                    deliveryMethod === "express"
                      ? "#111111"
                      : "#dddddd",
                  backgroundColor:
                    deliveryMethod === "express"
                      ? "#f7f7f7"
                      : "#ffffff",
                }}
              >
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="express"
                  checked={
                    deliveryMethod === "express"
                  }
                  onChange={(event) =>
                    setDeliveryMethod(
                      event.target.value
                    )
                  }
                />

                <div style={deliveryTextStyle}>
                  <strong>
                    Express Delivery
                  </strong>

                  <span style={deliveryDescriptionStyle}>
                    1–2 business days
                  </span>
                </div>

                <strong>$20.00</strong>
              </label>
            </div>

            <div style={estimatedDeliveryStyle}>
              <span style={estimatedIconStyle}>
                🚚
              </span>

              <div>
                <strong>
                  Estimated Delivery
                </strong>

                <p style={estimatedTextStyle}>
                  Your order should arrive within{" "}
                  {estimatedDelivery}.
                </p>
              </div>
            </div>
          </section>

          <section style={formSectionStyle}>
            <h2 style={sectionTitleStyle}>
              Payment Method
            </h2>

            <div style={paymentBoxStyle}>
              <div style={paymentHeaderStyle}>
                <span style={paymentIconStyle}>
                  💵
                </span>

                <div>
                  <strong>
                    Cash on Delivery
                  </strong>

                  <p style={paymentTextStyle}>
                    You will pay when your order
                    is delivered.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section style={formSectionStyle}>
            <h2 style={sectionTitleStyle}>
              Order Notes
            </h2>

            <label style={labelTextStyle}>
              Special instructions{" "}
              <span style={optionalTextStyle}>
                Optional
              </span>

              <textarea
                name="notes"
                rows={4}
                placeholder="For example: call before delivery or leave the package at the door."
                value={formData.notes}
                onChange={handleChange}
                style={textareaStyle}
              />
            </label>
          </section>

          <label style={termsStyle}>
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(event) =>
                setTermsAccepted(
                  event.target.checked
                )
              }
              style={checkboxStyle}
              required
            />

            <span>
              I agree to the{" "}
              <button
                type="button"
                style={termsLinkStyle}
              >
                Terms & Conditions
              </button>{" "}
              and{" "}
              <button
                type="button"
                style={termsLinkStyle}
              >
                Privacy Policy
              </button>
              .
            </span>
          </label>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...buttonStyle,
              width: "100%",
              opacity: loading ? 0.65 : 1,
              cursor: loading
                ? "not-allowed"
                : "pointer",
            }}
          >
            {loading
              ? "Placing Order..."
              : `Place Order · $${totalPrice.toFixed(
                  2
                )}`}
          </button>

          <div style={checkoutSecurityStyle}>
            <span>🔒 Secure checkout</span>
            <span>✓ Protected information</span>
          </div>
        </form>

        <section style={summaryCardStyle}>
          <h2 style={sectionTitleStyle}>
            Order Summary
          </h2>

          <div style={summaryProductsStyle}>
            {cart.map((item, index) => {
              const productId =
                item.productId ||
                item._id ||
                item.id;

              const selectedSize =
                item.selectedSize ||
                item.size ||
                null;

              const selectedColor =
                item.selectedColor ||
                item.color ||
                null;

              const quantity = Number(
                item.quantity || 1
              );

              const price = Number(
                item.price || 0
              );

              const cartKey = [
                productId,
                selectedSize || "no-size",
                selectedColor || "no-color",
                index,
              ].join("-");

              return (
                <div
                  key={cartKey}
                  style={summaryItemStyle}
                >
                  <div style={summaryItemContentStyle}>
                    {item.image ? (
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        style={summaryImageStyle}
                      />
                    ) : (
                      <div style={noImageStyle}>
                        No image
                      </div>
                    )}

                    <div>
                      <p style={productNameStyle}>
                        {item.name}
                      </p>

                      <p style={quantityTextStyle}>
                        Quantity: {quantity}
                      </p>

                      {(selectedSize ||
                        selectedColor) && (
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
                  </div>

                  <strong>
                    $
                    {(price * quantity).toFixed(
                      2
                    )}
                  </strong>
                </div>
              );
            })}
          </div>

          <div style={promoSectionStyle}>
            <p style={promoTitleStyle}>
              Promo Code
            </p>

            <div style={promoInputGroupStyle}>
              <input
                type="text"
                placeholder="Enter promo code"
                value={promoCode}
                onChange={(event) => {
                  setPromoCode(event.target.value);
                  setPromoMessage("");
                }}
                style={promoInputStyle}
                disabled={Boolean(
                  appliedPromoCode
                )}
              />

              {appliedPromoCode ? (
                <button
                  type="button"
                  onClick={handleRemovePromoCode}
                  style={removePromoButtonStyle}
                >
                  Remove
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleApplyPromoCode}
                  style={applyButtonStyle}
                >
                  Apply
                </button>
              )}
            </div>

            <p style={promoHintStyle}>
              Test code:{" "}
              <strong>RIANI10</strong>
            </p>

            {promoMessage && (
              <p
                style={{
                  ...promoMessageStyle,
                  color: appliedPromoCode
                    ? "#167329"
                    : "#b00020",
                }}
              >
                {promoMessage}
              </p>
            )}
          </div>

          <div style={priceRowsStyle}>
            <div style={priceRowStyle}>
              <span>Items</span>

              <strong>
                ${itemsPrice.toFixed(2)}
              </strong>
            </div>

            {discountPrice > 0 && (
              <div
                style={{
                  ...priceRowStyle,
                  color: "#167329",
                }}
              >
                <span>Promo discount</span>

                <strong>
                  −${discountPrice.toFixed(2)}
                </strong>
              </div>
            )}

            <div style={priceRowStyle}>
              <span>Shipping</span>

              <strong>
                {shippingPrice === 0
                  ? "Free"
                  : `$${shippingPrice.toFixed(
                      2
                    )}`}
              </strong>
            </div>

            <div style={priceRowStyle}>
              <span>Tax</span>

              <strong>
                ${taxPrice.toFixed(2)}
              </strong>
            </div>
          </div>

          <div style={totalRowStyle}>
            <span>Total</span>

            <strong>
              ${totalPrice.toFixed(2)}
            </strong>
          </div>

          <div style={deliverySummaryStyle}>
            <p style={deliverySummaryTitleStyle}>
              Delivery
            </p>

            <p style={deliverySummaryTextStyle}>
              {deliveryMethod === "express"
                ? "Express Delivery"
                : "Standard Delivery"}
            </p>

            <p style={deliverySummaryTextStyle}>
              Estimated: {estimatedDelivery}
            </p>
          </div>

          <div style={summaryInformationStyle}>
            <p>✓ Secure checkout</p>
            <p>✓ Free standard shipping over $100</p>
            <p>✓ Easy returns</p>
            <p>✓ Cash on delivery</p>
          </div>
        </section>
      </div>
    </main>
  );
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

const pageStyle = {
  maxWidth: "1180px",
  margin: "0 auto",
  padding: "50px 20px 90px",
};

const headerStyle = {
  marginBottom: "25px",
};

const pageLabelStyle = {
  margin: "0 0 7px",
  color: "#777777",
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
  color: "#666666",
};

const checkoutStepsStyle = {
  display: "flex",
  alignItems: "center",
  maxWidth: "520px",
  marginBottom: "30px",
};

const activeStepStyle = {
  display: "flex",
  alignItems: "center",
  gap: "7px",
  color: "#222222",
  fontSize: "13px",
  fontWeight: "700",
  whiteSpace: "nowrap",
};

const stepNumberStyle = {
  width: "25px",
  height: "25px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "50%",
  backgroundColor: "#111111",
  color: "#ffffff",
  fontSize: "12px",
};

const stepLineStyle = {
  flex: 1,
  height: "1px",
  margin: "0 12px",
  backgroundColor: "#cccccc",
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
    "minmax(0, 1.35fr) minmax(320px, 0.8fr)",
  gap: "35px",
  alignItems: "start",
};

const formCardStyle = {
  padding: "30px",
  border: "1px solid #e1e1e1",
  borderRadius: "14px",
  backgroundColor: "#ffffff",
};

const formSectionStyle = {
  paddingBottom: "28px",
  marginBottom: "28px",
  borderBottom: "1px solid #eeeeee",
};

const summaryCardStyle = {
  position: "sticky",
  top: "25px",
  padding: "28px",
  border: "1px solid #e1e1e1",
  borderRadius: "14px",
  backgroundColor: "#fafafa",
};

const sectionTitleStyle = {
  margin: "0 0 24px",
  fontSize: "23px",
};

const labelTextStyle = {
  display: "block",
  marginBottom: "18px",
  color: "#333333",
  fontSize: "14px",
  fontWeight: "700",
};

const optionalTextStyle = {
  color: "#888888",
  fontSize: "12px",
  fontWeight: "400",
};

const inputStyle = {
  width: "100%",
  marginTop: "7px",
  padding: "13px",
  boxSizing: "border-box",
  border: "1px solid #cccccc",
  borderRadius: "7px",
  backgroundColor: "#ffffff",
  fontSize: "15px",
  outline: "none",
};

const textareaStyle = {
  ...inputStyle,
  minHeight: "110px",
  resize: "vertical",
  fontFamily: "inherit",
};

const twoColumnStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(190px, 1fr))",
  gap: "16px",
};

const deliveryOptionsStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const deliveryOptionStyle = {
  display: "grid",
  gridTemplateColumns: "auto 1fr auto",
  alignItems: "center",
  gap: "13px",
  padding: "17px",
  border: "1px solid #dddddd",
  borderRadius: "9px",
  cursor: "pointer",
};

const deliveryTextStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "5px",
};

const deliveryDescriptionStyle = {
  color: "#666666",
  fontSize: "13px",
};

const estimatedDeliveryStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "13px",
  padding: "16px",
  marginTop: "18px",
  borderRadius: "9px",
  backgroundColor: "#f4f4f4",
};

const estimatedIconStyle = {
  fontSize: "24px",
};

const estimatedTextStyle = {
  margin: "5px 0 0",
  color: "#666666",
  fontSize: "13px",
};

const paymentBoxStyle = {
  padding: "18px",
  border: "1px solid #dddddd",
  borderRadius: "9px",
  backgroundColor: "#f8f8f8",
};

const paymentHeaderStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "13px",
};

const paymentIconStyle = {
  fontSize: "25px",
};

const paymentTextStyle = {
  margin: "6px 0 0",
  color: "#666666",
  fontSize: "13px",
};

const termsStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "10px",
  marginTop: "5px",
  color: "#444444",
  fontSize: "14px",
  lineHeight: 1.5,
};

const checkboxStyle = {
  marginTop: "3px",
};

const termsLinkStyle = {
  padding: 0,
  border: "none",
  background: "transparent",
  color: "#111111",
  fontWeight: "700",
  textDecoration: "underline",
  cursor: "pointer",
};

const buttonStyle = {
  marginTop: "22px",
  padding: "15px 25px",
  border: "none",
  borderRadius: "8px",
  backgroundColor: "#111111",
  color: "#ffffff",
  fontSize: "16px",
  fontWeight: "700",
  cursor: "pointer",
};

const checkoutSecurityStyle = {
  display: "flex",
  justifyContent: "center",
  flexWrap: "wrap",
  gap: "10px 18px",
  marginTop: "16px",
  color: "#666666",
  fontSize: "12px",
};

const summaryProductsStyle = {
  maxHeight: "390px",
  overflowY: "auto",
  paddingRight: "3px",
};

const summaryItemStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "16px",
  padding: "15px 0",
  borderBottom: "1px solid #dddddd",
};

const summaryItemContentStyle = {
  display: "flex",
  gap: "12px",
  minWidth: 0,
};

const summaryImageStyle = {
  width: "62px",
  height: "75px",
  flexShrink: 0,
  objectFit: "cover",
  borderRadius: "7px",
  backgroundColor: "#eeeeee",
};

const noImageStyle = {
  width: "62px",
  height: "75px",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "7px",
  backgroundColor: "#eeeeee",
  color: "#777777",
  fontSize: "10px",
  textAlign: "center",
};

const productNameStyle = {
  margin: 0,
  fontWeight: "700",
};

const quantityTextStyle = {
  margin: "6px 0 0",
  color: "#777777",
  fontSize: "12px",
};

const variantTextStyle = {
  margin: "4px 0 0",
  color: "#666666",
  fontSize: "12px",
};

const promoSectionStyle = {
  padding: "22px 0",
  borderBottom: "1px solid #dddddd",
};

const promoTitleStyle = {
  margin: "0 0 10px",
  fontWeight: "700",
};

const promoInputGroupStyle = {
  display: "flex",
  gap: "9px",
};

const promoInputStyle = {
  minWidth: 0,
  flex: 1,
  padding: "11px",
  border: "1px solid #cccccc",
  borderRadius: "7px",
  fontSize: "14px",
  textTransform: "uppercase",
};

const applyButtonStyle = {
  padding: "0 16px",
  border: "none",
  borderRadius: "7px",
  backgroundColor: "#111111",
  color: "#ffffff",
  fontWeight: "700",
  cursor: "pointer",
};

const removePromoButtonStyle = {
  padding: "0 14px",
  border: "1px solid #b00020",
  borderRadius: "7px",
  backgroundColor: "#ffffff",
  color: "#b00020",
  fontWeight: "700",
  cursor: "pointer",
};

const promoHintStyle = {
  margin: "8px 0 0",
  color: "#777777",
  fontSize: "12px",
};

const promoMessageStyle = {
  margin: "8px 0 0",
  fontSize: "13px",
  fontWeight: "600",
};

const priceRowsStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "14px",
  padding: "24px 0",
  borderBottom: "1px solid #dddddd",
};

const priceRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  color: "#555555",
};

const totalRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  paddingTop: "22px",
  fontSize: "21px",
};

const deliverySummaryStyle = {
  padding: "16px",
  marginTop: "22px",
  borderRadius: "8px",
  backgroundColor: "#eeeeee",
};

const deliverySummaryTitleStyle = {
  margin: "0 0 7px",
  fontWeight: "700",
};

const deliverySummaryTextStyle = {
  margin: "4px 0",
  color: "#666666",
  fontSize: "13px",
};

const summaryInformationStyle = {
  marginTop: "22px",
  color: "#666666",
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
  backgroundColor: "#ffffff",
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
  color: "#666666",
};

export default Checkout;
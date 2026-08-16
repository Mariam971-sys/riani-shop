import { useContext, useEffect, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { mediaUrl, apiUrl } from "../config/api";
import { formatSek } from "../config/shop";
import { CartContext } from "../context/CartContext";
import {
  loadLastOrder,
  saveGuestOrder,
  saveLastOrder,
} from "../utils/guestOrders";

function OrderSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useContext(CartContext) || {};
  const sessionId = searchParams.get("session_id");

  const [order, setOrder] = useState(
    location.state?.order || loadLastOrder()
  );
  const [loading, setLoading] = useState(Boolean(sessionId) && !location.state?.order);
  const [error, setError] = useState("");

  useEffect(() => {
    if (location.state?.order) {
      saveLastOrder(location.state.order);
      saveGuestOrder(location.state.order);
      setOrder(location.state.order);
    }
  }, [location.state]);

  useEffect(() => {
    async function loadPaidOrder() {
      if (!sessionId) {
        return;
      }

      try {
        setLoading(true);
        const { data } = await axios.get(
          apiUrl(`/payments/session/${sessionId}`)
        );
        if (data?.order) {
          saveLastOrder(data.order);
          saveGuestOrder(data.order);
          setOrder(data.order);
          if (typeof clearCart === "function") {
            clearCart();
          }
        }
      } catch (loadError) {
        console.error("Load paid order error:", loadError);
        setError(
          loadError.response?.data?.message ||
            "Could not confirm payment."
        );
      } finally {
        setLoading(false);
      }
    }

    loadPaidOrder();
  }, [sessionId, clearCart]);

  function getOrderId() {
    return order?._id || order?.id || "Not available";
  }

  function getOrderItems() {
    return Array.isArray(order?.orderItems)
      ? order.orderItems
      : [];
  }

  function getShippingAddress() {
    return order?.shippingAddress || {};
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

  const orderItems = getOrderItems();
  const shippingAddress = getShippingAddress();

  const totalPrice = Number(order?.totalPrice || 0);
  const itemsPrice = Number(order?.itemsPrice || 0);
  const shippingPrice = Number(order?.shippingPrice || 0);
  const taxPrice = Number(order?.taxPrice || 0);

  if (loading) {
    return (
      <main style={emptyPageStyle}>
        <div style={emptyCardStyle}>
          <h1>Confirming payment...</h1>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main style={emptyPageStyle}>
        <div style={emptyCardStyle}>
          <h1>Order information unavailable</h1>

          <p style={emptyTextStyle}>
            {error ||
              "The order details could not be found. You may have refreshed the page or opened it directly."}
          </p>

          <div style={buttonGroupStyle}>
            <button
              type="button"
              onClick={() => navigate("/orders")}
              style={primaryButtonStyle}
            >
              View My Orders
            </button>

            <button
              type="button"
              onClick={() => navigate("/shop")}
              style={secondaryButtonStyle}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <section style={successHeaderStyle}>
        <div style={successIconStyle}>✓</div>

        <p style={successLabelStyle}>Order confirmed</p>

        <h1 style={successTitleStyle}>
          Thank you for your order
        </h1>

        <p style={successTextStyle}>
          Your order has been placed successfully. We will begin
          processing it shortly.
        </p>
      </section>

      <section style={orderNumberCardStyle}>
        <div>
          <span style={smallLabelStyle}>Order number</span>

          <strong style={orderNumberStyle}>
            {getOrderId()}
          </strong>
        </div>

        <div>
          <span style={smallLabelStyle}>Payment method</span>

          <strong>
            {order.paymentMethod || "Cash on Delivery"}
          </strong>
        </div>

        <div>
          <span style={smallLabelStyle}>Order status</span>

          <strong style={statusStyle}>
            {order.status || "Processing"}
          </strong>
        </div>
      </section>

      <div style={contentGridStyle}>
        <section style={mainContentStyle}>
          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>Order Items</h2>

            {orderItems.length === 0 ? (
              <p style={mutedTextStyle}>
                No products were found in this order.
              </p>
            ) : (
              <div>
                {orderItems.map((item, index) => {
                  const quantity = Number(item.quantity || 1);
                  const price = Number(item.price || 0);
                  const subtotal = price * quantity;

                  const itemKey = [
                    item.product || item._id || item.id,
                    item.size || item.selectedSize || "no-size",
                    item.color || item.selectedColor || "no-color",
                    index,
                  ].join("-");

                  return (
                    <article key={itemKey} style={orderItemStyle}>
                      <div style={imageWrapperStyle}>
                        {item.image ? (
                          <img
                            src={getImageUrl(item.image)}
                            alt={item.name}
                            style={productImageStyle}
                          />
                        ) : (
                          <div style={noImageStyle}>
                            No image
                          </div>
                        )}
                      </div>

                      <div style={productInfoStyle}>
                        <h3 style={productNameStyle}>
                          {item.name}
                        </h3>

                        <div style={variantListStyle}>
                          {(item.size || item.selectedSize) && (
                            <span style={variantBadgeStyle}>
                              Size:{" "}
                              {item.size || item.selectedSize}
                            </span>
                          )}

                          {(item.color || item.selectedColor) && (
                            <span style={variantBadgeStyle}>
                              Color:{" "}
                              {item.color || item.selectedColor}
                            </span>
                          )}
                        </div>

                        <p style={quantityTextStyle}>
                          Quantity: {quantity}
                        </p>
                      </div>

                      <div style={priceBoxStyle}>
                        <span style={unitPriceStyle}>
                          {formatSek(price)} each
                        </span>

                        <strong style={subtotalStyle}>
                          {formatSek(subtotal)}
                        </strong>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>
              Shipping Information
            </h2>

            <div style={shippingGridStyle}>
              <div>
                <span style={smallLabelStyle}>
                  Customer
                </span>

                <strong style={detailValueStyle}>
                  {shippingAddress.fullName || "-"}
                </strong>
              </div>

              <div>
                <span style={smallLabelStyle}>Email</span>

                <strong style={detailValueStyle}>
                  {shippingAddress.email || "-"}
                </strong>
              </div>

              <div>
                <span style={smallLabelStyle}>Phone</span>

                <strong style={detailValueStyle}>
                  {shippingAddress.phone || "-"}
                </strong>
              </div>

              <div>
                <span style={smallLabelStyle}>Address</span>

                <strong style={detailValueStyle}>
                  {shippingAddress.address || "-"}
                </strong>
              </div>

              <div>
                <span style={smallLabelStyle}>City</span>

                <strong style={detailValueStyle}>
                  {shippingAddress.city || "-"}
                </strong>
              </div>

              <div>
                <span style={smallLabelStyle}>
                  Postal code
                </span>

                <strong style={detailValueStyle}>
                  {shippingAddress.postalCode || "-"}
                </strong>
              </div>

              <div>
                <span style={smallLabelStyle}>Country</span>

                <strong style={detailValueStyle}>
                  {shippingAddress.country || "-"}
                </strong>
              </div>
            </div>
          </div>
        </section>

        <aside style={summaryCardStyle}>
          <h2 style={sectionTitleStyle}>Order Summary</h2>

          <div style={summaryRowsStyle}>
            <div style={summaryRowStyle}>
              <span>Items</span>
              <span>{formatSek(itemsPrice)}</span>
            </div>

            <div style={summaryRowStyle}>
              <span>Shipping</span>

              <span>
                {shippingPrice === 0
                  ? "Free"
                  : formatSek(shippingPrice)}
              </span>
            </div>

            <div style={summaryRowStyle}>
              <span>Tax</span>
              <span>{formatSek(taxPrice)}</span>
            </div>
          </div>

          <div style={totalRowStyle}>
            <span>Total</span>

            <strong>{formatSek(totalPrice)}</strong>
          </div>

          <div style={buttonColumnStyle}>
            <button
              type="button"
              onClick={() => navigate("/orders")}
              style={primaryButtonStyle}
            >
              View My Orders
            </button>

            <button
              type="button"
              onClick={() => navigate("/shop")}
              style={secondaryButtonStyle}
            >
              Continue Shopping
            </button>
          </div>

          <div style={infoBoxStyle}>
            <p>✓ Your order has been received</p>
            <p>✓ Payment received</p>
            <p>✓ You can track the order from My Orders</p>
          </div>
        </aside>
      </div>
    </main>
  );
}

const pageStyle = {
  maxWidth: "1180px",
  margin: "0 auto",
  padding: "50px 20px 90px",
};

const successHeaderStyle = {
  maxWidth: "700px",
  margin: "0 auto 40px",
  textAlign: "center",
};

const successIconStyle = {
  width: "74px",
  height: "74px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  margin: "0 auto 20px",
  borderRadius: "50%",
  backgroundColor: "#e7f7eb",
  color: "#167329",
  fontSize: "38px",
  fontWeight: "800",
};

const successLabelStyle = {
  margin: "0 0 8px",
  color: "#167329",
  fontSize: "13px",
  fontWeight: "800",
  textTransform: "uppercase",
  letterSpacing: "1.2px",
};

const successTitleStyle = {
  margin: "0 0 12px",
  fontSize: "clamp(34px, 5vw, 52px)",
};

const successTextStyle = {
  margin: 0,
  color: "#666666",
  fontSize: "16px",
  lineHeight: 1.7,
};

const orderNumberCardStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(190px, 1fr))",
  gap: "24px",
  marginBottom: "35px",
  padding: "24px",
  border: "1px solid #e4e4e4",
  borderRadius: "12px",
  backgroundColor: "#fafafa",
};

const smallLabelStyle = {
  display: "block",
  marginBottom: "6px",
  color: "#777777",
  fontSize: "12px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.7px",
};

const orderNumberStyle = {
  display: "block",
  overflowWrap: "anywhere",
};

const statusStyle = {
  color: "#a26700",
};

const contentGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "minmax(0, 1.7fr) minmax(300px, 0.8fr)",
  gap: "32px",
  alignItems: "start",
};

const mainContentStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "25px",
  minWidth: 0,
};

const cardStyle = {
  padding: "26px",
  border: "1px solid #e4e4e4",
  borderRadius: "12px",
  backgroundColor: "#ffffff",
};

const sectionTitleStyle = {
  margin: "0 0 22px",
  fontSize: "24px",
};

const mutedTextStyle = {
  color: "#777777",
};

const orderItemStyle = {
  display: "grid",
  gridTemplateColumns: "90px minmax(0, 1fr) auto",
  gap: "18px",
  alignItems: "center",
  padding: "18px 0",
  borderBottom: "1px solid #eeeeee",
};

const imageWrapperStyle = {
  width: "90px",
  height: "105px",
  overflow: "hidden",
  borderRadius: "8px",
  backgroundColor: "#f5f5f5",
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
  color: "#888888",
  fontSize: "12px",
};

const productInfoStyle = {
  minWidth: 0,
};

const productNameStyle = {
  margin: "0 0 10px",
  fontSize: "18px",
};

const variantListStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: "8px",
};

const variantBadgeStyle = {
  padding: "5px 9px",
  borderRadius: "5px",
  backgroundColor: "#f2f2f2",
  color: "#555555",
  fontSize: "12px",
};

const quantityTextStyle = {
  margin: "10px 0 0",
  color: "#666666",
  fontSize: "13px",
};

const priceBoxStyle = {
  minWidth: "100px",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  gap: "7px",
};

const unitPriceStyle = {
  color: "#777777",
  fontSize: "12px",
};

const subtotalStyle = {
  fontSize: "17px",
};

const shippingGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(190px, 1fr))",
  gap: "22px",
};

const detailValueStyle = {
  display: "block",
  lineHeight: 1.5,
  overflowWrap: "anywhere",
};

const summaryCardStyle = {
  position: "sticky",
  top: "25px",
  padding: "26px",
  border: "1px solid #e4e4e4",
  borderRadius: "12px",
  backgroundColor: "#fafafa",
};

const summaryRowsStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "15px",
  paddingBottom: "22px",
  borderBottom: "1px solid #dddddd",
};

const summaryRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  color: "#555555",
};

const totalRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  margin: "22px 0",
  fontSize: "21px",
};

const buttonColumnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "12px",
};

const primaryButtonStyle = {
  width: "100%",
  padding: "14px 20px",
  border: "none",
  borderRadius: "7px",
  backgroundColor: "#111111",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  width: "100%",
  padding: "13px 20px",
  border: "1px solid #222222",
  borderRadius: "7px",
  backgroundColor: "#ffffff",
  color: "#222222",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
};

const infoBoxStyle = {
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
  maxWidth: "520px",
  padding: "45px 35px",
  border: "1px solid #e5e5e5",
  borderRadius: "14px",
  textAlign: "center",
};

const emptyTextStyle = {
  color: "#666666",
  lineHeight: 1.7,
};

const buttonGroupStyle = {
  display: "flex",
  gap: "12px",
  marginTop: "25px",
  flexWrap: "wrap",
};

export default OrderSuccess;
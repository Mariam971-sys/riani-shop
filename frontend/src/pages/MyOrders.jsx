import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiUrl, mediaUrl } from "../config/api";
import { formatSek } from "../config/shop";
import { loadGuestOrders } from "../utils/guestOrders";

function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchMyOrders() {
      setLoading(true);
      setError("");

      let token = localStorage.getItem("token");

      const savedUser = localStorage.getItem("userInfo");

      if (!token && savedUser) {
        try {
          const userInfo = JSON.parse(savedUser);
          token = userInfo.token;
        } catch (error) {
          console.error("Could not read user information:", error);
        }
      }

      if (!token) {
        setOrders(loadGuestOrders());
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get(
          apiUrl("/orders/myorders"),
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const orderList = Array.isArray(data)
          ? data
          : data.orders || [];

        setOrders(orderList);
      } catch (error) {
        console.error("Fetch my orders error:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("userInfo");
          navigate("/login");
          return;
        }

        setError(
          error.response?.data?.message ||
            "Could not load your orders."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchMyOrders();
  }, [navigate]);

  function formatDate(dateValue) {
    if (!dateValue) {
      return "Not available";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Not available";
    }

    return date.toLocaleDateString("en-SE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function getOrderStatus(order) {
    if (order.isDelivered) {
      return {
        text: "Delivered",
        backgroundColor: "#e7f7eb",
        color: "#167329",
      };
    }

    if (order.status) {
      const status = String(order.status).toLowerCase();

      if (status === "delivered") {
        return {
          text: "Delivered",
          backgroundColor: "#e7f7eb",
          color: "#167329",
        };
      }

      if (status === "shipped") {
        return {
          text: "Shipped",
          backgroundColor: "#e6f0ff",
          color: "#1d5fa7",
        };
      }

      if (status === "cancelled") {
        return {
          text: "Cancelled",
          backgroundColor: "#ffe7e7",
          color: "#b00020",
        };
      }

      if (status === "processing") {
        return {
          text: "Processing",
          backgroundColor: "#fff4d9",
          color: "#8a5a00",
        };
      }

      return {
        text: order.status,
        backgroundColor: "#f0f0f0",
        color: "#444444",
      };
    }

    return {
      text: "Processing",
      backgroundColor: "#fff4d9",
      color: "#8a5a00",
    };
  }

  function getPaymentStatus(order) {
    if (order.isPaid) {
      return {
        text: "Paid",
        color: "#167329",
      };
    }

    return {
      text:
        order.paymentMethod === "Cash on Delivery"
          ? "Pay on delivery"
          : "Not paid",
      color: "#a26700",
    };
  }

  if (loading) {
    return (
      <main style={centerPageStyle}>
        <p style={loadingTextStyle}>Loading your orders...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={centerPageStyle}>
        <div style={messageCardStyle}>
          <h1>Could not load orders</h1>

          <p style={errorTextStyle}>{error}</p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            style={primaryButtonStyle}
          >
            Try Again
          </button>
        </div>
      </main>
    );
  }

  if (orders.length === 0) {
    return (
      <main style={centerPageStyle}>
        <div style={messageCardStyle}>
          <div style={emptyIconStyle}>📦</div>

          <h1>No orders yet</h1>

          <p style={mutedTextStyle}>
            You have not placed any orders yet. Products you order
            will appear here.
          </p>

          <button
            type="button"
            onClick={() => navigate("/shop")}
            style={primaryButtonStyle}
          >
            Start Shopping
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <p style={smallLabelStyle}>Riani Shop</p>

          <h1 style={titleStyle}>My Orders</h1>

          <p style={subtitleStyle}>
            View and track all your previous orders.
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/shop")}
          style={secondaryButtonStyle}
        >
          Continue Shopping
        </button>
      </div>

      <section style={ordersContainerStyle}>
        {orders.map((order) => {
          const orderId = order._id || order.id;
          const orderItems = Array.isArray(order.orderItems)
            ? order.orderItems
            : [];

          const orderStatus = getOrderStatus(order);
          const paymentStatus = getPaymentStatus(order);

          return (
            <article key={orderId} style={orderCardStyle}>
              <div style={orderTopRowStyle}>
                <div style={orderInformationStyle}>
                  <div>
                    <span style={fieldLabelStyle}>Order</span>

                    <strong style={orderIdStyle}>
                      #{String(orderId).slice(-8).toUpperCase()}
                    </strong>
                  </div>

                  <div>
                    <span style={fieldLabelStyle}>Date</span>

                    <strong>
                      {formatDate(order.createdAt)}
                    </strong>
                  </div>

                  <div>
                    <span style={fieldLabelStyle}>Total</span>

                    <strong>
                      {formatSek(Number(order.totalPrice || 0))}
                    </strong>
                  </div>

                  <div>
                    <span style={fieldLabelStyle}>Payment</span>

                    <strong
                      style={{
                        color: paymentStatus.color,
                      }}
                    >
                      {paymentStatus.text}
                    </strong>
                  </div>
                </div>

                <span
                  style={{
                    ...statusBadgeStyle,
                    backgroundColor:
                      orderStatus.backgroundColor,
                    color: orderStatus.color,
                  }}
                >
                  {orderStatus.text}
                </span>
              </div>

              <div style={productPreviewContainerStyle}>
                {orderItems.slice(0, 4).map((item, index) => {
                  const itemKey = [
                    item.product || item._id || item.id,
                    item.size || item.selectedSize || "no-size",
                    item.color || item.selectedColor || "no-color",
                    index,
                  ].join("-");

                  return (
                    <div key={itemKey} style={productPreviewStyle}>
                      {item.image ? (
                        <img
                          src={getImageUrl(item.image)}
                          alt={item.name}
                          style={productImageStyle}
                        />
                      ) : (
                        <div style={noImageStyle}>No image</div>
                      )}

                      <div style={productTextStyle}>
                        <strong style={productNameStyle}>
                          {item.name}
                        </strong>

                        <span style={productMetaStyle}>
                          Qty: {Number(item.quantity || 1)}
                        </span>

                        {(item.size || item.selectedSize) && (
                          <span style={productMetaStyle}>
                            Size:{" "}
                            {item.size || item.selectedSize}
                          </span>
                        )}

                        {(item.color || item.selectedColor) && (
                          <span style={productMetaStyle}>
                            Color:{" "}
                            {item.color || item.selectedColor}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}

                {orderItems.length > 4 && (
                  <div style={moreItemsStyle}>
                    +{orderItems.length - 4} more
                  </div>
                )}
              </div>

              <div style={orderBottomRowStyle}>
                <div style={deliveryTextStyle}>
                  {order.isDelivered && order.deliveredAt ? (
                    <span>
                      Delivered on{" "}
                      <strong>
                        {formatDate(order.deliveredAt)}
                      </strong>
                    </span>
                  ) : (
                    <span>
                      Delivery status:{" "}
                      <strong>{orderStatus.text}</strong>
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    navigate(
                      `/orders/${orderId}${
                        order.shippingAddress?.email
                          ? `?email=${encodeURIComponent(
                              order.shippingAddress.email
                            )}`
                          : ""
                      }`,
                      {
                        state: {
                          order,
                        },
                      }
                    )
                  }
                  style={viewOrderButtonStyle}
                >
                  View Order
                </button>
              </div>
            </article>
          );
        })}
      </section>
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
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: "20px",
  marginBottom: "35px",
  flexWrap: "wrap",
};

const smallLabelStyle = {
  margin: "0 0 7px",
  color: "#777777",
  fontSize: "13px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "1px",
};

const titleStyle = {
  margin: 0,
  fontSize: "clamp(34px, 5vw, 48px)",
};

const subtitleStyle = {
  margin: "9px 0 0",
  color: "#666666",
};

const ordersContainerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "22px",
};

const orderCardStyle = {
  padding: "24px",
  border: "1px solid #e3e3e3",
  borderRadius: "12px",
  backgroundColor: "#ffffff",
};

const orderTopRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
  paddingBottom: "20px",
  borderBottom: "1px solid #eeeeee",
  flexWrap: "wrap",
};

const orderInformationStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(120px, 1fr))",
  gap: "25px",
  flex: 1,
};

const fieldLabelStyle = {
  display: "block",
  marginBottom: "5px",
  color: "#888888",
  fontSize: "11px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.6px",
};

const orderIdStyle = {
  display: "block",
  overflowWrap: "anywhere",
};

const statusBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "7px 12px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "800",
  whiteSpace: "nowrap",
};

const productPreviewContainerStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(210px, 1fr))",
  gap: "16px",
  padding: "22px 0",
};

const productPreviewStyle = {
  display: "flex",
  alignItems: "center",
  gap: "12px",
  minWidth: 0,
};

const productImageStyle = {
  width: "66px",
  height: "78px",
  flexShrink: 0,
  objectFit: "cover",
  borderRadius: "7px",
  backgroundColor: "#f3f3f3",
};

const noImageStyle = {
  width: "66px",
  height: "78px",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "7px",
  backgroundColor: "#f3f3f3",
  color: "#888888",
  fontSize: "10px",
};

const productTextStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "3px",
  minWidth: 0,
};

const productNameStyle = {
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const productMetaStyle = {
  color: "#777777",
  fontSize: "12px",
};

const moreItemsStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "78px",
  borderRadius: "8px",
  backgroundColor: "#f7f7f7",
  color: "#555555",
  fontSize: "13px",
  fontWeight: "700",
};

const orderBottomRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  paddingTop: "20px",
  flexWrap: "wrap",
};

const deliveryTextStyle = {
  color: "#666666",
  fontSize: "14px",
};

const viewOrderButtonStyle = {
  padding: "11px 20px",
  border: "none",
  borderRadius: "7px",
  backgroundColor: "#111111",
  color: "#ffffff",
  fontWeight: "700",
  cursor: "pointer",
};

const secondaryButtonStyle = {
  padding: "12px 20px",
  border: "1px solid #222222",
  borderRadius: "7px",
  backgroundColor: "#ffffff",
  color: "#222222",
  fontWeight: "700",
  cursor: "pointer",
};

const centerPageStyle = {
  minHeight: "70vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "50px 20px",
};

const messageCardStyle = {
  width: "100%",
  maxWidth: "520px",
  padding: "45px 35px",
  border: "1px solid #e4e4e4",
  borderRadius: "14px",
  textAlign: "center",
};

const emptyIconStyle = {
  fontSize: "52px",
};

const mutedTextStyle = {
  color: "#666666",
  lineHeight: 1.7,
};

const errorTextStyle = {
  color: "#b00020",
  lineHeight: 1.7,
};

const loadingTextStyle = {
  fontSize: "18px",
  fontWeight: "700",
};

const primaryButtonStyle = {
  marginTop: "20px",
  padding: "14px 25px",
  border: "none",
  borderRadius: "7px",
  backgroundColor: "#111111",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
};

export default MyOrders;
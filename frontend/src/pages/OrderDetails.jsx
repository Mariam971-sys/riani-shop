import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { apiUrl, mediaUrl } from "../config/api";

function OrderDetails() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [order, setOrder] = useState(location.state?.order || null);
  const [loading, setLoading] = useState(!location.state?.order);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrderDetails() {
      if (order) {
        return;
      }

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
        navigate("/login");
        return;
      }

      try {
        setLoading(true);
        setError("");

        const { data } = await axios.get(
          apiUrl(`/orders/${id}`),
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setOrder(data);
      } catch (error) {
        console.error("Fetch order details error:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("userInfo");
          navigate("/login");
          return;
        }

        setError(
          error.response?.data?.message ||
            "Could not load order details."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchOrderDetails();
  }, [id, navigate, order]);

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
      month: "long",
      day: "numeric",
    });
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

  function getOrderStatus(currentOrder) {
    if (currentOrder.isDelivered) {
      return {
        text: "Delivered",
        backgroundColor: "#e7f7eb",
        color: "#167329",
      };
    }

    const status = String(
      currentOrder.status || "Processing"
    ).toLowerCase();

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

    return {
      text: currentOrder.status || "Processing",
      backgroundColor: "#fff4d9",
      color: "#8a5a00",
    };
  }

  if (loading) {
    return (
      <main style={centerPageStyle}>
        <p style={loadingTextStyle}>
          Loading order details...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main style={centerPageStyle}>
        <div style={messageCardStyle}>
          <h1>Could not load order</h1>

          <p style={errorTextStyle}>{error}</p>

          <button
            type="button"
            onClick={() => navigate("/orders")}
            style={primaryButtonStyle}
          >
            Back to My Orders
          </button>
        </div>
      </main>
    );
  }

  if (!order) {
    return (
      <main style={centerPageStyle}>
        <div style={messageCardStyle}>
          <h1>Order not found</h1>

          <p style={mutedTextStyle}>
            This order could not be found.
          </p>

          <button
            type="button"
            onClick={() => navigate("/orders")}
            style={primaryButtonStyle}
          >
            Back to My Orders
          </button>
        </div>
      </main>
    );
  }

  const orderItems = Array.isArray(order.orderItems)
    ? order.orderItems
    : [];

  const shippingAddress = order.shippingAddress || {};
  const orderStatus = getOrderStatus(order);

  const itemsPrice = Number(order.itemsPrice || 0);
  const shippingPrice = Number(order.shippingPrice || 0);
  const taxPrice = Number(order.taxPrice || 0);
  const totalPrice = Number(order.totalPrice || 0);

  return (
    <main style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <p style={smallLabelStyle}>Riani Shop</p>

          <h1 style={titleStyle}>Order Details</h1>

          <p style={subtitleStyle}>
            Order #{String(order._id || order.id).toUpperCase()}
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/orders")}
          style={secondaryButtonStyle}
        >
          Back to My Orders
        </button>
      </div>

      <section style={orderInfoCardStyle}>
        <div>
          <span style={fieldLabelStyle}>Order Date</span>

          <strong>{formatDate(order.createdAt)}</strong>
        </div>

        <div>
          <span style={fieldLabelStyle}>Payment Method</span>

          <strong>
            {order.paymentMethod || "Cash on Delivery"}
          </strong>
        </div>

        <div>
          <span style={fieldLabelStyle}>Payment Status</span>

          <strong
            style={{
              color: order.isPaid ? "#167329" : "#a26700",
            }}
          >
            {order.isPaid ? "Paid" : "Not Paid"}
          </strong>
        </div>

        <div>
          <span style={fieldLabelStyle}>Order Status</span>

          <span
            style={{
              ...statusBadgeStyle,
              backgroundColor: orderStatus.backgroundColor,
              color: orderStatus.color,
            }}
          >
            {orderStatus.text}
          </span>
        </div>
      </section>

      <div style={contentGridStyle}>
        <section style={leftColumnStyle}>
          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>Products</h2>

            {orderItems.length === 0 ? (
              <p style={mutedTextStyle}>
                No products were found in this order.
              </p>
            ) : (
              orderItems.map((item, index) => {
                const quantity = Number(item.quantity || 1);
                const price = Number(item.price || 0);
                const subtotal = quantity * price;

                const selectedSize =
                  item.selectedSize || item.size;

                const selectedColor =
                  item.selectedColor || item.color;

                const itemKey = [
                  item.product || item._id || item.id,
                  selectedSize || "no-size",
                  selectedColor || "no-color",
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

                      <p style={quantityTextStyle}>
                        Quantity: {quantity}
                      </p>
                    </div>

                    <div style={priceBoxStyle}>
                      <span style={unitPriceStyle}>
                        ${price.toFixed(2)} each
                      </span>

                      <strong style={subtotalStyle}>
                        ${subtotal.toFixed(2)}
                      </strong>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>
              Shipping Address
            </h2>

            <div style={shippingGridStyle}>
              <div>
                <span style={fieldLabelStyle}>Full Name</span>

                <strong style={detailValueStyle}>
                  {shippingAddress.fullName || "-"}
                </strong>
              </div>

              <div>
                <span style={fieldLabelStyle}>Email</span>

                <strong style={detailValueStyle}>
                  {shippingAddress.email || "-"}
                </strong>
              </div>

              <div>
                <span style={fieldLabelStyle}>Phone</span>

                <strong style={detailValueStyle}>
                  {shippingAddress.phone || "-"}
                </strong>
              </div>

              <div>
                <span style={fieldLabelStyle}>Address</span>

                <strong style={detailValueStyle}>
                  {shippingAddress.address || "-"}
                </strong>
              </div>

              <div>
                <span style={fieldLabelStyle}>City</span>

                <strong style={detailValueStyle}>
                  {shippingAddress.city || "-"}
                </strong>
              </div>

              <div>
                <span style={fieldLabelStyle}>
                  Postal Code
                </span>

                <strong style={detailValueStyle}>
                  {shippingAddress.postalCode || "-"}
                </strong>
              </div>

              <div>
                <span style={fieldLabelStyle}>Country</span>

                <strong style={detailValueStyle}>
                  {shippingAddress.country || "-"}
                </strong>
              </div>
            </div>
          </div>

          <div style={cardStyle}>
            <h2 style={sectionTitleStyle}>
              Delivery Information
            </h2>

            {order.isDelivered ? (
              <div style={successMessageStyle}>
                <strong>Order delivered</strong>

                <p style={messageTextStyle}>
                  Delivered on {formatDate(order.deliveredAt)}.
                </p>
              </div>
            ) : (
              <div style={processingMessageStyle}>
                <strong>{orderStatus.text}</strong>

                <p style={messageTextStyle}>
                  Your order has not been delivered yet.
                </p>
              </div>
            )}
          </div>
        </section>

        <aside style={summaryCardStyle}>
          <h2 style={sectionTitleStyle}>Order Summary</h2>

          <div style={summaryRowsStyle}>
            <div style={summaryRowStyle}>
              <span>Items</span>
              <span>${itemsPrice.toFixed(2)}</span>
            </div>

            <div style={summaryRowStyle}>
              <span>Shipping</span>

              <span>
                {shippingPrice === 0
                  ? "Free"
                  : `$${shippingPrice.toFixed(2)}`}
              </span>
            </div>

            <div style={summaryRowStyle}>
              <span>Tax</span>
              <span>${taxPrice.toFixed(2)}</span>
            </div>
          </div>

          <div style={totalRowStyle}>
            <span>Total</span>

            <strong>${totalPrice.toFixed(2)}</strong>
          </div>

          <div style={paymentBoxStyle}>
            <span style={fieldLabelStyle}>
              Payment Method
            </span>

            <strong>
              {order.paymentMethod || "Cash on Delivery"}
            </strong>
          </div>

          <button
            type="button"
            onClick={() => navigate("/shop")}
            style={primaryButtonStyle}
          >
            Continue Shopping
          </button>
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

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: "20px",
  marginBottom: "30px",
  flexWrap: "wrap",
};

const smallLabelStyle = {
  margin: "0 0 7px",
  color: "#777",
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
  margin: "8px 0 0",
  color: "#666",
  overflowWrap: "anywhere",
};

const secondaryButtonStyle = {
  padding: "12px 20px",
  border: "1px solid #222",
  borderRadius: "7px",
  backgroundColor: "#fff",
  color: "#222",
  fontWeight: "700",
  cursor: "pointer",
};

const orderInfoCardStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "22px",
  marginBottom: "30px",
  padding: "24px",
  border: "1px solid #e4e4e4",
  borderRadius: "12px",
  backgroundColor: "#fafafa",
};

const fieldLabelStyle = {
  display: "block",
  marginBottom: "6px",
  color: "#888",
  fontSize: "11px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "0.6px",
};

const statusBadgeStyle = {
  display: "inline-flex",
  padding: "7px 12px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "800",
};

const contentGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "minmax(0, 1.7fr) minmax(300px, 0.8fr)",
  gap: "30px",
  alignItems: "start",
};

const leftColumnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "24px",
  minWidth: 0,
};

const cardStyle = {
  padding: "26px",
  border: "1px solid #e4e4e4",
  borderRadius: "12px",
  backgroundColor: "#fff",
};

const sectionTitleStyle = {
  margin: "0 0 22px",
  fontSize: "24px",
};

const orderItemStyle = {
  display: "grid",
  gridTemplateColumns: "95px minmax(0, 1fr) auto",
  gap: "18px",
  alignItems: "center",
  padding: "18px 0",
  borderBottom: "1px solid #eee",
};

const imageWrapperStyle = {
  width: "95px",
  height: "110px",
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
  color: "#888",
  fontSize: "12px",
};

const productInfoStyle = {
  minWidth: 0,
};

const productNameStyle = {
  margin: "0 0 10px",
  fontSize: "18px",
};

const variantContainerStyle = {
  display: "flex",
  gap: "8px",
  flexWrap: "wrap",
};

const variantBadgeStyle = {
  padding: "5px 9px",
  borderRadius: "5px",
  backgroundColor: "#f2f2f2",
  color: "#555",
  fontSize: "12px",
};

const quantityTextStyle = {
  margin: "10px 0 0",
  color: "#666",
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
  color: "#777",
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

const successMessageStyle = {
  padding: "18px",
  borderRadius: "8px",
  backgroundColor: "#e7f7eb",
  color: "#167329",
};

const processingMessageStyle = {
  padding: "18px",
  borderRadius: "8px",
  backgroundColor: "#fff4d9",
  color: "#8a5a00",
};

const messageTextStyle = {
  margin: "7px 0 0",
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
  borderBottom: "1px solid #ddd",
};

const summaryRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  color: "#555",
};

const totalRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  margin: "22px 0",
  fontSize: "21px",
};

const paymentBoxStyle = {
  marginBottom: "22px",
  padding: "15px",
  borderRadius: "8px",
  backgroundColor: "#fff",
};

const primaryButtonStyle = {
  width: "100%",
  marginTop: "20px",
  padding: "14px 20px",
  border: "none",
  borderRadius: "7px",
  backgroundColor: "#111",
  color: "#fff",
  fontSize: "15px",
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

const errorTextStyle = {
  color: "#b00020",
  lineHeight: 1.7,
};

const mutedTextStyle = {
  color: "#666",
  lineHeight: 1.7,
};

const loadingTextStyle = {
  fontSize: "18px",
  fontWeight: "700",
};

export default OrderDetails;
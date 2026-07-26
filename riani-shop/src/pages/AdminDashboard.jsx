import {
  useContext,
  useEffect,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { UserContext } from "../context/UserContext";

function AdminDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useContext(UserContext);

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!user.isAdmin) {
      navigate("/");
      return;
    }

    fetchDashboardStats();
  }, [user, navigate]);

  function getToken() {
    return (
      localStorage.getItem("token") ||
      user?.token ||
      ""
    );
  }

  async function fetchDashboardStats() {
    try {
      setLoading(true);
      setError("");

      const token = getToken();

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.get(
        "http://localhost:5000/api/admin/dashboard",
        config
      );

      setStats({
        totalProducts: Number(
          data.totalProducts || 0
        ),
        totalUsers: Number(data.totalUsers || 0),
        totalOrders: Number(data.totalOrders || 0),
        totalRevenue: Number(
          data.totalRevenue || 0
        ),
      });

      const orders = Array.isArray(data.recentOrders)
        ? data.recentOrders
        : [];

      setRecentOrders(orders);
    } catch (currentError) {
      console.error(
        "Dashboard error:",
        currentError
      );

      if (
        currentError.response?.status === 401 ||
        currentError.response?.status === 403
      ) {
        logout();
        navigate("/login");
        return;
      }

      setError(
        currentError.response?.data?.message ||
          "Dashboard data could not be loaded."
      );
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return "-";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "-";
    }

    return date.toLocaleDateString("en-SE", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  function getOrderStatus(order) {
    if (order.isDelivered) {
      return "Delivered";
    }

    return order.status || "Processing";
  }

  const dashboardCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: "📦",
      action: () =>
        navigate("/admin/products"),
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: "👥",
      action: () =>
        navigate("/admin/users"),
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: "🛒",
      action: () =>
        navigate("/admin/orders"),
    },
    {
      title: "Total Revenue",
      value: `$${stats.totalRevenue.toFixed(2)}`,
      icon: "💰",
      action: () =>
        navigate("/admin/orders"),
    },
  ];

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <div>
            <p style={smallLabelStyle}>
              ADMIN PANEL
            </p>

            <h1 style={titleStyle}>
              Dashboard
            </h1>

            <p style={subtitleStyle}>
              Welcome back, {user.name}.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchDashboardStats}
            disabled={loading}
            style={{
              ...refreshButtonStyle,
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        {error && (
          <div style={errorMessageStyle}>
            {error}
          </div>
        )}

        <section style={cardsGridStyle}>
          {dashboardCards.map((card) => (
            <article
              key={card.title}
              style={cardStyle}
            >
              <div style={iconStyle}>
                {card.icon}
              </div>

              <div style={cardContentStyle}>
                <p style={cardTitleStyle}>
                  {card.title}
                </p>

                <h2 style={cardValueStyle}>
                  {loading ? "..." : card.value}
                </h2>

                <button
                  type="button"
                  onClick={card.action}
                  style={cardLinkStyle}
                >
                  View details
                </button>
              </div>
            </article>
          ))}
        </section>

        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>
            Quick Actions
          </h2>

          <div style={actionsGridStyle}>
            <button
              type="button"
              onClick={() =>
                navigate("/admin/products/add")
              }
              style={primaryButtonStyle}
            >
              Add Product
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/products")
              }
              style={actionButtonStyle}
            >
              View Products
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/orders")
              }
              style={actionButtonStyle}
            >
              View Orders
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/users")
              }
              style={actionButtonStyle}
            >
              View Users
            </button>
          </div>
        </section>

        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <h2 style={sectionTitleStyle}>
              Recent Orders
            </h2>

            <button
              type="button"
              onClick={() =>
                navigate("/admin/orders")
              }
              style={viewAllButtonStyle}
            >
              View All
            </button>
          </div>

          {loading ? (
            <p style={mutedTextStyle}>
              Loading recent orders...
            </p>
          ) : recentOrders.length === 0 ? (
            <p style={mutedTextStyle}>
              No recent orders yet.
            </p>
          ) : (
            <div style={tableWrapperStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={thStyle}>Order</th>
                    <th style={thStyle}>Customer</th>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Total</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {recentOrders.map((order) => {
                    const orderId =
                      order._id || order.id;

                    return (
                      <tr key={orderId}>
                        <td style={tdStyle}>
                          #
                          {String(orderId)
                            .slice(-8)
                            .toUpperCase()}
                        </td>

                        <td style={tdStyle}>
                          {order.user?.name ||
                            order.shippingAddress
                              ?.fullName ||
                            "Customer"}
                        </td>

                        <td style={tdStyle}>
                          {formatDate(
                            order.createdAt
                          )}
                        </td>

                        <td style={tdStyle}>
                          $
                          {Number(
                            order.totalPrice || 0
                          ).toFixed(2)}
                        </td>

                        <td style={tdStyle}>
                          {getOrderStatus(order)}
                        </td>

                        <td style={tdStyle}>
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                `/orders/${orderId}`,
                                {
                                  state: { order },
                                }
                              )
                            }
                            style={smallButtonStyle}
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

const pageStyle = {
  minHeight: "100vh",
  padding: "50px 6% 90px",
  backgroundColor: "#f5f6f8",
};

const containerStyle = {
  maxWidth: "1300px",
  margin: "0 auto",
};

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-end",
  gap: "20px",
  marginBottom: "40px",
  flexWrap: "wrap",
};

const smallLabelStyle = {
  margin: "0 0 8px",
  color: "#888",
  fontSize: "13px",
  fontWeight: "700",
  letterSpacing: "3px",
};

const titleStyle = {
  margin: 0,
  color: "#222",
  fontSize: "clamp(36px, 5vw, 48px)",
};

const subtitleStyle = {
  margin: "10px 0 0",
  color: "#666",
};

const refreshButtonStyle = {
  padding: "12px 20px",
  border: "1px solid #222",
  borderRadius: "7px",
  backgroundColor: "#fff",
  color: "#222",
  fontWeight: "700",
  cursor: "pointer",
};

const cardsGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(230px, 1fr))",
  gap: "25px",
};

const cardStyle = {
  display: "flex",
  alignItems: "center",
  gap: "20px",
  padding: "28px",
  borderRadius: "14px",
  backgroundColor: "#fff",
  boxShadow:
    "0 8px 25px rgba(0, 0, 0, 0.08)",
};

const iconStyle = {
  width: "60px",
  height: "60px",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "12px",
  backgroundColor: "#f1f1f1",
  fontSize: "30px",
};

const cardContentStyle = {
  minWidth: 0,
};

const cardTitleStyle = {
  margin: 0,
  color: "#777",
  fontSize: "14px",
};

const cardValueStyle = {
  margin: "8px 0",
  color: "#222",
  fontSize: "30px",
};

const cardLinkStyle = {
  padding: 0,
  border: "none",
  backgroundColor: "transparent",
  color: "#333",
  fontWeight: "700",
  cursor: "pointer",
  textDecoration: "underline",
};

const sectionStyle = {
  marginTop: "40px",
  padding: "30px",
  borderRadius: "14px",
  backgroundColor: "#fff",
  boxShadow:
    "0 8px 25px rgba(0, 0, 0, 0.08)",
};

const sectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
  marginBottom: "20px",
};

const sectionTitleStyle = {
  margin: 0,
};

const actionsGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(170px, 1fr))",
  gap: "15px",
  marginTop: "20px",
};

const primaryButtonStyle = {
  padding: "14px 22px",
  border: "none",
  borderRadius: "7px",
  backgroundColor: "#111",
  color: "#fff",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
};

const actionButtonStyle = {
  padding: "14px 22px",
  border: "1px solid #222",
  borderRadius: "7px",
  backgroundColor: "#fff",
  color: "#222",
  fontSize: "15px",
  fontWeight: "700",
  cursor: "pointer",
};

const viewAllButtonStyle = {
  padding: "9px 14px",
  border: "1px solid #222",
  borderRadius: "6px",
  backgroundColor: "#fff",
  color: "#222",
  fontWeight: "700",
  cursor: "pointer",
};

const tableWrapperStyle = {
  width: "100%",
  overflowX: "auto",
};

const tableStyle = {
  width: "100%",
  minWidth: "760px",
  borderCollapse: "collapse",
};

const thStyle = {
  padding: "14px",
  textAlign: "left",
  borderBottom: "2px solid #222",
  backgroundColor: "#f6f6f6",
};

const tdStyle = {
  padding: "14px",
  borderBottom: "1px solid #ddd",
};

const smallButtonStyle = {
  padding: "7px 12px",
  border: "none",
  borderRadius: "5px",
  backgroundColor: "#222",
  color: "#fff",
  fontWeight: "700",
  cursor: "pointer",
};

const mutedTextStyle = {
  color: "#777",
};

const errorMessageStyle = {
  marginBottom: "25px",
  padding: "15px",
  borderRadius: "8px",
  backgroundColor: "#ffe8e8",
  color: "#a40000",
};

export default AdminDashboard;
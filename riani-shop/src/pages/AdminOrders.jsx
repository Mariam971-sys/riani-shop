import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../context/UserContext";

const API_URL = "http://localhost:5000/api/orders";

function AdminOrders() {
  const navigate = useNavigate();
  const { user, logout } = useContext(UserContext);

  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState("");
  const [deletingId, setDeletingId] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!user.isAdmin) {
      navigate("/");
      return;
    }

    fetchOrders();
  }, [user, navigate]);

  function getToken() {
    return localStorage.getItem("token") || user?.token || "";
  }

  function getAxiosConfig() {
    const token = getToken();

    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  function handleAuthenticationError(currentError) {
    if (
      currentError.response?.status === 401 ||
      currentError.response?.status === 403
    ) {
      logout();
      navigate("/login");
      return true;
    }

    return false;
  }

  async function fetchOrders() {
    try {
      setLoading(true);
      setError("");

      const { data } = await axios.get(
        API_URL,
        getAxiosConfig()
      );

      const orderList = Array.isArray(data)
        ? data
        : Array.isArray(data.orders)
        ? data.orders
        : [];

      setOrders(orderList);
    } catch (currentError) {
      console.error("Fetch orders error:", currentError);

      if (handleAuthenticationError(currentError)) {
        return;
      }

      setError(
        currentError.response?.data?.message ||
          "Could not load orders."
      );
    } finally {
      setLoading(false);
    }
  }

  async function markDelivered(id) {
    try {
      setUpdatingId(id);
      setError("");
      setSuccess("");

      const { data } = await axios.put(
        `${API_URL}/${id}/deliver`,
        {},
        getAxiosConfig()
      );

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order._id === id
            ? {
                ...order,
                ...data,
                isDelivered: true,
                status: data.status || "Delivered",
                deliveredAt:
                  data.deliveredAt || new Date().toISOString(),
              }
            : order
        )
      );

      setSuccess("Order marked as delivered.");
    } catch (currentError) {
      console.error("Update order error:", currentError);

      if (handleAuthenticationError(currentError)) {
        return;
      }

      setError(
        currentError.response?.data?.message ||
          "Could not update the order."
      );
    } finally {
      setUpdatingId("");
    }
  }

  async function deleteOrder(id) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this order?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(id);
      setError("");
      setSuccess("");

      await axios.delete(
        `${API_URL}/${id}`,
        getAxiosConfig()
      );

      setOrders((currentOrders) =>
        currentOrders.filter((order) => order._id !== id)
      );

      setSuccess("Order deleted successfully.");
    } catch (currentError) {
      console.error("Delete order error:", currentError);

      if (handleAuthenticationError(currentError)) {
        return;
      }

      setError(
        currentError.response?.data?.message ||
          "Could not delete the order."
      );
    } finally {
      setDeletingId("");
    }
  }

  const filteredOrders = useMemo(() => {
    const searchText = search.trim().toLowerCase();

    return orders.filter((order) => {
      const id = String(order._id || "").toLowerCase();

      const customerName = String(
        order.user?.name ||
          order.shippingAddress?.fullName ||
          ""
      ).toLowerCase();

      const customerEmail = String(
        order.user?.email ||
          order.shippingAddress?.email ||
          ""
      ).toLowerCase();

      const status = String(
        order.status ||
          (order.isDelivered ? "delivered" : "processing")
      ).toLowerCase();

      const matchesSearch =
        !searchText ||
        id.includes(searchText) ||
        customerName.includes(searchText) ||
        customerEmail.includes(searchText);

      let matchesFilter = true;

      if (filter === "paid") {
        matchesFilter = Boolean(order.isPaid);
      }

      if (filter === "unpaid") {
        matchesFilter = !order.isPaid;
      }

      if (filter === "delivered") {
        matchesFilter =
          Boolean(order.isDelivered) ||
          status === "delivered";
      }

      if (filter === "pending") {
        matchesFilter =
          !order.isDelivered &&
          status !== "cancelled";
      }

      if (filter === "cancelled") {
        matchesFilter = status === "cancelled";
      }

      return matchesSearch && matchesFilter;
    });
  }, [orders, search, filter]);

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

  function getCustomerName(order) {
    return (
      order.user?.name ||
      order.shippingAddress?.fullName ||
      "Unknown customer"
    );
  }

  function getOrderStatus(order) {
    if (order.isDelivered) {
      return "Delivered";
    }

    return order.status || "Processing";
  }

  if (!user || !user.isAdmin) {
    return null;
  }

  return (
    <main style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <p style={smallLabelStyle}>Riani Shop Admin</p>
          <h1 style={titleStyle}>Orders Management</h1>
          <p style={subtitleStyle}>
            View and manage all customer orders.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          disabled={loading}
          style={refreshButtonStyle}
        >
          {loading ? "Loading..." : "Refresh Orders"}
        </button>
      </div>

      {error && (
        <div style={errorMessageStyle}>{error}</div>
      )}

      {success && (
        <div style={successMessageStyle}>{success}</div>
      )}

      <section style={summaryGridStyle}>
        <div style={summaryCardStyle}>
          <span style={summaryLabelStyle}>Total orders</span>
          <strong style={summaryNumberStyle}>
            {orders.length}
          </strong>
        </div>

        <div style={summaryCardStyle}>
          <span style={summaryLabelStyle}>Paid</span>
          <strong style={summaryNumberStyle}>
            {orders.filter((order) => order.isPaid).length}
          </strong>
        </div>

        <div style={summaryCardStyle}>
          <span style={summaryLabelStyle}>Delivered</span>
          <strong style={summaryNumberStyle}>
            {
              orders.filter((order) => order.isDelivered)
                .length
            }
          </strong>
        </div>

        <div style={summaryCardStyle}>
          <span style={summaryLabelStyle}>Revenue</span>
          <strong style={summaryNumberStyle}>
            $
            {orders
              .reduce(
                (total, order) =>
                  total + Number(order.totalPrice || 0),
                0
              )
              .toFixed(2)}
          </strong>
        </div>
      </section>

      <section style={controlsStyle}>
        <input
          type="search"
          placeholder="Search ID, customer or email..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          style={searchInputStyle}
        />

        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          style={selectStyle}
        >
          <option value="all">All orders</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="pending">Pending</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </section>

      {loading ? (
        <div style={messageStyle}>
          <h2>Loading orders...</h2>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div style={messageStyle}>
          <h2>No orders found</h2>
          <p style={mutedTextStyle}>
            No orders match your current search or filter.
          </p>
        </div>
      ) : (
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Order</th>
                <th style={thStyle}>Customer</th>
                <th style={thStyle}>Date</th>
                <th style={thStyle}>Total</th>
                <th style={thStyle}>Payment</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order) => {
                const orderId = order._id || order.id;
                const status = getOrderStatus(order);

                return (
                  <tr key={orderId}>
                    <td style={tdStyle}>
                      <strong>
                        #
                        {String(orderId)
                          .slice(-8)
                          .toUpperCase()}
                      </strong>
                    </td>

                    <td style={tdStyle}>
                      <div style={customerStyle}>
                        <strong>
                          {getCustomerName(order)}
                        </strong>

                        <span style={smallTextStyle}>
                          {order.user?.email ||
                            order.shippingAddress?.email ||
                            ""}
                        </span>
                      </div>
                    </td>

                    <td style={tdStyle}>
                      {formatDate(order.createdAt)}
                    </td>

                    <td style={tdStyle}>
                      <strong>
                        $
                        {Number(
                          order.totalPrice || 0
                        ).toFixed(2)}
                      </strong>
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          ...badgeStyle,
                          ...(order.isPaid
                            ? paidBadgeStyle
                            : unpaidBadgeStyle),
                        }}
                      >
                        {order.isPaid ? "Paid" : "Unpaid"}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          ...badgeStyle,
                          ...(order.isDelivered
                            ? deliveredBadgeStyle
                            : pendingBadgeStyle),
                        }}
                      >
                        {status}
                      </span>
                    </td>

                    <td style={tdStyle}>
                      <div style={actionsStyle}>
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/orders/${orderId}`, {
                              state: { order },
                            })
                          }
                          style={viewButtonStyle}
                        >
                          View
                        </button>

                        {!order.isDelivered && (
                          <button
                            type="button"
                            onClick={() =>
                              markDelivered(orderId)
                            }
                            disabled={updatingId === orderId}
                            style={{
                              ...deliverButtonStyle,
                              opacity:
                                updatingId === orderId
                                  ? 0.6
                                  : 1,
                            }}
                          >
                            {updatingId === orderId
                              ? "Updating..."
                              : "Deliver"}
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() =>
                            deleteOrder(orderId)
                          }
                          disabled={deletingId === orderId}
                          style={{
                            ...deleteButtonStyle,
                            opacity:
                              deletingId === orderId
                                ? 0.6
                                : 1,
                          }}
                        >
                          {deletingId === orderId
                            ? "Deleting..."
                            : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

const pageStyle = {
  maxWidth: "1250px",
  minHeight: "70vh",
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
  margin: "0 0 6px",
  color: "#777",
  fontSize: "12px",
  fontWeight: "700",
  textTransform: "uppercase",
  letterSpacing: "1px",
};

const titleStyle = {
  margin: 0,
  fontSize: "clamp(32px, 5vw, 46px)",
};

const subtitleStyle = {
  margin: "8px 0 0",
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

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "18px",
  marginBottom: "25px",
};

const summaryCardStyle = {
  padding: "22px",
  border: "1px solid #e2e2e2",
  borderRadius: "10px",
  backgroundColor: "#fafafa",
};

const summaryLabelStyle = {
  display: "block",
  marginBottom: "10px",
  color: "#777",
  fontSize: "12px",
  fontWeight: "700",
  textTransform: "uppercase",
};

const summaryNumberStyle = {
  fontSize: "27px",
};

const controlsStyle = {
  display: "flex",
  gap: "15px",
  marginBottom: "25px",
  flexWrap: "wrap",
};

const searchInputStyle = {
  flex: "1 1 300px",
  padding: "13px 15px",
  border: "1px solid #ccc",
  borderRadius: "7px",
  fontSize: "15px",
};

const selectStyle = {
  minWidth: "180px",
  padding: "13px 15px",
  border: "1px solid #ccc",
  borderRadius: "7px",
  backgroundColor: "#fff",
  fontSize: "15px",
};

const tableWrapperStyle = {
  width: "100%",
  overflowX: "auto",
  border: "1px solid #e2e2e2",
  borderRadius: "10px",
};

const tableStyle = {
  width: "100%",
  minWidth: "1050px",
  borderCollapse: "collapse",
  backgroundColor: "#fff",
};

const thStyle = {
  padding: "15px",
  textAlign: "left",
  backgroundColor: "#f5f5f5",
  borderBottom: "2px solid #222",
  fontSize: "12px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const tdStyle = {
  padding: "15px",
  borderBottom: "1px solid #e5e5e5",
  verticalAlign: "middle",
};

const customerStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "4px",
};

const smallTextStyle = {
  color: "#777",
  fontSize: "12px",
};

const badgeStyle = {
  display: "inline-flex",
  padding: "6px 10px",
  borderRadius: "999px",
  fontSize: "12px",
  fontWeight: "700",
};

const paidBadgeStyle = {
  backgroundColor: "#e7f7eb",
  color: "#167329",
};

const unpaidBadgeStyle = {
  backgroundColor: "#fff4d9",
  color: "#8a5a00",
};

const deliveredBadgeStyle = {
  backgroundColor: "#e7f7eb",
  color: "#167329",
};

const pendingBadgeStyle = {
  backgroundColor: "#e6f0ff",
  color: "#1d5fa7",
};

const actionsStyle = {
  display: "flex",
  gap: "7px",
  flexWrap: "wrap",
};

const viewButtonStyle = {
  padding: "8px 11px",
  border: "1px solid #222",
  borderRadius: "5px",
  backgroundColor: "#fff",
  color: "#222",
  fontWeight: "700",
  cursor: "pointer",
};

const deliverButtonStyle = {
  padding: "8px 11px",
  border: "none",
  borderRadius: "5px",
  backgroundColor: "#222",
  color: "#fff",
  fontWeight: "700",
  cursor: "pointer",
};

const deleteButtonStyle = {
  padding: "8px 11px",
  border: "1px solid #c40020",
  borderRadius: "5px",
  backgroundColor: "#fff",
  color: "#c40020",
  fontWeight: "700",
  cursor: "pointer",
};

const errorMessageStyle = {
  marginBottom: "20px",
  padding: "14px 16px",
  borderRadius: "7px",
  backgroundColor: "#ffe7e7",
  color: "#b00020",
};

const successMessageStyle = {
  marginBottom: "20px",
  padding: "14px 16px",
  borderRadius: "7px",
  backgroundColor: "#e7f7eb",
  color: "#167329",
};

const messageStyle = {
  padding: "70px 20px",
  border: "1px solid #e2e2e2",
  borderRadius: "10px",
  textAlign: "center",
};

const mutedTextStyle = {
  color: "#666",
};

export default AdminOrders;
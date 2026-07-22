import { useEffect, useState } from "react";
import axios from "axios";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      const { data } = await axios.get(
        "http://localhost:5000/api/orders"
      );

      setOrders(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function markDelivered(id) {
    try {
      await axios.put(
        `http://localhost:5000/api/orders/${id}/deliver`
      );

      fetchOrders();
    } catch (error) {
      console.error(error);
      alert("Could not update order.");
    }
  }

  return (
    <main
      style={{
        maxWidth: "1200px",
        margin: "50px auto",
        padding: "0 20px",
        minHeight: "60vh",
      }}
    >
      <h1>Orders Management</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "30px",
          }}
        >
          <thead>
            <tr>
              <th style={thStyle}>ID</th>
              <th style={thStyle}>Customer</th>
              <th style={thStyle}>Total</th>
              <th style={thStyle}>Paid</th>
              <th style={thStyle}>Delivered</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td style={tdStyle}>
                  {order._id.slice(-6)}
                </td>

                <td style={tdStyle}>
                  {order.shippingAddress?.fullName}
                </td>

                <td style={tdStyle}>
                  ${Number(order.totalPrice).toFixed(2)}
                </td>

                <td style={tdStyle}>
                  {order.isPaid ? "✅ Paid" : "❌ Unpaid"}
                </td>

                <td style={tdStyle}>
                  {order.isDelivered
                    ? "✅ Delivered"
                    : "🚚 Pending"}
                </td>

                <td style={tdStyle}>
                  {!order.isDelivered ? (
                    <button
                      onClick={() =>
                        markDelivered(order._id)
                      }
                      style={buttonStyle}
                    >
                      Mark Delivered
                    </button>
                  ) : (
                    <span style={{ color: "green" }}>
                      Completed
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}

const thStyle = {
  padding: "15px",
  textAlign: "left",
  background: "#f5f5f5",
  borderBottom: "2px solid #222",
};

const tdStyle = {
  padding: "15px",
  borderBottom: "1px solid #ddd",
};

const buttonStyle = {
  padding: "8px 14px",
  background: "#222",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};

export default AdminOrders;
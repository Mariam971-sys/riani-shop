import { useEffect, useState } from "react";
import axios from "axios";

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalUsers: 0,
    totalOrders: 0,
    totalRevenue: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        setError("");

        const { data } = await axios.get(
          "http://localhost:5000/api/admin/dashboard"
        );

        setStats({
          totalProducts: data.totalProducts || 0,
          totalUsers: data.totalUsers || 0,
          totalOrders: data.totalOrders || 0,
          totalRevenue: data.totalRevenue || 0,
        });
      } catch (error) {
        console.error("Dashboard error:", error);

        setError(
          error.response?.data?.message ||
            "Dashboard data could not be loaded."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const dashboardCards = [
    {
      title: "Total Products",
      value: stats.totalProducts,
      icon: "📦",
    },
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: "👥",
    },
    {
      title: "Total Orders",
      value: stats.totalOrders,
      icon: "🛒",
    },
    {
      title: "Total Revenue",
      value: `$${Number(stats.totalRevenue).toFixed(2)}`,
      icon: "💰",
    },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#f5f6f8",
        padding: "50px 6%",
      }}
    >
      <div
        style={{
          maxWidth: "1300px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            marginBottom: "40px",
          }}
        >
          <p
            style={{
              color: "#888",
              letterSpacing: "3px",
              fontSize: "13px",
              marginBottom: "8px",
            }}
          >
            ADMIN PANEL
          </p>

          <h1
            style={{
              fontSize: "42px",
              margin: 0,
              color: "#222",
            }}
          >
            Dashboard
          </h1>

          <p
            style={{
              color: "#666",
              marginTop: "10px",
            }}
          >
            Welcome to the Riani Shop admin dashboard.
          </p>
        </div>

        {loading && (
          <p
            style={{
              marginBottom: "25px",
              color: "#666",
            }}
          >
            Loading dashboard data...
          </p>
        )}

        {error && (
          <div
            style={{
              marginBottom: "25px",
              padding: "15px",
              borderRadius: "8px",
              backgroundColor: "#ffe8e8",
              color: "#a40000",
            }}
          >
            {error}
          </div>
        )}

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(230px, 1fr))",
            gap: "25px",
          }}
        >
          {dashboardCards.map((card) => (
            <article
              key={card.title}
              style={{
                backgroundColor: "#fff",
                padding: "28px",
                borderRadius: "14px",
                boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
                display: "flex",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <div
                style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "12px",
                  backgroundColor: "#f1f1f1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "30px",
                }}
              >
                {card.icon}
              </div>

              <div>
                <p
                  style={{
                    margin: 0,
                    color: "#777",
                    fontSize: "14px",
                  }}
                >
                  {card.title}
                </p>

                <h2
                  style={{
                    margin: "8px 0 0",
                    fontSize: "30px",
                    color: "#222",
                  }}
                >
                  {loading ? "..." : card.value}
                </h2>
              </div>
            </article>
          ))}
        </section>

        <section
          style={{
            marginTop: "40px",
            backgroundColor: "#fff",
            padding: "30px",
            borderRadius: "14px",
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: "20px",
            }}
          >
            Quick Actions
          </h2>

          <div
            style={{
              display: "flex",
              gap: "15px",
              flexWrap: "wrap",
            }}
          >
            <button type="button" style={actionButtonStyle}>
              Add Product
            </button>

            <button type="button" style={actionButtonStyle}>
              View Products
            </button>

            <button type="button" style={actionButtonStyle}>
              View Orders
            </button>

            <button type="button" style={actionButtonStyle}>
              View Users
            </button>
          </div>
        </section>

        <section
          style={{
            marginTop: "40px",
            backgroundColor: "#fff",
            padding: "30px",
            borderRadius: "14px",
            boxShadow: "0 8px 25px rgba(0, 0, 0, 0.08)",
          }}
        >
          <h2
            style={{
              marginTop: 0,
            }}
          >
            Recent Orders
          </h2>

          <p
            style={{
              color: "#777",
              marginBottom: 0,
            }}
          >
            No recent orders yet.
          </p>
        </section>
      </div>
    </main>
  );
}

const actionButtonStyle = {
  padding: "13px 22px",
  border: "none",
  borderRadius: "7px",
  backgroundColor: "#222",
  color: "#fff",
  fontSize: "15px",
  fontWeight: "bold",
  cursor: "pointer",
};

export default AdminDashboard;
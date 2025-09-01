import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

function StatCard({ title, value, icon }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-info">
        <div className="stat-title">{title}</div>
        <div className="stat-value">{value}</div>
      </div>
    </div>
  );
}
// ...existing imports...
function AdminDashboard({ onLogout }) {
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8080/admin/stats")
      .then((res) => res.json())
      .then((data) => setStats(data));
  }, []);

  const handleLogoutClick = () => {
    if (onLogout) onLogout();
    navigate("/");
  };

  if (!stats)
    return (
      <div className="App">
        <div className="App-header">Loading...</div>
      </div>
    );

  return (
    <div className="App admin-bg">
      <div className="App-header admin-panel">
        <div className="admin-header-row">
          <h1>Admin Dashboard</h1>
          <button className="admin-logout-btn" onClick={handleLogoutClick}>
            خروج
          </button>
        </div>
        <div className="stats-row">
          <StatCard title="Total Users" value={stats.total_users} icon="👥" />
          <StatCard
            title="New Users (30d)"
            value={stats.new_users_30days}
            icon="🆕"
          />
          <StatCard
            title="Today's Purchases"
            value={stats.purchases_today}
            icon="🛒"
          />
          <StatCard
            title="Monthly Purchase Sum"
            value={stats.purchases_month_sum}
            icon="💰"
          />
          <StatCard
            title="Active Users (7d)"
            value={stats.active_users_7days}
            icon="🔥"
          />
        </div>

        <h2 style={{ marginTop: "40px" }}>Users Above Avg Purchases</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>User ID</th>
              <th>Total Purchases</th>
            </tr>
          </thead>
          <tbody>
            {stats.above_avg_purchases.map((item, idx) => (
              <tr key={idx}>
                <td>{item.user_id}</td>
                <td>{item.total_purchases}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 style={{ marginTop: "40px" }}>Most Purchased Product</h2>
        <div>
          {stats.most_purchased_product.name} (
          {stats.most_purchased_product.count} purchases)
        </div>

        <h2 style={{ marginTop: "40px" }}>Top Products by Revenue</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Total Revenue</th>
            </tr>
          </thead>
          <tbody>
            {stats.top_products_revenue.map((item, idx) => (
              <tr key={idx}>
                <td>{item.name}</td>
                <td>{item.revenue}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 style={{ marginTop: "40px" }}>Top Users by Total Spent</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>User Name</th>
              <th>Total Spent</th>
            </tr>
          </thead>
          <tbody>
            {stats.top_users_spent.map((item, idx) => (
              <tr key={idx}>
                <td>{item.name}</td>
                <td>{item.spent}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <h2 style={{ marginTop: "40px" }}>Top 5 Name Lengths</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name Length</th>
              <th>User Count</th>
            </tr>
          </thead>
          <tbody>
            {stats.top_name_lengths.map((item, idx) => (
              <tr key={idx}>
                <td>{item.length}</td>
                <td>{item.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;

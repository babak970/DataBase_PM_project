import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
    <div className="App">
      <div className="App-header">
        <h1>Admin Dashboard</h1>
        <button onClick={handleLogoutClick}>خروج</button>
        <ul>
          <li>تعداد کل کاربران: {stats.total_users}</li>
          <li>کاربران جدید (۳۰ روز اخیر): {stats.new_users_30days}</li>
          <li>تعداد خریدهای امروز: {stats.purchases_today}</li>
          <li>جمع خریدهای این ماه: {stats.purchases_month_sum}</li>
        </ul>
        <h2>۵ طول نام پرکاربرد</h2>
        <table style={{ margin: "0 auto" }}>
          <thead>
            <tr>
              <th>طول نام</th>
              <th>تعداد کاربران</th>
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

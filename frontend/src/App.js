import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import Shop from "./Shop";
import AdminDashboard from "./AdminDashboard";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";

function MainApp() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [users, setUsers] = useState([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get("http://localhost:8080/users");
        setUsers(response.data);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    fetchUsers();
  }, []);

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const response = await axios.post("http://localhost:8080/register", {
        name,
        phone_number: phoneNumber,
        password,
      });
      setMessage(response.data.message);

      const msg = response.data.message?.toLowerCase() || "";
      if (
        (msg.includes("موفق") || msg.includes("success")) &&
        response.data.id
      ) {
        setUserId(response.data.id);
        setIsAuthenticated(true);
      } else if (msg.includes("موفق") || msg.includes("success")) {
        const found = users.find((u) => u.phone_number === phoneNumber);
        if (found) setUserId(found.id);
        setIsAuthenticated(true);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Registration failed.");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const response = await axios.post("http://localhost:8080/login", {
        phone_number: phoneNumber,
        password,
      });
      setMessage(response.data.message);

      // Admin redirect logic
      if (response.data.role === "admin") {
        setIsAdmin(true);
        navigate("/admin-dashboard");
        return;
      }

      const msg = response.data.message?.toLowerCase() || "";
      if (
        (msg.includes("موفق") || msg.includes("success")) &&
        response.data.id
      ) {
        setUserId(response.data.id);
        setIsAuthenticated(true);
      } else if (msg.includes("موفق") || msg.includes("success")) {
        const found = users.find((u) => u.phone_number === phoneNumber);
        if (found) setUserId(found.id);
        setIsAuthenticated(true);
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Login failed.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    setMessage("");
    setPassword("");
    setPhoneNumber("");
    setName("");
    setUserId(null);
    navigate("/");
  };

  if (isAdmin) {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (isAuthenticated) {
    return <Shop onLogout={handleLogout} userId={userId} />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>{isLogin ? "ورود" : "ثبت‌نام"}</h1>
        <form onSubmit={isLogin ? handleLogin : handleRegister}>
          {!isLogin && (
            <input
              type="text"
              placeholder="نام"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <input
            type="text"
            placeholder="شماره تلفن"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="رمز عبور"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit">{isLogin ? "ورود" : "ثبت‌نام"}</button>
        </form>
        <p className="message">{message}</p>
        <p onClick={() => setIsLogin(!isLogin)} className="toggle-form">
          {isLogin ? "حساب ندارید؟ ثبت‌نام کنید" : "حساب دارید؟ وارد شوید"}
        </p>

        <div className="user-list-container">
          <h2>کاربران ثبت‌نام شده</h2>
          {users.length > 0 ? (
            <ul>
              {users.map((user) => (
                <li key={user.id}>
                  {user.name} ({user.phone_number})
                </li>
              ))}
            </ul>
          ) : (
            <p>هیچ کاربری ثبت‌نام نکرده است.</p>
          )}
        </div>
      </header>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;

import React, { useState } from "react";
import axios from "axios";

const mockProducts = [
  { id: 1, name: "ماشین", price: 100 },
  { id: 2, name: "خونه", price: 200 },
  { id: 3, name: "کفش", price: 300 },
];

export default function Shop({ onLogout, userId }) {
  const [cart, setCart] = useState([]);
  const [message, setMessage] = useState("");

  const handleBuy = async (product) => {
    setCart([...cart, product]);
    setMessage(`You bought ${product.name} for $${product.price}`);

    if (userId) {
      try {
        await axios.post("http://localhost:8080/buy", {
          user_id: userId,
          product_id: product.id,
          product_name: product.name,
          product_price: product.price,
        });
      } catch (err) {
        setMessage("خرید ثبت نشد! (Purchase not recorded)");
      }
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
        padding: 32,
        fontFamily: "Segoe UI, Arial, sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2 style={{ color: "#333", fontWeight: 700, fontSize: 32 }}>
          🛒 Online Shop
        </h2>
        <button
          onClick={onLogout}
          style={{
            background: "#ff4b2b",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            padding: "10px 24px",
            fontWeight: 600,
            fontSize: 16,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
        >
          Logout
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 24,
          marginTop: 40,
        }}
      >
        {mockProducts.map((product) => (
          <div
            key={product.id}
            style={{
              background: "#fff",
              borderRadius: 12,
              boxShadow: "0 4px 16px rgba(0,0,0,0.07)",
              padding: 24,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <div style={{ fontSize: 24, fontWeight: 600, color: "#222" }}>
              {product.name}
            </div>
            <div style={{ fontSize: 18, color: "#666", margin: "12px 0" }}>
              ${product.price}
            </div>
            <button
              onClick={() => handleBuy(product)}
              style={{
                background: "#43e97b",
                backgroundImage:
                  "linear-gradient(135deg, #38f9d7 0%, #43e97b 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "8px 20px",
                fontWeight: 600,
                fontSize: 15,
                cursor: "pointer",
                marginTop: 10,
                boxShadow: "0 2px 8px rgba(67,233,123,0.12)",
              }}
            >
              خرید
            </button>
          </div>
        ))}
      </div>

      {message && (
        <div
          style={{
            marginTop: 32,
            color: "#43e97b",
            fontWeight: 600,
            fontSize: 18,
            textAlign: "center",
          }}
        >
          {message}
        </div>
      )}

      <div
        style={{
          marginTop: 48,
          background: "#fff",
          borderRadius: 12,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          padding: 24,
          maxWidth: 400,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <h3
          style={{
            color: "#333",
            fontWeight: 700,
            fontSize: 22,
            marginBottom: 16,
          }}
        >
          سبد خرید شما
        </h3>
        {cart.length === 0 ? (
          <p style={{ color: "#888", fontSize: 16 }}>خالی میباشد</p>
        ) : (
          <ul style={{ paddingLeft: 20 }}>
            {cart.map((item, idx) => (
              <li key={idx} style={{ fontSize: 16, marginBottom: 8 }}>
                {item.name} - ${item.price}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";

let idCounter = 0;

export default function Toast() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const handler = (e) => {
      const id = ++idCounter;
      const { message, type } = e.detail;
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };
    window.addEventListener("app-toast", handler);
    return () => window.removeEventListener("app-toast", handler);
  }, []);

  const colors = {
    success: "#10b981",
    error: "#ef4444",
    info: "#2563eb",
    warning: "#f59e0b",
  };

  return (
    <div style={{ position: "fixed", top: 16, right: 16, zIndex: 1000, display: "flex", flexDirection: "column", gap: 8 }}>
      {toasts.map((t) => (
        <div
          key={t.id}
          style={{
            background: colors[t.type] || colors.info,
            color: "#fff",
            padding: "10px 16px",
            borderRadius: 8,
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            fontSize: 14,
            minWidth: 220,
            maxWidth: 340,
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}

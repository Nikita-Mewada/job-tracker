import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={{ background: "#1f2937", padding: "12px 24px", display: "flex", justifyContent: "space-between" }}>
      <Link to="/" style={{ color: "#fff", fontWeight: 600, textDecoration: "none" }}>
        Job Tracker
      </Link>
      <div>
        {token ? (
          <button className="btn" onClick={logout}>Logout</button>
        ) : (
          <>
            <Link to="/login" style={{ color: "#fff", marginRight: 16 }}>Login</Link>
            <Link to="/signup" style={{ color: "#fff" }}>Signup</Link>
          </>
        )}
      </div>
    </div>
  );
}

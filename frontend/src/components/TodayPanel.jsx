import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";

export default function TodayPanel() {
  const [analytics, setAnalytics] = useState(null);
  const [upcoming, setUpcoming] = useState([]);
  const [staleCount, setStaleCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/stats/analytics").then((res) => setAnalytics(res.data));
    api.get("/reminders/upcoming").then((res) => setUpcoming(res.data));
    api.get("/reminders/needs-followup").then((res) => setStaleCount(res.data.length));
  }, []);

  const overdueItems = upcoming.filter((u) => u.overdue);
  const upcomingItems = upcoming.filter((u) => !u.overdue);

  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Today</h2>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        {analytics && (
          <>
            <StatBox label="Total applications" value={analytics.total_applications} />
            <StatBox label="Interview rate" value={`${analytics.interview_rate}%`} />
            <StatBox label="Offer rate" value={`${analytics.offer_rate}%`} />
          </>
        )}
      </div>

      {overdueItems.length === 0 && upcomingItems.length === 0 && staleCount === 0 && (
        <p style={{ color: "#6b7280", fontSize: 14 }}>Nothing urgent right now — nice.</p>
      )}

      {overdueItems.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <strong style={{ color: "#ef4444", fontSize: 14 }}>Overdue</strong>
          {overdueItems.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/applications/${item.id}/edit`)}
              style={{ cursor: "pointer", padding: "6px 0", fontSize: 14, borderBottom: "1px solid #f3f4f6" }}
            >
              {item.company_name} — {item.role_title}{" "}
              <span style={{ color: "#ef4444" }}>
                ({new Date(item.next_step_date).toLocaleDateString()})
              </span>
            </div>
          ))}
        </div>
      )}

      {upcomingItems.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <strong style={{ color: "#f59e0b", fontSize: 14 }}>Coming up (next 3 days)</strong>
          {upcomingItems.map((item) => (
            <div
              key={item.id}
              onClick={() => navigate(`/applications/${item.id}/edit`)}
              style={{ cursor: "pointer", padding: "6px 0", fontSize: 14, borderBottom: "1px solid #f3f4f6" }}
            >
              {item.company_name} — {item.role_title}{" "}
              <span style={{ color: "#f59e0b" }}>
                ({new Date(item.next_step_date).toLocaleDateString()})
              </span>
            </div>
          ))}
        </div>
      )}

      {staleCount > 0 && (
        <div style={{ background: "#fef3c7", padding: 10, borderRadius: 6, fontSize: 14 }}>
          {staleCount} application(s) applied 7+ days ago with no update — consider following up.
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div style={{ background: "#f9fafb", padding: "10px 16px", borderRadius: 8, minWidth: 120 }}>
      <div style={{ fontSize: 22, fontWeight: 600 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#6b7280" }}>{label}</div>
    </div>
  );
}

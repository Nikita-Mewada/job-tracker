import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios.js";

const COLUMNS = [
  { key: "applied", label: "Applied" },
  { key: "oa", label: "OA / Assessment" },
  { key: "interview", label: "Interview" },
  { key: "offer", label: "Offer" },
  { key: "rejected", label: "Rejected" },
];

export default function KanbanBoard({ applications, onStatusChange }) {
  const [dragOverCol, setDragOverCol] = useState(null);
  const navigate = useNavigate();

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    setDragOverCol(null);
    const appId = e.dataTransfer.getData("appId");
    const app = applications.find((a) => String(a.id) === appId);
    if (!app || app.status === newStatus) return;

    await api.put(`/applications/${appId}`, { status: newStatus });
    onStatusChange();
  };

  return (
    <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 8 }}>
      {COLUMNS.map((col) => {
        const colApps = applications.filter((a) => a.status === col.key);
        return (
          <div
            key={col.key}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOverCol(col.key);
            }}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={(e) => handleDrop(e, col.key)}
            style={{
              minWidth: 220,
              flex: "1 0 220px",
              background: dragOverCol === col.key ? "#eff6ff" : "#f3f4f6",
              borderRadius: 8,
              padding: 10,
              transition: "background 0.15s",
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
              <span>{col.label}</span>
              <span style={{ color: "#6b7280" }}>{colApps.length}</span>
            </div>

            {colApps.map((app) => (
              <div
                key={app.id}
                draggable
                onDragStart={(e) => e.dataTransfer.setData("appId", String(app.id))}
                onClick={() => navigate(`/applications/${app.id}/edit`)}
                className="card"
                style={{ padding: 10, marginBottom: 8, cursor: "grab" }}
              >
                <div style={{ fontWeight: 500, fontSize: 14 }}>{app.company_name}</div>
                <div style={{ fontSize: 13, color: "#6b7280" }}>{app.role_title}</div>
                {app.location && <div style={{ fontSize: 12, color: "#9ca3af" }}>{app.location}</div>}
              </div>
            ))}

            {colApps.length === 0 && (
              <div style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", padding: "12px 0" }}>
                Drop here
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

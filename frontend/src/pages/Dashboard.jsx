import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import ApplicationRow from "../components/ApplicationCard.jsx";
import TodayPanel from "../components/TodayPanel.jsx";
import KanbanBoard from "../components/KanbanBoard.jsx";
import { showToast } from "../utils/toast.js";

export default function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState("table"); // "table" | "kanban"
  const [refreshKey, setRefreshKey] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status_filter: statusFilter } : {};
      const res = await api.get("/applications/", { params });
      setApplications(res.data);
    } catch (e) {
      // error toast already shown by axios interceptor for 5xx/network errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, [statusFilter, refreshKey]);

  const filteredApplications = useMemo(() => {
    if (!searchTerm.trim()) return applications;
    const term = searchTerm.toLowerCase();
    return applications.filter(
      (a) =>
        a.company_name.toLowerCase().includes(term) ||
        a.role_title.toLowerCase().includes(term)
    );
  }, [applications, searchTerm]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this application?")) return;
    try {
      await api.delete(`/applications/${id}`);
      showToast("Application deleted", "success");
      setRefreshKey((k) => k + 1);
    } catch (e) {
      // handled by interceptor for server errors; 404 etc. fall through silently
    }
  };

  const handleKanbanStatusChange = () => {
    setRefreshKey((k) => k + 1);
  };

  const hasAnyApplications = applications.length > 0;
  const hasFilteredResults = filteredApplications.length > 0;

  return (
    <div>
      <div className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Job Application Tracker</h2>
        <Link className="btn" to="/applications/new">+ Add Application</Link>
      </div>

      <TodayPanel key={refreshKey} />

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              placeholder="Search company or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 220, marginBottom: 0 }}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              disabled={view === "kanban"}
              style={{ width: "auto", marginBottom: 0 }}
            >
              <option value="">All statuses</option>
              <option value="applied">Applied</option>
              <option value="oa">OA</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <button
              className="btn"
              style={{ background: view === "table" ? "#2563eb" : "#9ca3af", marginRight: 8 }}
              onClick={() => setView("table")}
            >
              Table
            </button>
            <button
              className="btn"
              style={{ background: view === "kanban" ? "#2563eb" : "#9ca3af" }}
              onClick={() => setView("kanban")}
            >
              Kanban
            </button>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : !hasAnyApplications ? (
          <EmptyState />
        ) : view === "table" ? (
          !hasFilteredResults ? (
            <p style={{ textAlign: "center", color: "#6b7280", padding: "24px 0" }}>
              No applications match "{searchTerm}".
            </p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Role</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Date applied</th>
                  <th>Next step</th>
                  <th>CTC</th>
                  <th>Skills asked</th>
                  <th>Resume</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplications.map((app) => (
                  <ApplicationRow key={app.id} app={app} onDelete={handleDelete} />
                ))}
              </tbody>
            </table>
          )
        ) : (
          <KanbanBoard applications={filteredApplications} onStatusChange={handleKanbanStatusChange} />
        )}
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div style={{ textAlign: "center", padding: "40px 0", color: "#6b7280" }}>
      <div
        style={{
          border: "3px solid #e5e7eb",
          borderTop: "3px solid #2563eb",
          borderRadius: "50%",
          width: 28,
          height: 28,
          margin: "0 auto 12px",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      Loading your applications...
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      <p style={{ fontSize: 16, color: "#374151", marginBottom: 4 }}>No applications yet</p>
      <p style={{ fontSize: 14, color: "#9ca3af", marginBottom: 16 }}>
        Start tracking your job search by adding your first application.
      </p>
      <Link className="btn" to="/applications/new">+ Add your first application</Link>
    </div>
  );
}

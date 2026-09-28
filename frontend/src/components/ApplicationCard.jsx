import React from "react";
import { useNavigate } from "react-router-dom";
import { formatDaysUntil, daysUntil } from "../utils/dateHelpers.js";
import api from "../api/axios.js";

export default function ApplicationRow({ app, onDelete }) {
  const navigate = useNavigate();

  const remaining = daysUntil(app.next_step_date);
  const remainingColor = remaining === null ? "#6b7280" : remaining < 0 ? "#ef4444" : remaining <= 2 ? "#f59e0b" : "#10b981";

  const skillTags = app.skills_asked
    ? app.skills_asked.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <tr>
      <td>{app.company_name}</td>
      <td>{app.role_title}</td>
      <td>{app.location || "-"}</td>
      <td>
        <span className={`badge ${app.status}`}>{app.status}</span>
      </td>
      <td>{new Date(app.date_applied).toLocaleDateString()}</td>
      <td style={{ color: remainingColor, fontWeight: 500 }}>
        {formatDaysUntil(app.next_step_date)}
      </td>
      <td>
        {app.ctc_offered ? `Offered: ${app.ctc_offered}` : ""}
        {app.ctc_offered && app.ctc_expected ? " / " : ""}
        {app.ctc_expected ? `Exp: ${app.ctc_expected}` : ""}
        {!app.ctc_offered && !app.ctc_expected ? "-" : ""}
      </td>
      <td>
        {skillTags.length > 0
          ? skillTags.slice(0, 3).map((s) => (
              <span key={s} className="badge" style={{ background: "#6366f1", marginRight: 4 }}>
                {s}
              </span>
            ))
          : "-"}
      </td>
      <td>
        {app.resume_filename ? (
          <a href={`${api.defaults.baseURL}/uploads/resumes/${app.resume_version}`} target="_blank" rel="noreferrer">
            {app.resume_filename}
          </a>
        ) : (
          "-"
        )}
      </td>
      <td>
        <button className="btn" style={{ marginRight: 8 }} onClick={() => navigate(`/applications/${app.id}/edit`)}>
          Edit
        </button>
        <button className="btn" style={{ background: "#ef4444" }} onClick={() => onDelete(app.id)}>
          Delete
        </button>
      </td>
    </tr>
  );
}

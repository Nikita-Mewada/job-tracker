import React, { useEffect, useState } from "react";
import api from "../api/axios.js";

export default function InterviewRounds({ appId }) {
  const [rounds, setRounds] = useState([]);
  const [newRound, setNewRound] = useState({ round_name: "", round_date: "", status: "scheduled", notes: "" });

  const loadRounds = async () => {
    const res = await api.get(`/applications/${appId}/rounds`);
    setRounds(res.data);
  };

  useEffect(() => {
    if (appId) loadRounds();
  }, [appId]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newRound.round_name) return;
    await api.post(`/applications/${appId}/rounds`, {
      ...newRound,
      round_date: newRound.round_date || null,
    });
    setNewRound({ round_name: "", round_date: "", status: "scheduled", notes: "" });
    loadRounds();
  };

  const handleStatusChange = async (roundId, status) => {
    await api.put(`/applications/${appId}/rounds/${roundId}`, { status });
    loadRounds();
  };

  const handleDelete = async (roundId) => {
    await api.delete(`/applications/${appId}/rounds/${roundId}`);
    loadRounds();
  };

  if (!appId) {
    return <p style={{ fontSize: 13, color: "#6b7280" }}>Save the application first to add interview rounds.</p>;
  }

  return (
    <div>
      <h3 style={{ fontSize: 16 }}>Interview rounds</h3>

      {rounds.length === 0 && <p style={{ fontSize: 13, color: "#6b7280" }}>No rounds added yet.</p>}

      {rounds.map((r) => (
        <div key={r.id} className="card" style={{ padding: 12, marginBottom: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <strong>Round {r.round_number}: {r.round_name}</strong>
            <button className="btn" style={{ background: "#ef4444", padding: "4px 10px" }} onClick={() => handleDelete(r.id)}>
              Remove
            </button>
          </div>
          {r.round_date && (
            <p style={{ fontSize: 13, margin: "4px 0" }}>
              Date: {new Date(r.round_date).toLocaleDateString()}
            </p>
          )}
          <select value={r.status} onChange={(e) => handleStatusChange(r.id, e.target.value)} style={{ marginBottom: 4 }}>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
          </select>
          {r.notes && <p style={{ fontSize: 13, color: "#6b7280" }}>{r.notes}</p>}
        </div>
      ))}

      <form onSubmit={handleAdd} style={{ marginTop: 12 }}>
        <input
          placeholder="Round name (e.g. Technical Round 1, HR)"
          value={newRound.round_name}
          onChange={(e) => setNewRound({ ...newRound, round_name: e.target.value })}
        />
        <input
          type="date"
          value={newRound.round_date}
          onChange={(e) => setNewRound({ ...newRound, round_date: e.target.value })}
        />
        <textarea
          placeholder="Notes (topics covered, interviewer feedback, etc.)"
          rows={2}
          value={newRound.notes}
          onChange={(e) => setNewRound({ ...newRound, notes: e.target.value })}
        />
        <button className="btn" type="submit">+ Add round</button>
      </form>
    </div>
  );
}

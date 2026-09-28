import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios.js";
import InterviewRounds from "../components/InterviewRounds.jsx";
import { showToast } from "../utils/toast.js";

export default function AddEditApplication() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [applicationId, setApplicationId] = useState(id || null);
  const [form, setForm] = useState({
    company_name: "",
    role_title: "",
    job_link: "",
    status: "applied",
    notes: "",
    location: "",
    ctc_offered: "",
    ctc_expected: "",
    skills_asked: "",
    next_step_date: "",
  });
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeFilename, setResumeFilename] = useState(null);
  const [uploadError, setUploadError] = useState("");

  const [jdText, setJdText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  useEffect(() => {
    if (isEdit) {
      api.get(`/applications/${id}`).then((res) => {
        const data = res.data;
        setForm({
          ...data,
          next_step_date: data.next_step_date ? data.next_step_date.slice(0, 10) : "",
        });
        setResumeFilename(data.resume_filename);
      });
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, next_step_date: form.next_step_date || null };
    let savedId = applicationId;

    try {
      if (isEdit) {
        await api.put(`/applications/${id}`, payload);
      } else {
        const res = await api.post("/applications/", payload);
        savedId = res.data.id;
        setApplicationId(savedId);
      }
    } catch (err) {
      showToast(err.response?.data?.detail || "Could not save application", "error");
      return;
    }

    if (resumeFile && savedId) {
      const formData = new FormData();
      formData.append("file", resumeFile);
      try {
        await api.post(`/applications/${savedId}/upload-resume`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } catch (err) {
        setUploadError(err.response?.data?.detail || "Resume upload failed");
        showToast("Application saved, but resume upload failed", "warning");
        return;
      }
    }

    showToast(isEdit ? "Application updated" : "Application added", "success");
    navigate("/");
  };

  const handleAutoFill = async () => {
    setAiError("");
    setAiLoading(true);
    try {
      const res = await api.post("/ai/parse-jd", { jd_text: jdText });
      setForm((prev) => ({
        ...prev,
        company_name: res.data.company_name || prev.company_name,
        role_title: res.data.role_title || prev.role_title,
        skills_asked: res.data.key_skills?.length ? res.data.key_skills.join(", ") : prev.skills_asked,
      }));
    } catch (err) {
      setAiError(err.response?.data?.detail || "AI parsing failed — fill manually");
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="card" style={{ maxWidth: 600, margin: "24px auto" }}>
      <h2>{isEdit ? "Edit" : "Add"} Application</h2>

      <div style={{ background: "#f0f9ff", padding: 12, borderRadius: 6, marginBottom: 16 }}>
        <p style={{ margin: "0 0 8px", fontSize: 13 }}>
          Optional: paste a job description to auto-fill fields with AI. Always review before saving.
        </p>
        <textarea
          rows={4}
          placeholder="Paste job description here..."
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
        />
        <button type="button" className="btn" onClick={handleAutoFill} disabled={aiLoading || !jdText}>
          {aiLoading ? "Parsing..." : "Auto-fill with AI"}
        </button>
        {aiError && <p style={{ color: "red", fontSize: 13 }}>{aiError}</p>}
      </div>

      <form onSubmit={handleSubmit}>
        <input name="company_name" placeholder="Company name" value={form.company_name} onChange={handleChange} required />
        <input name="role_title" placeholder="Role title" value={form.role_title} onChange={handleChange} required />
        <input name="location" placeholder="Location (e.g. Remote, Bangalore)" value={form.location || ""} onChange={handleChange} />
        <input name="job_link" placeholder="Job posting link" value={form.job_link || ""} onChange={handleChange} />

        <select name="status" value={form.status} onChange={handleChange}>
          <option value="applied">Applied</option>
          <option value="oa">OA / Assessment</option>
          <option value="interview">Interview</option>
          <option value="offer">Offer</option>
          <option value="rejected">Rejected</option>
        </select>

        <div style={{ display: "flex", gap: 8 }}>
          <input name="ctc_offered" placeholder="CTC offered (e.g. 12 LPA)" value={form.ctc_offered || ""} onChange={handleChange} />
          <input name="ctc_expected" placeholder="CTC expected" value={form.ctc_expected || ""} onChange={handleChange} />
        </div>

        <input name="skills_asked" placeholder="Skills asked (comma-separated, e.g. React, SQL, System Design)" value={form.skills_asked || ""} onChange={handleChange} />

        <label style={{ fontSize: 13, color: "#374151" }}>Next step date (interview, deadline, etc.)</label>
        <input type="date" name="next_step_date" value={form.next_step_date || ""} onChange={handleChange} />

        <label style={{ fontSize: 13, color: "#374151" }}>Resume version</label>
        {resumeFilename && <p style={{ fontSize: 13, margin: "0 0 6px" }}>Current: {resumeFilename}</p>}
        <input type="file" accept=".pdf,.doc,.docx" onChange={(e) => setResumeFile(e.target.files[0])} />
        {uploadError && <p style={{ color: "red", fontSize: 13 }}>{uploadError}</p>}

        <textarea name="notes" placeholder="Notes" rows={3} value={form.notes || ""} onChange={handleChange} />
        <button className="btn" type="submit">{isEdit ? "Update" : "Save"}</button>
      </form>

      <hr style={{ margin: "20px 0" }} />
      <InterviewRounds appId={applicationId} />
    </div>
  );
}

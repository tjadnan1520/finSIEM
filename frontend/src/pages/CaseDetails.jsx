import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCase, listFieldOfficers, transferCase } from "../services/case.service";
import { formatDateTime } from "../utils/formatters";
import Loader from "../components/common/Loader";
import "./CaseDetails.css";

const CaseDetails = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const [caseRecord, setCaseRecord] = useState(null);
  const [fieldOfficers, setFieldOfficers] = useState([]);
  const [assignedToId, setAssignedToId] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const canTransfer = user?.role === "Operator" || user?.role === "Management";

  useEffect(() => {
    getCase(id).then(setCaseRecord).catch((requestError) => setError(requestError.message));
  }, [id]);

  useEffect(() => {
    if (!canTransfer) return;

    listFieldOfficers()
      .then((officers) => {
        setFieldOfficers(officers);
        setAssignedToId((current) => current || officers[0]?.id || "");
      })
      .catch((requestError) => setMessage(requestError.message));
  }, [canTransfer]);

  const handleTransfer = async (event) => {
    event.preventDefault();
    if (!assignedToId) return;

    setSaving(true);
    setMessage("");
    try {
      await transferCase(id, assignedToId);
      const updatedCase = await getCase(id);
      setCaseRecord(updatedCase);
      setMessage("Case transferred successfully.");
    } catch (requestError) {
      setMessage(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  if (error) return <div className="panel page-error">{error}</div>;
  if (!caseRecord) return <Loader label="Loading case details" />;

  return (
    <div className="case-detail-page">
      <header>
        <h1 className="page-title">{caseRecord.caseNumber}</h1>
        <p className="page-subtitle">{caseRecord.title}</p>
      </header>
      <section className="case-detail-page__grid">
        <article className="panel case-panel">
          <h2>Case State</h2>
          <p><strong>Status:</strong> {caseRecord.status}</p>
          <p><strong>Priority:</strong> {caseRecord.priority}</p>
          <p><strong>Alert:</strong> {caseRecord.alert.title}</p>
        </article>
        {canTransfer && (
          <article className="panel case-panel">
            <h2>Transfer Case</h2>
            <form className="case-transfer" onSubmit={handleTransfer}>
              <label>
                Available Field Officer
                <select value={assignedToId} onChange={(event) => setAssignedToId(event.target.value)}>
                  {fieldOfficers.map((officer) => (
                    <option key={officer.id} value={officer.id}>
                      {officer.name} - {officer.area}
                    </option>
                  ))}
                </select>
              </label>
              {message && <p>{message}</p>}
              <button type="submit" disabled={saving || !assignedToId}>
                {saving ? "Transferring" : "Transfer Case"}
              </button>
            </form>
          </article>
        )}
        <article className="panel case-panel">
          <h2>Timeline</h2>
          {caseRecord.timeline.map((item) => (
            <div className="timeline-row" key={item.id}>
              <strong>{item.event}</strong>
              <span>{item.description}</span>
              <small>{formatDateTime(item.createdAt)}</small>
            </div>
          ))}
        </article>
      </section>
    </div>
  );
};

export default CaseDetails;

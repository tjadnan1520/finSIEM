import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { assignCase, getCase, listFieldOfficers, resolveCase } from "../services/case.service";
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

  const canTransfer = (user?.role === "Operator" || user?.role === "Management")
    && !["RESOLVED", "CLOSED"].includes(caseRecord?.status);
  const canResolve = (user?.role === "Field Officer" || user?.role === "Agent")
    && caseRecord?.assignments?.some((assignment) => assignment.assignedToId === user.id)
    && !["RESOLVED", "CLOSED"].includes(caseRecord?.status);

  useEffect(() => {
    getCase(id)
      .then((loadedCase) => {
        setCaseRecord(loadedCase);
      })
      .catch((requestError) => setError(requestError.message));
  }, [id]);

  useEffect(() => {
    if (!canTransfer || !caseRecord) return;

    listFieldOfficers({
      caseId: id,
      areaId: caseRecord.agent?.area?.id,
      providerId: caseRecord.alert.provider?.id
    })
      .then((officers) => {
        setFieldOfficers(officers);
        setAssignedToId((current) => officers.some((officer) => officer.id === current) ? current : "");
      })
      .catch((requestError) => setMessage(requestError.message));
  }, [canTransfer, caseRecord, id]);

  const handleTransfer = async (event) => {
    event.preventDefault();
    if (!assignedToId) return;

    setSaving(true);
    setMessage("");
    try {
      await assignCase(id, assignedToId);
      const updatedCase = await getCase(id);
      setCaseRecord(updatedCase);
      setAssignedToId("");
      setMessage("Case assigned successfully.");
    } catch (requestError) {
      setMessage(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const handleResolve = async () => {
    setSaving(true);
    setMessage("");
    try {
      const updatedCase = await resolveCase(id);
      setCaseRecord(updatedCase);
      setMessage("Case marked as resolved.");
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
      {message && <p className="case-detail-page__message">{message}</p>}
      <section className="case-detail-page__grid">
        <article className="panel case-panel">
          <h2>Case State</h2>
          <p><strong>Status:</strong> {caseRecord.status}</p>
          <p><strong>Priority:</strong> {caseRecord.priority}</p>
          <p><strong>Provider:</strong> {caseRecord.alert.provider?.name || "All Providers"}</p>
          <p><strong>Alert:</strong> {caseRecord.alert.title}</p>
          {caseRecord.agent && (
            <>
              <p><strong>Agent:</strong> {caseRecord.agent.name}</p>
              <p><strong>Number:</strong> {caseRecord.agent.phone}</p>
              <p><strong>Area:</strong> {caseRecord.agent.area.name}</p>
              <p><strong>Region:</strong> {caseRecord.agent.area.region}</p>
            </>
          )}
          <p><strong>Assigned Field Worker:</strong> {caseRecord.assignments?.[0]?.assignedTo?.name || "Unassigned"}</p>
          {canResolve && (
            <button className="case-resolve-button" type="button" disabled={saving} onClick={handleResolve}>
              {saving ? "Resolving" : "Mark Resolved"}
            </button>
          )}
        </article>
        {canTransfer && (
          <article className="panel case-panel">
            <h2>Assign Field Worker</h2>
            <form className="case-transfer" onSubmit={handleTransfer}>
              <label>
                Provider
                <select value={caseRecord.alert.provider?.id || ""} disabled>
                  <option value={caseRecord.alert.provider?.id || ""}>
                    {caseRecord.alert.provider?.name || "All Providers"}
                  </option>
                </select>
              </label>
              <label>
                Case Area
                <select value={caseRecord.agent?.area?.id || ""} disabled>
                  <option value={caseRecord.agent?.area?.id || ""}>
                    {caseRecord.agent?.area?.name || "No area attached"}
                    {caseRecord.agent?.area?.region ? `, ${caseRecord.agent.area.region}` : ""}
                  </option>
                </select>
              </label>
              <label>
                Field Worker
                <select value={assignedToId} onChange={(event) => setAssignedToId(event.target.value)}>
                  <option value="">Select a field worker</option>
                  {fieldOfficers.map((officer) => (
                    <option key={officer.id} value={officer.id}>
                      {officer.name} - {officer.officerCode || "No code"} - {officer.phone || "No phone"}
                    </option>
                  ))}
                </select>
              </label>
              {!fieldOfficers.length && <p>No field worker found for this case area and provider.</p>}
              {fieldOfficers.length > 0 && !assignedToId && <p>Select a field worker from the dropdown to assign this case.</p>}
              <button type="submit" disabled={saving || !assignedToId}>
                {saving ? "Assigning" : "Assign Case"}
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

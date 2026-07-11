import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getCase, listFieldOfficers, resolveCase, transferCase } from "../services/case.service";
import { formatDateTime } from "../utils/formatters";
import Loader from "../components/common/Loader";
import "./CaseDetails.css";

const CaseDetails = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const [caseRecord, setCaseRecord] = useState(null);
  const [fieldOfficers, setFieldOfficers] = useState([]);
  const [regionOptions, setRegionOptions] = useState([]);
  const [regionFilter, setRegionFilter] = useState("");
  const [areaOptions, setAreaOptions] = useState([]);
  const [areaFilter, setAreaFilter] = useState("");
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
        setRegionFilter(loadedCase.agent?.area?.region || "");
        setRegionOptions(loadedCase.agent?.area?.region ? [loadedCase.agent.area.region] : []);
        setAreaFilter(loadedCase.agent?.area?.id || "");
        setAreaOptions(loadedCase.agent?.area ? [loadedCase.agent.area] : []);
      })
      .catch((requestError) => setError(requestError.message));
  }, [id]);

  useEffect(() => {
    if (!canTransfer || !caseRecord) return;

    listFieldOfficers({
      caseId: id,
      areaId: areaFilter,
      providerId: caseRecord.alert.provider?.id,
      region: regionFilter
    })
      .then((officers) => {
        setFieldOfficers(officers);
        setAssignedToId((current) => officers.some((officer) => officer.id === current) ? current : officers[0]?.id || "");
      })
      .catch((requestError) => setMessage(requestError.message));
  }, [areaFilter, canTransfer, caseRecord, id, regionFilter]);

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
          {canResolve && (
            <button className="case-resolve-button" type="button" disabled={saving} onClick={handleResolve}>
              {saving ? "Resolving" : "Mark Resolved"}
            </button>
          )}
        </article>
        {canTransfer && (
          <article className="panel case-panel">
            <h2>Transfer Case</h2>
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
                Region
                <select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)}>
                  <option value="">All regions</option>
                  {regionOptions.map((region) => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </label>
              <label>
                Area
                <select value={areaFilter} onChange={(event) => setAreaFilter(event.target.value)}>
                  {areaOptions.map((area) => (
                    <option key={area.id} value={area.id}>{area.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Available Field Officer
                <select value={assignedToId} onChange={(event) => setAssignedToId(event.target.value)}>
                  {fieldOfficers.map((officer) => (
                    <option key={officer.id} value={officer.id}>
                      {officer.name} - {officer.provider}, {officer.area}, {officer.region}
                    </option>
                  ))}
                </select>
              </label>
              {!fieldOfficers.length && <p>No field officer found for the selected filter.</p>}
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

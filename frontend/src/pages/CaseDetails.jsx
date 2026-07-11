import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getCase } from "../services/case.service";
import { formatDateTime } from "../utils/formatters";
import Loader from "../components/common/Loader";
import "./CaseDetails.css";

const CaseDetails = () => {
  const { id } = useParams();
  const [caseRecord, setCaseRecord] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getCase(id).then(setCaseRecord).catch((requestError) => setError(requestError.message));
  }, [id]);

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

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listCases } from "../services/case.service";
import { formatDateTime } from "../utils/formatters";
import Loader from "../components/common/Loader";
import "./Cases.css";

const Cases = () => {
  const [cases, setCases] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    listCases().then(setCases).catch((requestError) => setError(requestError.message));
  }, []);

  if (error) return <div className="panel page-error">{error}</div>;
  if (!cases) return <Loader label="Loading cases" />;

  return (
    <div className="cases-page">
      <header>
        <h1 className="page-title">Cases</h1>
        <p className="page-subtitle">Review cases and follow their progress.</p>
      </header>
      <section className="cases-list panel">
        {cases.map((caseRecord) => (
          <Link to={`/cases/${caseRecord.id}`} key={caseRecord.id}>
            <strong>{caseRecord.caseNumber}</strong>
            <span>{caseRecord.title}</span>
            <span>{caseRecord.agent ? `${caseRecord.agent.name} - ${caseRecord.agent.area}` : caseRecord.assignedTo}</span>
            <em className={`status-pill ${caseRecord.priority.toLowerCase()}`}>{caseRecord.priority}</em>
            <small>{formatDateTime(caseRecord.createdAt)}</small>
          </Link>
        ))}
      </section>
    </div>
  );
};

export default Cases;

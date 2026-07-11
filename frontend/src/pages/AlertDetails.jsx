import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAlert } from "../services/alert.service";
import { formatDateTime } from "../utils/formatters";
import Loader from "../components/common/Loader";
import "./AlertDetails.css";

const AlertDetails = () => {
  const { id } = useParams();
  const [alert, setAlert] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getAlert(id).then(setAlert).catch((requestError) => setError(requestError.message));
  }, [id]);

  if (error) return <div className="panel page-error">{error}</div>;
  if (!alert) return <Loader label="Loading alert details" />;

  return (
    <div className="detail-page">
      <header>
        <h1 className="page-title">{alert.title}</h1>
        <p className="page-subtitle">{alert.provider} • {formatDateTime(alert.createdAt)}</p>
      </header>
      <section className="detail-page__grid">
        <article className="panel detail-card">
          <h2>AI Explanation</h2>
          <strong>{alert.aiAnalysis?.summary}</strong>
          <p>{alert.aiAnalysis?.reasoning}</p>
          <p>{alert.aiAnalysis?.recommendation}</p>
        </article>
        <article className="panel detail-card">
          <h2>Evidence</h2>
          {alert.evidence.map((item) => (
            <div className="detail-row" key={item.id}>
              <span>{item.source}</span>
              <strong>{item.label}: {item.value}</strong>
            </div>
          ))}
        </article>
      </section>
    </div>
  );
};

export default AlertDetails;

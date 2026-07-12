import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { BrainCircuit, Lightbulb, ShieldAlert } from "lucide-react";
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

  const aiAnalysis = alert.aiAnalysis;
  const evidence = alert.evidence || [];

  return (
    <div className="detail-page">
      <header>
        <h1 className="page-title">{alert.title}</h1>
        <p className="page-subtitle">{alert.provider} - {formatDateTime(alert.createdAt)}</p>
      </header>
      <section className="detail-page__grid">
        <article className="panel detail-card">
          <div className="detail-card__title">
            <BrainCircuit size={20} />
            <h2>AI Explanation</h2>
          </div>
          {aiAnalysis ? (
            <div className="ai-explanation">
              <strong>{aiAnalysis.summary}</strong>
              <p>{aiAnalysis.reasoning}</p>
              <div className="ai-explanation__callout">
                <ShieldAlert size={18} />
                <span>{aiAnalysis.evidenceExplanation}</span>
              </div>
              <div className="ai-explanation__callout recommendation">
                <Lightbulb size={18} />
                <span>{aiAnalysis.recommendation}</span>
              </div>
              <dl className="ai-explanation__meta">
                <div>
                  <dt>Confidence</dt>
                  <dd>{aiAnalysis.confidence}%</dd>
                </div>
                <div>
                  <dt>Uncertainty</dt>
                  <dd>{aiAnalysis.uncertainty}</dd>
                </div>
                <div>
                  <dt>Limitations</dt>
                  <dd>{aiAnalysis.limitations}</dd>
                </div>
              </dl>
            </div>
          ) : (
            <p className="detail-card__empty">No AI explanation is attached to this alert.</p>
          )}
        </article>
        <article className="panel detail-card">
          <h2>Evidence</h2>
          {evidence.length > 0 ? (
            evidence.map((item) => (
              <div className="detail-row" key={item.id}>
                <div>
                  <span>{item.source}</span>
                  <strong>{item.label}: {item.value}</strong>
                </div>
                <em>{Math.round(item.weight * 100)}% weight</em>
              </div>
            ))
          ) : (
            <p className="detail-card__empty">No evidence records are attached to this alert.</p>
          )}
        </article>
      </section>
    </div>
  );
};

export default AlertDetails;

import React from "react";
import { Sparkles } from "lucide-react";
import "./AIRecommendation.css";

const AIRecommendation = ({ recommendation }) => (
  <section className="ai-recommendation panel">
    <div className="ai-recommendation__icon">
      <Sparkles size={20} />
    </div>
    <div>
      <div className="dashboard-section__header">
        <div>
          <h2>Recommendation</h2>
          <p>Helpful context for the current review.</p>
        </div>
        {recommendation?.confidence && (
          <span className="status-pill success">{Number(recommendation.confidence).toFixed(0)}% confidence</span>
        )}
      </div>
      {recommendation ? (
        <div className="ai-recommendation__body">
          <strong>{recommendation.summary}</strong>
          <p>{recommendation.recommendation}</p>
          <small>{recommendation.uncertainty}</small>
        </div>
      ) : (
        <p className="ai-recommendation__empty">No recommendation is available yet.</p>
      )}
    </div>
  </section>
);

export default AIRecommendation;

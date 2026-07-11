import React, { useEffect, useState } from "react";
import { getAnalytics } from "../services/analytics.service";
import { formatDateTime } from "../utils/formatters";
import Loader from "../components/common/Loader";
import "./Analytics.css";

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getAnalytics().then(setAnalytics).catch((requestError) => setError(requestError.message));
  }, []);

  if (error) return <div className="panel page-error">{error}</div>;
  if (!analytics) return <Loader label="Loading analytics" />;

  return (
    <div className="analytics-page">
      <header>
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Backend-generated operational metrics and trends.</p>
      </header>
      <section className="analytics-grid">
        {analytics.map((metric) => (
          <article className="analytics-card panel" key={metric.id}>
            <span>{metric.metric.replaceAll("_", " ")}</span>
            <strong>{Number(metric.value).toLocaleString("en-BD")}</strong>
            <em className={metric.trend >= 0 ? "positive" : "negative"}>
              {metric.trend >= 0 ? "+" : ""}
              {Number(metric.trend).toFixed(1)} trend
            </em>
            <small>{metric.provider || metric.area || "Platform"} • {formatDateTime(metric.recordedAt)}</small>
          </article>
        ))}
      </section>
    </div>
  );
};

export default Analytics;

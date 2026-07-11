import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listAlerts } from "../services/alert.service";
import { formatDateTime } from "../utils/formatters";
import Loader from "../components/common/Loader";
import "./Alerts.css";

const Alerts = () => {
  const [alerts, setAlerts] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    listAlerts().then(setAlerts).catch((requestError) => setError(requestError.message));
  }, []);

  if (error) return <div className="panel page-error">{error}</div>;
  if (!alerts) return <Loader label="Loading alerts" />;

  return (
    <div className="alerts-page">
      <header>
        <h1 className="page-title">Alerts</h1>
        <p className="page-subtitle">Review recent alerts and related case activity.</p>
      </header>
      <section className="alerts-list panel">
        {alerts.map((alert) => (
          <Link to={`/alerts/${alert.id}`} key={alert.id}>
            <div>
              <strong>{alert.title}</strong>
              <span>{alert.provider} • {alert.type} • {formatDateTime(alert.createdAt)}</span>
              {alert.summary && <p>{alert.summary}</p>}
            </div>
            <em className={`status-pill ${alert.severity.toLowerCase()}`}>{alert.severity}</em>
          </Link>
        ))}
      </section>
    </div>
  );
};

export default Alerts;

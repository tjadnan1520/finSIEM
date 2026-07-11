import { Link } from "react-router-dom";
import { formatDateTime } from "../../utils/formatters";
import "./RecentAlerts.css";

const RecentAlerts = ({ alerts = [] }) => (
  <section className="recent-alerts panel">
    <div className="dashboard-section__header">
      <div>
        <h2>Recent Alerts</h2>
        <p>Backend-generated operational review signals.</p>
      </div>
    </div>
    <div className="recent-alerts__list">
      {alerts.map((alert) => (
        <Link to={`/alerts/${alert.id}`} key={alert.id}>
          <div>
            <strong>{alert.title}</strong>
            <span>{alert.provider} • {formatDateTime(alert.createdAt)}</span>
          </div>
          <em className={`status-pill ${alert.severity.toLowerCase()}`}>{alert.severity}</em>
        </Link>
      ))}
    </div>
  </section>
);

export default RecentAlerts;

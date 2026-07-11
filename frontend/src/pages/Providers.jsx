import { useEffect, useState } from "react";
import { listProviders } from "../services/provider.service";
import { formatCurrency, formatDateTime } from "../utils/formatters";
import Loader from "../components/common/Loader";
import "./Providers.css";

const Providers = () => {
  const [providers, setProviders] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    listProviders().then(setProviders).catch((requestError) => setError(requestError.message));
  }, []);

  if (error) return <div className="panel page-error">{error}</div>;
  if (!providers) return <Loader label="Loading providers" />;

  return (
    <div className="providers-page">
      <header>
        <h1 className="page-title">Providers</h1>
        <p className="page-subtitle">Provider health and latest balance feed state.</p>
      </header>
      <section className="providers-grid">
        {providers.map((provider) => (
          <article className="provider-card panel" key={provider.id}>
            <div>
              <strong>{provider.name}</strong>
              <span>{provider.code}</span>
            </div>
            <p>{formatCurrency(provider.balance)}</p>
            <small>Target {formatCurrency(provider.minimumTarget)}</small>
            <em className={`status-pill ${provider.feedStatus === "CURRENT" ? "success" : "warning"}`}>{provider.feedStatus}</em>
            <small>Synced {formatDateTime(provider.lastSyncedAt)}</small>
          </article>
        ))}
      </section>
    </div>
  );
};

export default Providers;

import React from "react";
import { formatCurrency } from "../../utils/formatters";
import "./ProviderBalance.css";

const ProviderBalance = ({ providers = [] }) => (
  <section className="provider-balance panel">
    <div className="dashboard-section__header">
      <div>
        <h2>Provider Balances</h2>
        <p>Latest provider float and feed status.</p>
      </div>
    </div>
    <div className="provider-balance__list">
      {providers.map((provider) => {
        const ratio = provider.minimumTarget ? Math.min(100, (provider.balance / provider.minimumTarget) * 100) : 0;
        return (
          <article key={provider.id}>
            <div>
              <strong>{provider.name}</strong>
              <span>{provider.code}</span>
            </div>
            <p>{formatCurrency(provider.balance)}</p>
            <div className="provider-balance__bar" aria-label={`${provider.name} balance ratio`}>
              <span style={{ width: `${ratio}%` }} />
            </div>
            <em className={provider.feedStatus === "CURRENT" ? "success" : "warning"}>{provider.feedStatus}</em>
          </article>
        );
      })}
    </div>
  </section>
);

export default ProviderBalance;

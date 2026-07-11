import React from "react";
import { formatCurrency, formatScore } from "../../utils/formatters";
import "./LiquidityOverview.css";

const LiquidityOverview = ({ data }) => {
  const score = Number(data?.score || 0);

  return (
    <section className="liquidity panel">
      <div className="dashboard-section__header">
        <div>
          <h2>Liquidity Overview</h2>
          <p>Backend-calculated cash, provider balance, and shortage window.</p>
        </div>
        <span className={`status-pill ${score < 40 ? "danger" : score < 65 ? "warning" : "success"}`}>
          {score < 40 ? "Critical" : score < 65 ? "Watch" : "Healthy"}
        </span>
      </div>

      <div className="liquidity__score">
        <div className="liquidity__ring" style={{ "--score": `${score * 3.6}deg` }}>
          <strong>{formatScore(score)}</strong>
          <span>score</span>
        </div>
        <div className="liquidity__metrics">
          <p><span>Cash Ratio</span><strong>{formatScore(data?.cashRatio)}%</strong></p>
          <p><span>Provider Ratio</span><strong>{formatScore(data?.providerBalanceRatio)}%</strong></p>
          <p><span>Time To Shortage</span><strong>{formatScore(data?.timeToShortage)}%</strong></p>
        </div>
      </div>

      <div className="liquidity__forecast">
        {(data?.forecasts || []).map((forecast) => (
          <article key={forecast.horizonMinutes}>
            <span>{forecast.horizonMinutes} min</span>
            <strong>{formatScore(forecast.expectedLiquidity)}</strong>
            <small>{formatCurrency(forecast.projectedShortage)} shortage</small>
          </article>
        ))}
      </div>
    </section>
  );
};

export default LiquidityOverview;

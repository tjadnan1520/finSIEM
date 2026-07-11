import React from "react";
import { Activity, AlertTriangle, Landmark, WalletCards } from "lucide-react";
import { formatCurrency, formatScore } from "../../utils/formatters";
import "./SummaryCards.css";

const icons = [WalletCards, Landmark, Activity, AlertTriangle];

const formatValue = (card) => {
  if (card.format === "currency") return formatCurrency(card.value);
  if (card.format === "score") return formatScore(card.value);
  return Number(card.value || 0).toLocaleString("en-BD");
};

const SummaryCards = ({ cards = [] }) => (
  <section className="summary-grid" aria-label="Operational summary">
    {cards.map((card, index) => {
      const Icon = icons[index] || Activity;
      return (
        <article className="summary-card panel" key={card.label}>
          <div className={`summary-card__icon ${card.tone || "info"}`}>
            <Icon size={20} />
          </div>
          <div>
            <p>{card.label}</p>
            <strong>{formatValue(card)}</strong>
            <span className={Number(card.trend) >= 0 ? "positive" : "negative"}>
              {Number(card.trend) >= 0 ? "+" : ""}
              {Number(card.trend || 0).toFixed(1)} trend
            </span>
          </div>
        </article>
      );
    })}
  </section>
);

export default SummaryCards;

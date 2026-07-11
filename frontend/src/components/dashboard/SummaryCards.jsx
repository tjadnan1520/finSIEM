import React from "react";
import { Landmark, Smartphone, WalletCards } from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import "./SummaryCards.css";

const icons = [WalletCards, Smartphone, Smartphone, Landmark];

const formatValue = (card) => {
  if (card.format === "currency") return formatCurrency(card.value);
  return Number(card.value || 0).toLocaleString("en-BD");
};

const SummaryCards = ({ cards = [] }) => (
  <section className="summary-grid" aria-label="Operational summary">
    {cards.map((card, index) => {
      const Icon = icons[index] || WalletCards;
      return (
        <article className="summary-card panel" key={card.label}>
          <div className={`summary-card__icon ${card.tone || "info"}`}>
            <Icon size={20} />
          </div>
          <div>
            <p>{card.label}</p>
            <strong>{formatValue(card)}</strong>
          </div>
        </article>
      );
    })}
  </section>
);

export default SummaryCards;

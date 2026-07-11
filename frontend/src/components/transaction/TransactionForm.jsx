import React, { useEffect, useState } from "react";
import { createTransaction } from "../../services/transaction.service";
import { listProviders } from "../../services/provider.service";
import { listAgents } from "../../services/agent.service";
import "./TransactionForm.css";

const TransactionForm = ({ initialType = "CASH_IN", onCreated }) => {
  const [type, setType] = useState(initialType);
  const [providers, setProviders] = useState([]);
  const [agents, setAgents] = useState([]);
  const [form, setForm] = useState({ providerId: "", agentId: "", amount: "" });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setType(initialType);
  }, [initialType]);

  useEffect(() => {
    Promise.all([listProviders(), listAgents()])
      .then(([providerData, agentData]) => {
        setProviders(providerData);
        setAgents(agentData);
        setForm((current) => ({
          ...current,
          providerId: current.providerId || providerData[0]?.id || "",
          agentId: current.agentId || agentData[0]?.id || ""
        }));
      })
      .catch((error) => setMessage(error.message));
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const created = await createTransaction({
        type,
        providerId: form.providerId,
        agentId: form.agentId,
        amount: Number(form.amount)
      });
      setMessage(`Transaction processed. Liquidity score ${Number(created.liquidityScore).toFixed(1)}.`);
      setForm((current) => ({ ...current, amount: "" }));
      onCreated?.();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form className="transaction-form panel" onSubmit={handleSubmit}>
      <div className="transaction-form__header">
        <div>
          <h2>Cash Movement</h2>
          <p>Submit cash in or cash out directly to the backend workflow.</p>
        </div>
        <div className="transaction-form__segments" role="tablist" aria-label="Transaction type">
          <button type="button" className={type === "CASH_IN" ? "active" : ""} onClick={() => setType("CASH_IN")}>
            Cash In
          </button>
          <button type="button" className={type === "CASH_OUT" ? "active" : ""} onClick={() => setType("CASH_OUT")}>
            Cash Out
          </button>
        </div>
      </div>

      <div className="transaction-form__grid">
        <label>
          Provider
          <select value={form.providerId} onChange={(event) => setForm({ ...form, providerId: event.target.value })}>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>{provider.name}</option>
            ))}
          </select>
        </label>
        <label>
          Agent
          <select value={form.agentId} onChange={(event) => setForm({ ...form, agentId: event.target.value })}>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>{agent.name} - {agent.area}</option>
            ))}
          </select>
        </label>
        <label>
          Amount
          <input
            type="number"
            min="1"
            step="1"
            value={form.amount}
            onChange={(event) => setForm({ ...form, amount: event.target.value })}
            required
          />
        </label>
      </div>

      {message && <p className="transaction-form__message">{message}</p>}

      <button type="submit" disabled={saving || !form.providerId || !form.agentId}>
        {saving ? "Processing" : "Submit Transaction"}
      </button>
    </form>
  );
};

export default TransactionForm;

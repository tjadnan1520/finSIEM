import React, { useEffect, useState } from "react";
import {
  createAgent,
  createOperator,
  createProvider,
  getManagementData,
  removeAgent,
  removeOperator,
  removeProvider
} from "../services/management.service";
import Loader from "../components/common/Loader";
import "./Management.css";

const defaultProvider = { name: "", code: "", status: "ACTIVE" };
const defaultOperator = { name: "", email: "", password: "Password123!" };
const defaultAgent = { name: "", code: "", phone: "", areaId: "" };

const Management = () => {
  const [data, setData] = useState(null);
  const [providerForm, setProviderForm] = useState(defaultProvider);
  const [operatorForm, setOperatorForm] = useState(defaultOperator);
  const [agentForm, setAgentForm] = useState(defaultAgent);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const loadData = () => {
    getManagementData()
      .then((managementData) => {
        setData(managementData);
        setAgentForm((current) => ({ ...current, areaId: current.areaId || managementData.areas[0]?.id || "" }));
      })
      .catch((requestError) => setError(requestError.message));
  };

  useEffect(() => {
    loadData();
  }, []);

  const runAction = async (action, successMessage) => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await action();
      setMessage(successMessage);
      loadData();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSaving(false);
    }
  };

  const submitProvider = (event) => {
    event.preventDefault();
    runAction(async () => {
      await createProvider(providerForm);
      setProviderForm(defaultProvider);
    }, "Provider added.");
  };

  const submitOperator = (event) => {
    event.preventDefault();
    runAction(async () => {
      await createOperator(operatorForm);
      setOperatorForm(defaultOperator);
    }, "Operator added.");
  };

  const submitAgent = (event) => {
    event.preventDefault();
    runAction(async () => {
      await createAgent(agentForm);
      setAgentForm((current) => ({ ...defaultAgent, areaId: current.areaId }));
    }, "Agent added.");
  };

  if (!data) return <Loader label="Loading management tools" />;

  return (
    <div className="management-page">
      <header>
        <h1 className="page-title">Management</h1>
        <p className="page-subtitle">Maintain providers, operators, and agents.</p>
      </header>

      {(message || error) && <p className={`management-message ${error ? "error" : ""}`}>{error || message}</p>}

      <section className="management-grid">
        <article className="panel management-panel">
          <h2>Providers</h2>
          <form onSubmit={submitProvider}>
            <input placeholder="Name" value={providerForm.name} onChange={(event) => setProviderForm({ ...providerForm, name: event.target.value })} required />
            <input placeholder="Code" value={providerForm.code} onChange={(event) => setProviderForm({ ...providerForm, code: event.target.value.toUpperCase() })} required />
            <button disabled={saving}>Add Provider</button>
          </form>
          <div className="management-list">
            {data.providers.map((provider) => (
              <div key={provider.id}>
                <span><strong>{provider.name}</strong><small>{provider.code}</small></span>
                <button onClick={() => runAction(() => removeProvider(provider.id), "Provider removed.")}>Remove</button>
              </div>
            ))}
          </div>
        </article>

        <article className="panel management-panel">
          <h2>Operators</h2>
          <form onSubmit={submitOperator}>
            <input placeholder="Name" value={operatorForm.name} onChange={(event) => setOperatorForm({ ...operatorForm, name: event.target.value })} required />
            <input type="email" placeholder="Email" value={operatorForm.email} onChange={(event) => setOperatorForm({ ...operatorForm, email: event.target.value })} required />
            <input type="password" placeholder="Password" value={operatorForm.password} onChange={(event) => setOperatorForm({ ...operatorForm, password: event.target.value })} required />
            <button disabled={saving}>Add Operator</button>
          </form>
          <div className="management-list">
            {data.operators.map((operator) => (
              <div key={operator.id}>
                <span><strong>{operator.name}</strong><small>{operator.email}</small></span>
                <button onClick={() => runAction(() => removeOperator(operator.id), "Operator removed.")}>Remove</button>
              </div>
            ))}
          </div>
        </article>

        <article className="panel management-panel">
          <h2>Agents</h2>
          <form onSubmit={submitAgent}>
            <input placeholder="Name" value={agentForm.name} onChange={(event) => setAgentForm({ ...agentForm, name: event.target.value })} required />
            <input placeholder="Code" value={agentForm.code} onChange={(event) => setAgentForm({ ...agentForm, code: event.target.value.toUpperCase() })} required />
            <input placeholder="Phone" value={agentForm.phone} onChange={(event) => setAgentForm({ ...agentForm, phone: event.target.value })} required />
            <select value={agentForm.areaId} onChange={(event) => setAgentForm({ ...agentForm, areaId: event.target.value })} required>
              {data.areas.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}
            </select>
            <button disabled={saving}>Add Agent</button>
          </form>
          <div className="management-list">
            {data.agents.map((agent) => (
              <div key={agent.id}>
                <span><strong>{agent.name}</strong><small>{agent.code} - {agent.area}</small></span>
                <button onClick={() => runAction(() => removeAgent(agent.id), "Agent removed.")}>Remove</button>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
};

export default Management;

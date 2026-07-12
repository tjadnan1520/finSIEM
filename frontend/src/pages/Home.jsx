import React from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  BellRing,
  BrainCircuit,
  ShieldCheck,
  Workflow
} from "lucide-react";
import "./Home.css";

const Home = () => {
  const capabilities = [
    {
      icon: Activity,
      title: "Real-time operations view",
      text: "Monitor provider balances, field cash movement, transactions, alerts, and cases from one workspace."
    },
    {
      icon: BrainCircuit,
      title: "AI-assisted decisions",
      text: "Highlight liquidity pressure, suspicious activity, and next actions so teams can respond before risk grows."
    },
    {
      icon: Workflow,
      title: "Role-based workflows",
      text: "Give operators, management, and field officers the right tools for investigation, transfer, and resolution."
    }
  ];

  const metrics = [
    ["Cash visibility", "Provider and physical cash tracking"],
    ["Alert handling", "Risk alerts linked to investigation cases"],
    ["Field response", "Assignments, status updates, and audit trail"]
  ];

  return (
    <main className="home-page">
      <header className="home-header" aria-label="finSIEM home">
        <Link className="home-brand" to="/">
          <span className="home-brand__mark">
            <ShieldCheck size={22} />
          </span>
          <span>
            <strong>finSIEM</strong>
            <small>Financial operations intelligence</small>
          </span>
        </Link>
        <Link className="home-signin" to="/login">
          Sign in
          <ArrowRight size={18} />
        </Link>
      </header>

      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-hero__content">
          <span className="home-kicker">
            <BellRing size={16} />
            Financial SIEM for branch and field operations
          </span>
          <h1 id="home-title">Detect, prioritize, and resolve financial operations risk.</h1>
          <p>
            finSIEM brings liquidity monitoring, transaction oversight, AI analysis, and case
            management into a single workspace for faster decisions across providers, operators,
            managers, and field officers.
          </p>
          <div className="home-actions">
            <Link className="home-primary" to="/login">
              Sign in to workspace
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      <section className="home-section" aria-labelledby="capabilities-title">
        <div className="home-section__heading">
          <h2 id="capabilities-title">What the system does</h2>
          <p>finSIEM connects monitoring, analysis, and action so operational teams can move with context.</p>
        </div>
        <div className="home-capabilities">
          {capabilities.map((item) => {
            const Icon = item.icon;
            return (
              <article className="home-capability" key={item.title}>
                <span>
                  <Icon size={22} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="home-strip" aria-label="System coverage">
        {metrics.map(([title, text]) => (
          <div key={title}>
            <strong>{title}</strong>
            <span>{text}</span>
          </div>
        ))}
      </section>
    </main>
  );
};

export default Home;

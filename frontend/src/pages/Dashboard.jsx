import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getDashboard } from "../services/dashboard.service";
import Loader from "../components/common/Loader";
import SummaryCards from "../components/dashboard/SummaryCards";
import RecentTransactions from "../components/dashboard/RecentTransactions";
import RecentAlerts from "../components/dashboard/RecentAlerts";
import AIRecommendation from "../components/dashboard/AIRecommendation";
import "./Dashboard.css";

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getDashboard()
      .then(setDashboard)
      .catch((requestError) => setError(requestError.message));
  }, []);

  if (error) {
    return <div className="panel page-error">{error}</div>;
  }

  if (!dashboard) {
    return <Loader label="Loading dashboard" />;
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-page__header">
        <div>
          <h1 className="page-title">Welcome back, {user?.name}</h1>
          <p className="page-subtitle">Here is your current workspace overview.</p>
        </div>
      </header>

      <SummaryCards cards={dashboard.summaryCards} />

      {dashboard.aiRecommendation && <AIRecommendation recommendation={dashboard.aiRecommendation} />}

      <div className="dashboard-page__grid wide">
        <RecentTransactions transactions={dashboard.recentTransactions} />
        <RecentAlerts alerts={dashboard.recentAlerts} />
      </div>

      {user?.role !== "Agent" && (
        <section className="dashboard-page__cases panel">
          <div className="dashboard-section__header">
            <div>
              <h2>Cases</h2>
              <p>Review open items and current status.</p>
            </div>
          </div>
          <div className="dashboard-page__case-list">
            {dashboard.cases.map((caseRecord) => (
              <article key={caseRecord.id}>
                <strong>{caseRecord.caseNumber}</strong>
                <span>{caseRecord.title}</span>
                <em className={`status-pill ${caseRecord.priority.toLowerCase()}`}>{caseRecord.priority}</em>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Dashboard;

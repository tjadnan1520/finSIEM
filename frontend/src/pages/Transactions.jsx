import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { listTransactions } from "../services/transaction.service";
import Loader from "../components/common/Loader";
import TransactionForm from "../components/transaction/TransactionForm";
import TransactionTable from "../components/transaction/TransactionTable";
import "./Transactions.css";

const Transactions = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [transactions, setTransactions] = useState(null);
  const [error, setError] = useState("");
  const initialType = searchParams.get("type") === "CASH_OUT" ? "CASH_OUT" : "CASH_IN";

  const loadTransactions = useCallback(() => {
    listTransactions()
      .then(setTransactions)
      .catch((requestError) => setError(requestError.message));
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  if (error) return <div className="panel page-error">{error}</div>;

  return (
    <div className="transactions-page">
      <header>
        <h1 className="page-title">Transactions</h1>
        <p className="page-subtitle">Review recent cash movement activity.</p>
      </header>
      {user?.role !== "Operator" && <TransactionForm initialType={initialType} onCreated={loadTransactions} />}
      {transactions ? <TransactionTable transactions={transactions} /> : <Loader label="Loading transactions" />}
    </div>
  );
};

export default Transactions;

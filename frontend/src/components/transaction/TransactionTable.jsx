import React from "react";
import { formatCurrency, formatDateTime } from "../../utils/formatters";
import "./TransactionTable.css";

const TransactionTable = ({ transactions = [] }) => (
  <section className="transaction-table panel">
    <div className="dashboard-section__header">
      <div>
        <h2>Transaction Ledger</h2>
        <p>Recent operational cash movement records.</p>
      </div>
    </div>
    <div className="transaction-table__scroll">
      <table>
        <thead>
          <tr>
            <th>Reference</th>
            <th>Type</th>
            <th>Provider</th>
            <th>Agent</th>
            <th>Area</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.reference}</td>
              <td>{transaction.type.replace("_", " ")}</td>
              <td>{transaction.provider}</td>
              <td>
                <span className="transaction-table__agent-phone">{transaction.agentPhone || "-"}</span>
                <small>{transaction.agent}</small>
              </td>
              <td>{transaction.area}</td>
              <td>{formatCurrency(transaction.amount)}</td>
              <td><span className="status-pill success">{transaction.status}</span></td>
              <td>{formatDateTime(transaction.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

export default TransactionTable;

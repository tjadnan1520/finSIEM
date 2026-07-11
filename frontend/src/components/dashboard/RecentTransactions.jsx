import { formatCurrency, formatDateTime } from "../../utils/formatters";
import "./RecentTransactions.css";

const RecentTransactions = ({ transactions = [] }) => (
  <section className="recent-table panel">
    <div className="dashboard-section__header">
      <div>
        <h2>Recent Transactions</h2>
        <p>Latest cash movement accepted by the backend workflow.</p>
      </div>
    </div>
    <div className="recent-table__scroll">
      <table>
        <thead>
          <tr>
            <th>Reference</th>
            <th>Type</th>
            <th>Provider</th>
            <th>Agent</th>
            <th>Amount</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.reference}</td>
              <td><span className="status-pill">{transaction.type.replace("_", " ")}</span></td>
              <td>{transaction.provider}</td>
              <td>{transaction.agent}</td>
              <td>{formatCurrency(transaction.amount)}</td>
              <td>{formatDateTime(transaction.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </section>
);

export default RecentTransactions;

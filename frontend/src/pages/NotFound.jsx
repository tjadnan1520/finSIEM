import { Link } from "react-router-dom";
import "./NotFound.css";

const NotFound = () => (
  <main className="not-found">
    <section className="panel">
      <h1>Page not found</h1>
      <p>The requested workspace route does not exist.</p>
      <Link to="/dashboard">Go to dashboard</Link>
    </section>
  </main>
);

export default NotFound;

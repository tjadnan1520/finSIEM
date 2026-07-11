import React from "react";
import "./Loader.css";

const Loader = ({ label = "Loading" }) => (
  <div className="loader" role="status" aria-live="polite">
    <span className="loader__spinner" />
    <span>{label}</span>
  </div>
);

export default Loader;

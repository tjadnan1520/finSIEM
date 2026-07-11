import React from "react";
import "./Footer.css";

const Footer = () => (
  <footer className="footer">
    <span>AI-Powered Financial Operations Decision Intelligence Platform</span>
    <span>v1.0.0</span>
    <span>{new Date().getFullYear()}</span>
  </footer>
);

export default Footer;

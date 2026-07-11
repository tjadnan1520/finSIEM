import { Outlet, useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "./RoleLayout.css";

const RoleLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className={`role-layout ${collapsed ? "is-collapsed" : ""}`}>
      <Sidebar
        user={user}
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggle={() => setCollapsed((value) => !value)}
        onClose={() => setMobileOpen(false)}
      />
      <div className="role-layout__workspace">
        <Navbar user={user} onLogout={handleLogout} onMenu={() => setMobileOpen(true)} />
        <main className="role-layout__content">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default RoleLayout;

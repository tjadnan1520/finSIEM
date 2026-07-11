import { NavLink, useLocation } from "react-router-dom";
import { ChevronLeft, ChevronRight, ShieldCheck, X } from "lucide-react";
import { menuByRole } from "./menuConfig";
import "./Sidebar.css";

const Sidebar = ({ user, collapsed, mobileOpen, onToggle, onClose }) => {
  const location = useLocation();
  const menu = menuByRole[user?.role] || [];

  return (
    <>
      <aside className={`sidebar ${collapsed ? "is-collapsed" : ""} ${mobileOpen ? "is-open" : ""}`}>
        <div className="sidebar__brand">
          <div className="sidebar__mark" aria-hidden="true">
            <ShieldCheck size={22} />
          </div>
          <div className="sidebar__brand-text">
            <strong>finSIEM</strong>
            <span>Decision Ops</span>
          </div>
          <button className="sidebar__mobile-close" type="button" aria-label="Close navigation" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar__nav" aria-label="Primary navigation">
          {menu.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path.split("?")[0];
            return (
              <NavLink
                key={`${item.label}-${item.path}`}
                to={item.path}
                className={({ isActive }) => `sidebar__link ${isActive || active ? "active" : ""}`}
                onClick={onClose}
              >
                <Icon size={19} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <button className="sidebar__toggle" type="button" aria-label="Toggle sidebar" onClick={onToggle}>
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          <span>Collapse</span>
        </button>
      </aside>
      <button
        className={`sidebar-overlay ${mobileOpen ? "is-visible" : ""}`}
        aria-label="Close navigation overlay"
        type="button"
        onClick={onClose}
      />
    </>
  );
};

export default Sidebar;

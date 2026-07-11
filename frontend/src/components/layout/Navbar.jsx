import React from "react";
import { Bell, ChevronDown, LogOut, Menu, Search, UserRound } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { routeTitles } from "./menuConfig";
import "./Navbar.css";

const initials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "U";

const Navbar = ({ user, onLogout, onMenu }) => {
  const location = useLocation();
  const title = routeTitles[location.pathname] || "Workspace";

  return (
    <header className="navbar">
      <button className="navbar__menu" type="button" aria-label="Open navigation" onClick={onMenu}>
        <Menu size={22} />
      </button>

      <div className="navbar__title">
        <span>finSIEM</span>
        <h1>{title}</h1>
      </div>

      <label className="navbar__search">
        <Search size={17} />
        <input type="search" placeholder="Search operations" aria-label="Search operations" />
      </label>

      <div className="navbar__actions">
        <button className="navbar__icon" type="button" aria-label="Notifications">
          <Bell size={19} />
        </button>

        <details className="navbar__profile">
          <summary>
            {user?.avatar ? (
              <img src={user.avatar} alt="" />
            ) : (
              <span className="navbar__avatar">{initials(user?.name)}</span>
            )}
            <span className="navbar__identity">
              <strong>{user?.name}</strong>
              <em>{user?.role}</em>
            </span>
            <ChevronDown size={16} />
          </summary>
          <div className="navbar__dropdown">
            <Link to="/profile">
              <UserRound size={16} />
              Profile
            </Link>
            <button type="button" onClick={onLogout}>
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </details>
      </div>
    </header>
  );
};

export default Navbar;

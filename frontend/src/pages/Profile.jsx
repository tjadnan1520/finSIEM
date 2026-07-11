import React from "react";
import { useAuth } from "../context/AuthContext";
import "./Profile.css";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="profile-page">
      <header>
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Authenticated user context from the backend JWT session.</p>
      </header>
      <section className="profile-card panel">
        {user?.avatar && <img src={user.avatar} alt="" />}
        <div>
          <span>Name</span>
          <strong>{user?.name}</strong>
        </div>
        <div>
          <span>Email</span>
          <strong>{user?.email}</strong>
        </div>
        <div>
          <span>Role</span>
          <strong>{user?.role}</strong>
        </div>
      </section>
    </div>
  );
};

export default Profile;

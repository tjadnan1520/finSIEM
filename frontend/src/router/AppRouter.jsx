import React from "react";
import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/common/ProtectedRoute";
import RoleLayout from "../components/layout/RoleLayout";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Transactions from "../pages/Transactions";
import Alerts from "../pages/Alerts";
import AlertDetails from "../pages/AlertDetails";
import Cases from "../pages/Cases";
import CaseDetails from "../pages/CaseDetails";
import Analytics from "../pages/Analytics";
import Providers from "../pages/Providers";
import Profile from "../pages/Profile";
import NotFound from "../pages/NotFound";

const AppRouter = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<RoleLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/alerts/:id" element={<AlertDetails />} />
        <Route path="/cases" element={<Cases />} />
        <Route path="/cases/:id" element={<CaseDetails />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/providers" element={<Providers />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Route>
    <Route path="*" element={<NotFound />} />
  </Routes>
);

export default AppRouter;

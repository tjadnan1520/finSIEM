import {
  AlertTriangle,
  BarChart3,
  BriefcaseBusiness,
  Building2,
  CircleDollarSign,
  LayoutDashboard,
  LogOut,
  UserRound,
  WalletCards
} from "lucide-react";

export const menuByRole = {
  Agent: [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Cash In", path: "/transactions?type=CASH_IN", icon: CircleDollarSign },
    { label: "Cash Out", path: "/transactions?type=CASH_OUT", icon: WalletCards },
    { label: "Transactions", path: "/transactions", icon: LogOut },
    { label: "Alerts", path: "/alerts", icon: AlertTriangle },
    { label: "Profile", path: "/profile", icon: UserRound }
  ],
  Operator: [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Alerts", path: "/alerts", icon: AlertTriangle },
    { label: "Cases", path: "/cases", icon: BriefcaseBusiness },
    { label: "Assignments", path: "/cases", icon: UserRound },
    { label: "Transactions", path: "/transactions", icon: LogOut },
    { label: "Profile", path: "/profile", icon: UserRound }
  ],
  Management: [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Analytics", path: "/analytics", icon: BarChart3 },
    { label: "Providers", path: "/providers", icon: Building2 },
    { label: "Reports", path: "/analytics", icon: BarChart3 },
    { label: "Cases", path: "/cases", icon: BriefcaseBusiness },
    { label: "Profile", path: "/profile", icon: UserRound }
  ]
};

export const routeTitles = {
  "/dashboard": "Dashboard",
  "/transactions": "Transactions",
  "/alerts": "Alerts",
  "/cases": "Cases",
  "/analytics": "Analytics",
  "/providers": "Providers",
  "/profile": "Profile"
};

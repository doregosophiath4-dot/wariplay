"use client";

import { useState } from "react";
import Login from "@/components/admin/login";
import Dashboard from "@/components/admin/dashboard";
import UsersPage from "@/components/admin/users";
import PartiesPage from "@/components/admin/parties";
import ProduitsPage from "@/components/admin/produits";
import MisesPage from "@/components/admin/mises";
import AnalyticsPage from "@/components/admin/analytics";
import ParametresPage from "@/components/admin/parametres";
import type { AdminPage } from "@/components/admin/side";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<AdminPage>("dashboard");

  if (!isAuthenticated) {
    return <Login onSuccess={() => setIsAuthenticated(true)} />;
  }

  switch (currentPage) {
    case "users":
      return <UsersPage currentPage={currentPage} onNavigate={setCurrentPage} />;
    case "parties":
      return <PartiesPage currentPage={currentPage} onNavigate={setCurrentPage} />;
    case "produits":
      return <ProduitsPage currentPage={currentPage} onNavigate={setCurrentPage} />;
    case "mises":
      return <MisesPage currentPage={currentPage} onNavigate={setCurrentPage} />;
    case "analytics":
      return <AnalyticsPage currentPage={currentPage} onNavigate={setCurrentPage} />;
    case "parametres":
      return <ParametresPage currentPage={currentPage} onNavigate={setCurrentPage} />;
    case "dashboard":
    default:
      return <Dashboard currentPage={currentPage} onNavigate={setCurrentPage} />;
  }
}
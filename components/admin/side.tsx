"use client";

import {
  PieChart,
  Home,
  Users,
  Gamepad2,
  Package,
  Coins,
  ArrowDownToLine,
  ArrowUpFromLine,
  LineChart,
  Settings,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export type AdminPage =
  | "dashboard"
  | "users"
  | "parties"
  | "produits"
  | "mises"
  | "depots"
  | "retraits"
  | "analytics"
  | "parametres";

interface SidebarProps {
  open: boolean;
  active: AdminPage;
  onNavigate: (page: AdminPage) => void;
  onClose?: () => void;
}

export default function Sidebar({
  open,
  active,
  onNavigate,
  onClose,
}: SidebarProps) {
  const links: { icon: any; label: string; key: AdminPage }[] = [
    { icon: Home, label: "Dashboard", key: "dashboard" },
    { icon: Users, label: "Utilisateurs", key: "users" },
    { icon: Gamepad2, label: "Parties", key: "parties" },
    { icon: Package, label: "Produits", key: "produits" },
    { icon: Coins, label: "Mises", key: "mises" },
    { icon: ArrowDownToLine, label: "Dépôts", key: "depots" },
    { icon: ArrowUpFromLine, label: "Retraits", key: "retraits" },
    { icon: LineChart, label: "Analytics", key: "analytics" },
    { icon: Settings, label: "Paramètres", key: "parametres" },
  ];

  const handleNavigate = (page: AdminPage) => {
    onNavigate(page);
    onClose?.();
  };

  return (
    <>
      {/* Overlay mobile */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[99] bg-black/60 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar — même fond que le header */}
      <aside
        id="sidebar"
        className={`fixed z-[100] h-screen w-[260px] border-r border-white/6 bg-[#14142b] p-4 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] sm:p-5 md:p-6 ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="mb-8 flex items-center justify-between gap-3 px-2 sm:mb-9 md:mb-10">
          <div className="flex items-center gap-3 text-xl font-bold text-white">
            <PieChart className="h-6 w-6 shrink-0 text-[#00c896]" />
            <span className="hidden sm:inline">AdminPro</span>
            <span className="sm:hidden">AP</span>
          </div>

          {/* Croix de fermeture — mobile uniquement */}
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/5 hover:text-white md:hidden"
            aria-label="Fermer le menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1.5">
          {links.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => handleNavigate(item.key)}
              className={`flex w-full items-center gap-3.5 rounded-xl px-3 py-2.5 text-left text-[0.9rem] font-medium transition-all sm:px-3.5 sm:py-3 md:px-4 md:text-[0.95rem] ${
                active === item.key
                  ? "bg-white/5 text-white"
                  : "text-white/50 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" strokeWidth={2} />
              <span className="truncate">{item.label}</span>
              {active === item.key && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#00c896]" />
              )}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}
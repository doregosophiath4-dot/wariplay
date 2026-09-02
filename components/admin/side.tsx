"use client";

import {
  PieChart,
  Home,
  Users,
  Gamepad2,
  Package,
  Coins,
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
  | "analytics"
  | "parametres";

interface SidebarProps {
  open: boolean;
  active: AdminPage;
  onNavigate: (page: AdminPage) => void;
  onClose?: () => void;
}

export default function Sidebar({ open, active, onNavigate, onClose }: SidebarProps) {
  const links: { icon: any; label: string; key: AdminPage }[] = [
    { icon: Home, label: "Dashboard", key: "dashboard" },
    { icon: Users, label: "Utilisateurs", key: "users" },
    { icon: Gamepad2, label: "Parties", key: "parties" },
    { icon: Package, label: "Produits", key: "produits" },
    { icon: Coins, label: "Mises", key: "mises" },
    { icon: LineChart, label: "Analytics", key: "analytics" },
    { icon: Settings, label: "Paramètres", key: "parametres" },
  ];

  return (
    <>
      {/* Overlay pour mobile */}
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

      {/* Sidebar - CHANGEMENT 1: même couleur que le header */}
      <aside
        className={`fixed z-[100] h-screen w-[260px] border-r border-white/6 bg-[#14142b] p-6 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          open ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        <div className="mb-10 flex items-center justify-between gap-3 px-3 text-xl font-bold text-white">
          <div className="flex items-center gap-3">
            <PieChart className="h-6 w-6 text-[#00c896]" />
            <span>AdminPro</span>
          </div>
          
          {/* CHANGEMENT 2: Croix de fermeture qui répond */}
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-white/60 transition hover:bg-white/5 hover:text-white md:hidden"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1.5">
          {links.map((item) => (
            <button
              key={item.key}
              onClick={() => {
                onNavigate(item.key);
                if (window.innerWidth < 768 && onClose) {
                  onClose();
                }
              }}
              className={`flex w-full items-center gap-3.5 rounded-xl px-4 py-3 text-left text-[0.95rem] font-medium transition-all ${
                active === item.key
                  ? "bg-white/5 text-white"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" strokeWidth={2} />
              {item.label}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}
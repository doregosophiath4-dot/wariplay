"use client";

import { Menu, Search, Bell, Plus, Rocket, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface HeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function Header({ sidebarOpen, setSidebarOpen }: HeaderProps) {
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-white/6 bg-[#14142b] px-3 py-2 shadow-lg sm:px-4"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between gap-2">
        {/* Groupe gauche : Menu + Logo (ou espace) */}
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-1.5 text-slate-300 transition hover:bg-white/5 md:hidden"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </motion.button>

          {/* Logo / marque (optionnel) - visible sur mobile pour garder le branding */}
          <span className="text-sm font-bold text-white/80 sm:hidden">
            WariPlay
          </span>
        </div>

        {/* Barre de recherche - Desktop */}
        <div className="hidden flex-1 items-center rounded-xl border border-white/10 bg-[#0b0b1a] px-3.5 py-2 transition focus-within:border-[#00c896] focus-within:shadow-[0_0_0_3px_rgba(0,200,150,0.15)] md:flex md:max-w-[300px] lg:max-w-[400px]">
          <Search className="h-4 w-4 shrink-0 text-white/50" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="ml-2.5 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
          />
        </div>

        {/* Groupe droit : Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Bouton recherche mobile */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowMobileSearch(!showMobileSearch)}
            className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/5 hover:text-[#00c896] md:hidden"
            aria-label="Rechercher"
          >
            <Search className="h-5 w-5" />
          </motion.button>

          {/* Notifications */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            className="relative rounded-lg p-1.5 text-white/60 transition hover:bg-white/5 hover:text-[#00c896]"
          >
            <Bell className="h-5 w-5" />
            <motion.span
              className="absolute -top-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full bg-[#00c896] text-[0.6rem] font-bold text-white"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              3
            </motion.span>
          </motion.button>

          {/* Profil utilisateur */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="flex cursor-pointer items-center gap-2 rounded-full py-1 pr-2 pl-3 transition hover:bg-white/5"
          >
            <div className="hidden text-right leading-tight sm:block">
              <div className="text-sm font-semibold text-white">Alex Martin</div>
              <div className="text-[0.65rem] text-white/60 sm:text-[0.7rem]">Admin</div>
            </div>
            <motion.div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#00c896] to-[#059669] text-sm font-semibold text-white sm:h-9 sm:w-9"
              whileHover={{ scale: 1.05 }}
            >
              A
            </motion.div>
          </motion.div>

          {/* Boutons d'action - version desktop */}
          <div className="hidden items-center gap-1.5 sm:flex">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[#00c896] to-[#059669] px-3 py-1.5 text-sm font-semibold text-white shadow-[0_4px_10px_rgba(0,200,150,0.25)] transition hover:shadow-[0_6px_16px_rgba(0,200,150,0.35)]"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden lg:inline">Nouveau</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#7c3aed] px-3 py-1.5 text-sm font-semibold text-white shadow-[0_4px_10px_rgba(108,92,231,0.25)] transition hover:shadow-[0_6px_16px_rgba(108,92,231,0.35)]"
            >
              <Rocket className="h-4 w-4" />
              <span className="hidden lg:inline">Pro</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#ea580c] px-3 py-1.5 text-sm font-semibold text-white shadow-[0_4px_10px_rgba(255,107,53,0.25)] transition hover:shadow-[0_6px_16px_rgba(255,107,53,0.35)]"
            >
              <Trash2 className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Barre de recherche mobile - avec animation */}
      <AnimatePresence>
        {showMobileSearch && (
          <motion.div
            className="mt-2 flex items-center rounded-xl border border-white/10 bg-[#0b0b1a] px-3.5 py-2 transition focus-within:border-[#00c896] focus-within:shadow-[0_0_0_3px_rgba(0,200,150,0.15)] md:hidden"
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            transition={{ duration: 0.25 }}
          >
            <Search className="h-4 w-4 shrink-0 text-white/50" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="ml-2.5 w-full bg-transparent text-sm text-white outline-none placeholder:text-white/35"
              autoFocus
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Boutons d'action - version mobile (barre flottante) */}
      <AnimatePresence>
        {!showMobileSearch && (
          <motion.div
            className="mt-2 flex items-center justify-center gap-1.5 sm:hidden"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="flex flex-1 items-center justify-center gap-1 rounded-full bg-gradient-to-br from-[#00c896] to-[#059669] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_4px_10px_rgba(0,200,150,0.25)]"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Nouveau</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              className="flex flex-1 items-center justify-center gap-1 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#7c3aed] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_4px_10px_rgba(108,92,231,0.25)]"
            >
              <Rocket className="h-3.5 w-3.5" />
              <span>Pro</span>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.95 }}
              className="flex flex-1 items-center justify-center gap-1 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#ea580c] px-3 py-1.5 text-xs font-semibold text-white shadow-[0_4px_10px_rgba(255,107,53,0.25)]"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
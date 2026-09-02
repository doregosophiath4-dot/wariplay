"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  FileDown,
  Gamepad2,
  Route,
  CheckCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Pencil,
  Pause,
  Play,
  Trash2,
} from "lucide-react";
import Sidebar, { type AdminPage } from "@/components/admin/side";
import Header from "@/components/admin/header";

interface Produit {
  id: string;
  name: string;
  category: string;
  icon: string;
  price: string;
  players?: string;
  steps?: number;
  status: "active" | "inactive" | "pending";
  createdAt: string;
  description: string;
}

const jeux: Produit[] = [
  {
    id: "#JEU-001",
    name: "Blackjack Pro",
    category: "Cartes",
    icon: "🃏",
    price: "5 000",
    players: "1 284",
    status: "active",
    createdAt: "15 Jan 2025",
    description: "La version premium du Blackjack avec mise progressive.",
  },
  {
    id: "#JEU-002",
    name: "Roulette Royale",
    category: "Casino",
    icon: "🎰",
    price: "3 500",
    players: "956",
    status: "active",
    createdAt: "03 Fév 2025",
    description: "Roulette européenne avec mise jusqu'à 10 000 XOF.",
  },
  {
    id: "#JEU-003",
    name: "Poker Texas Hold'em",
    category: "Cartes",
    icon: "♠️",
    price: "8 000",
    players: "2 341",
    status: "active",
    createdAt: "22 Déc 2024",
    description: "Poker Texas Hold'em avec tournois quotidiens.",
  },
  {
    id: "#JEU-004",
    name: "Mega Slot",
    category: "Slot",
    icon: "🎰",
    price: "2 000",
    players: "3 567",
    status: "active",
    createdAt: "10 Jan 2025",
    description: "Slot avec jackpot progressif et 5 rouleaux.",
  },
  {
    id: "#JEU-005",
    name: "Échecs Royale",
    category: "Réflexion",
    icon: "♟️",
    price: "3 000",
    players: "432",
    status: "inactive",
    createdAt: "05 Mar 2025",
    description: "Échecs en ligne avec classement ELO.",
  },
];

const paths: Produit[] = [
  {
    id: "#PATH-001",
    name: "Débutant Poker",
    category: "Débutant",
    icon: "♠️",
    price: "2 500",
    steps: 5,
    status: "active",
    createdAt: "15 Jan 2025",
    description: "Apprenez les bases du poker en 5 étapes.",
  },
  {
    id: "#PATH-002",
    name: "Maîtrise Blackjack",
    category: "Intermédiaire",
    icon: "🃏",
    price: "4 000",
    steps: 7,
    status: "active",
    createdAt: "03 Fév 2025",
    description: "Devenez expert en Blackjack avec 7 modules.",
  },
  {
    id: "#PATH-003",
    name: "Roulette Expert",
    category: "Expert",
    icon: "🎰",
    price: "6 000",
    steps: 10,
    status: "active",
    createdAt: "22 Déc 2024",
    description: "Stratégies avancées pour maîtriser la roulette.",
  },
  {
    id: "#PATH-004",
    name: "Slot Master",
    category: "Intermédiaire",
    icon: "🎰",
    price: "3 500",
    steps: 6,
    status: "inactive",
    createdAt: "10 Jan 2025",
    description: "Découvrez les secrets des machines à sous.",
  },
  {
    id: "#PATH-005",
    name: "Poker Pro",
    category: "Expert",
    icon: "♠️",
    price: "8 000",
    steps: 12,
    status: "active",
    createdAt: "05 Mar 2025",
    description: "Devenez un pro du poker en 12 leçons.",
  },
];

/* ===== Compteur animé ===== */
function AnimatedNumber({
  value,
  duration = 1.3,
}: {
  value: number;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const startTime = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [value, duration]);

  return <span>{display.toLocaleString("fr-FR")}</span>;
}

/* ===== Variants ===== */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

const tableVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.25 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -18 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.35 + i * 0.055,
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

const modalOverlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 30 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.2 },
  },
};

const modalItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 + i * 0.04, duration: 0.35 },
  }),
};

interface ProduitsPageProps {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
}

export default function ProduitsPage({
  currentPage,
  onNavigate,
}: ProduitsPageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"jeux" | "paths">("jeux");
  const [selectedProduit, setSelectedProduit] = useState<Produit | null>(null);

  const getStatusBadge = (status: Produit["status"]) => {
    const styles = {
      active: "bg-[#00c896]/15 text-emerald-300",
      inactive: "bg-red-400/15 text-red-300",
      pending: "bg-orange-400/15 text-orange-300",
    };
    const labels = {
      active: "Actif",
      inactive: "Inactif",
      pending: "En attente",
    };
    return (
      <span
        className={`inline-block rounded-full px-3 py-0.5 text-xs font-medium ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  const currentList = activeTab === "jeux" ? jeux : paths;

  const stats = [
    {
      icon: Gamepad2,
      value: 24,
      label: "Total jeux",
      color: "text-[#6c5ce7]",
    },
    {
      icon: Route,
      value: 18,
      label: "Total Paths",
      color: "text-[#00c896]",
    },
    {
      icon: CheckCircle,
      value: 19,
      label: "Jeux actifs",
      color: "text-[#00c896]",
    },
    {
      icon: CheckCircle,
      value: 12,
      label: "Paths actifs",
      color: "text-[#ff6b35]",
    },
  ];

  return (
    <div className="flex min-h-screen text-slate-100">
      <Sidebar
        open={sidebarOpen}
        active={currentPage}
        onNavigate={onNavigate}
      />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col md:ml-[260px]">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6 flex flex-wrap items-start justify-between gap-3"
          >
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-[1.6rem]">
                Gestion des produits
              </h1>
              <p className="mt-0.5 text-sm text-white/60 sm:text-[0.95rem]">
                Gérez vos jeux et paths disponibles sur la plateforme
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[#00c896] to-[#059669] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_10px_rgba(0,200,150,0.25)]"
              >
                <Plus className="h-4 w-4" />
                Ajouter
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#7c3aed] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_10px_rgba(108,92,231,0.25)]"
              >
                <FileDown className="h-4 w-4" />
                Exporter
              </motion.button>
            </div>
          </motion.div>

          {/* Stats mini */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-xl border border-white/6 bg-[#14142b] p-4 text-center sm:p-5"
              >
                <stat.icon className={`mx-auto mb-1 h-5 w-5 ${stat.color}`} />
                <div className="text-xl font-bold text-white sm:text-[1.6rem]">
                  <AnimatedNumber value={stat.value} />
                </div>
                <div className="mt-0.5 text-xs text-white/60 sm:text-sm">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="mb-5 flex gap-1 overflow-x-auto rounded-xl border border-white/6 bg-[#14142b] p-1"
          >
            <button
              onClick={() => setActiveTab("jeux")}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium whitespace-nowrap transition ${
                activeTab === "jeux"
                  ? "bg-[#00c896] text-white shadow-[0_4px_12px_rgba(0,200,150,0.25)]"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Gamepad2 className="h-4 w-4" />
              Jeux
            </button>
            <button
              onClick={() => setActiveTab("paths")}
              className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium whitespace-nowrap transition ${
                activeTab === "paths"
                  ? "bg-[#00c896] text-white shadow-[0_4px_12px_rgba(0,200,150,0.25)]"
                  : "text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Route className="h-4 w-4" />
              Paths
            </button>
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.45 }}
            className="mb-5 flex flex-wrap items-center gap-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs font-medium text-white/60">
                Statut :
              </label>
              <select className="cursor-pointer rounded-lg border border-white/10 bg-[#0b0b1a] px-3 py-1.5 text-sm text-white outline-none focus:border-[#00c896]">
                <option>Tous</option>
                <option>Actif</option>
                <option>Inactif</option>
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs font-medium text-white/60">
                {activeTab === "jeux" ? "Catégorie :" : "Niveau :"}
              </label>
              <select className="cursor-pointer rounded-lg border border-white/10 bg-[#0b0b1a] px-3 py-1.5 text-sm text-white outline-none focus:border-[#00c896]">
                {activeTab === "jeux" ? (
                  <>
                    <option>Toutes</option>
                    <option>Cartes</option>
                    <option>Casino</option>
                    <option>Réflexion</option>
                    <option>Slot</option>
                  </>
                ) : (
                  <>
                    <option>Tous</option>
                    <option>Débutant</option>
                    <option>Intermédiaire</option>
                    <option>Expert</option>
                  </>
                )}
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs font-medium text-white/60">Tri :</label>
              <select className="cursor-pointer rounded-lg border border-white/10 bg-[#0b0b1a] px-3 py-1.5 text-sm text-white outline-none focus:border-[#00c896]">
                <option>Nom A-Z</option>
                <option>Nom Z-A</option>
                <option>Popularité ↓</option>
                {activeTab === "jeux" && <option>Date ↓</option>}
              </select>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#7c3aed] px-4 py-1.5 text-xs font-semibold text-white"
            >
              <Filter className="h-3.5 w-3.5" />
              Appliquer
            </motion.button>
          </motion.div>

          {/* Table */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              variants={tableVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, y: 16, transition: { duration: 0.2 } }}
              className="overflow-hidden rounded-2xl border border-white/6 bg-[#14142b]"
            >
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] text-sm">
                  <thead>
                    <tr className="border-b border-white/6 text-left text-xs font-semibold tracking-wide text-white/60 uppercase">
                      <th className="px-3.5 py-3">
                        {activeTab === "jeux" ? "Jeu" : "Path"}
                      </th>
                      <th className="px-3.5 py-3">
                        {activeTab === "jeux" ? "Catégorie" : "Niveau"}
                      </th>
                      <th className="px-3.5 py-3">Prix</th>
                      <th className="px-3.5 py-3">
                        {activeTab === "jeux" ? "Joueurs" : "Étapes"}
                      </th>
                      <th className="px-3.5 py-3">Statut</th>
                      <th className="px-3.5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentList.map((produit, i) => (
                      <motion.tr
                        key={produit.id}
                        custom={i}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        onClick={() => setSelectedProduit(produit)}
                        className="cursor-pointer border-b border-white/6 transition hover:bg-white/5"
                      >
                        <td className="px-3.5 py-3">
                          <div className="flex items-center gap-2.5">
                            <span className="text-xl">{produit.icon}</span>
                            <div>
                              <div className="font-medium text-white">
                                {produit.name}
                              </div>
                              <div className="text-[0.7rem] text-white/50">
                                {produit.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3.5 py-3 text-white">
                          {produit.category}
                        </td>
                        <td className="px-3.5 py-3 text-white">
                          {produit.price} XOF
                        </td>
                        <td className="px-3.5 py-3 text-white">
                          {activeTab === "jeux"
                            ? produit.players
                            : produit.steps}
                        </td>
                        <td className="px-3.5 py-3">
                          {getStatusBadge(produit.status)}
                        </td>
                        <td className="px-3.5 py-3">
                          <div
                            className="flex gap-1"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <button
                              className="rounded-md p-1.5 text-white/50 transition hover:bg-white/5 hover:text-[#00c896]"
                              title="Modifier"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              className="rounded-md p-1.5 text-white/50 transition hover:bg-white/5 hover:text-orange-400"
                              title={
                                produit.status === "active"
                                  ? "Désactiver"
                                  : "Activer"
                              }
                            >
                              {produit.status === "active" ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4 text-[#00c896]" />
                              )}
                            </button>
                            <button
                              className="rounded-md p-1.5 text-white/50 transition hover:bg-white/5 hover:text-red-400"
                              title="Supprimer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/6 px-5 py-4">
                <div className="text-sm text-white/60">
                  Affichage de <strong className="text-white">1</strong> à{" "}
                  <strong className="text-white">5</strong> sur{" "}
                  <strong className="text-white">
                    {activeTab === "jeux" ? "24" : "18"}
                  </strong>{" "}
                  {activeTab === "jeux" ? "jeux" : "paths"}
                </div>
                <div className="flex gap-1">
                  <button
                    disabled
                    className="rounded-lg border border-white/10 bg-[#0b0b1a] px-3 py-1.5 text-sm text-white/40 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button className="rounded-lg border border-[#00c896] bg-[#00c896] px-3 py-1.5 text-sm font-medium text-white">
                    1
                  </button>
                  <button className="rounded-lg border border-white/10 bg-[#0b0b1a] px-3 py-1.5 text-sm text-white/60 transition hover:border-[#00c896] hover:text-white">
                    2
                  </button>
                  <button className="rounded-lg border border-white/10 bg-[#0b0b1a] px-3 py-1.5 text-sm text-white/60 transition hover:border-[#00c896] hover:text-white">
                    3
                  </button>
                  {activeTab === "jeux" && (
                    <>
                      <button className="rounded-lg border border-white/10 bg-[#0b0b1a] px-3 py-1.5 text-sm text-white/60">
                        ...
                      </button>
                      <button className="rounded-lg border border-white/10 bg-[#0b0b1a] px-3 py-1.5 text-sm text-white/60 transition hover:border-[#00c896] hover:text-white">
                        5
                      </button>
                    </>
                  )}
                  {activeTab === "paths" && (
                    <button className="rounded-lg border border-white/10 bg-[#0b0b1a] px-3 py-1.5 text-sm text-white/60 transition hover:border-[#00c896] hover:text-white">
                      4
                    </button>
                  )}
                  <button className="rounded-lg border border-white/10 bg-[#0b0b1a] px-3 py-1.5 text-sm text-white/60 transition hover:border-[#00c896] hover:text-white">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ===== MODAL ===== */}
      <AnimatePresence>
        {selectedProduit && (
          <motion.div
            variants={modalOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-5 backdrop-blur-md"
            onClick={() => setSelectedProduit(null)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="max-h-[90vh] w-full max-w-[600px] overflow-y-auto rounded-2xl border border-white/6 bg-[#14142b] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-white/6 bg-[#14142b] px-6 py-5">
                <h2 className="text-lg font-bold text-white">
                  Détails - {selectedProduit.id}
                </h2>
                <button
                  onClick={() => setSelectedProduit(null)}
                  className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/5 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <motion.div
                    custom={0}
                    variants={modalItemVariants}
                    initial="hidden"
                    animate="visible"
                    className="col-span-full rounded-xl border border-white/6 bg-[#0b0b1a] p-4"
                  >
                    <div className="mb-2 text-xs font-semibold tracking-wide text-white/60 uppercase">
                      Informations générales
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                      <span>
                        <strong className="text-white/60">ID :</strong>{" "}
                        <span className="font-mono text-white">
                          {selectedProduit.id}
                        </span>
                      </span>
                      <span>
                        <strong className="text-white/60">Nom :</strong>{" "}
                        <span className="text-white">
                          {selectedProduit.name}
                        </span>
                      </span>
                      <span>
                        <strong className="text-white/60">Catégorie :</strong>{" "}
                        <span className="text-white">
                          {selectedProduit.category}
                        </span>
                      </span>
                      <span>
                        <strong className="text-white/60">Statut :</strong>{" "}
                        {getStatusBadge(selectedProduit.status)}
                      </span>
                    </div>
                  </motion.div>

                  <motion.div
                    custom={1}
                    variants={modalItemVariants}
                    initial="hidden"
                    animate="visible"
                    className="rounded-xl border border-white/6 bg-[#0b0b1a] p-4"
                  >
                    <div className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                      Prix
                    </div>
                    <div className="mt-0.5 text-lg font-bold text-white">
                      {selectedProduit.price} XOF
                    </div>
                  </motion.div>

                  <motion.div
                    custom={2}
                    variants={modalItemVariants}
                    initial="hidden"
                    animate="visible"
                    className="rounded-xl border border-white/6 bg-[#0b0b1a] p-4"
                  >
                    <div className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                      Date création
                    </div>
                    <div className="mt-0.5 text-lg font-bold text-white">
                      {selectedProduit.createdAt}
                    </div>
                  </motion.div>

                  <motion.div
                    custom={3}
                    variants={modalItemVariants}
                    initial="hidden"
                    animate="visible"
                    className="col-span-full rounded-xl border border-white/6 bg-[#0b0b1a] p-4"
                  >
                    <div className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                      Description
                    </div>
                    <div className="mt-1 text-sm font-normal text-white/60">
                      {selectedProduit.description}
                    </div>
                  </motion.div>

                  <motion.div
                    custom={4}
                    variants={modalItemVariants}
                    initial="hidden"
                    animate="visible"
                    className="col-span-full mt-1 text-xs font-semibold tracking-wide text-white/60 uppercase"
                  >
                    Statistiques
                  </motion.div>

                  <motion.div
                    custom={5}
                    variants={modalItemVariants}
                    initial="hidden"
                    animate="visible"
                    className="rounded-xl border border-white/6 bg-[#0b0b1a] p-4"
                  >
                    <div className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                      Nombre de joueurs
                    </div>
                    <div className="mt-0.5 text-lg font-bold text-white">
                      {selectedProduit.players || "--"}
                    </div>
                  </motion.div>

                  <motion.div
                    custom={6}
                    variants={modalItemVariants}
                    initial="hidden"
                    animate="visible"
                    className="rounded-xl border border-white/6 bg-[#0b0b1a] p-4"
                  >
                    <div className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                      Nombre d&apos;étapes
                    </div>
                    <div className="mt-0.5 text-lg font-bold text-white">
                      {selectedProduit.steps ?? "--"}
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
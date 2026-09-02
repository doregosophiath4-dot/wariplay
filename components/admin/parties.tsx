"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  FileDown,
  Dice5,
  Calendar,
  Trophy,
  XCircle,
  ArrowUp,
  ArrowDown,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import Sidebar, { type AdminPage } from "@/components/admin/side";
import Header from "@/components/admin/header";

interface PartieDetails {
  mise?: number;
  gainNet?: number;
  duree?: string;
  main?: string;
  carte?: string[];
  croupier?: string;
  numero?: number;
  couleur?: string;
  carteHaute?: string;
  raison?: string;
}

interface Partie {
  id: string;
  user: string;
  userEmail: string;
  game: string;
  gameIcon: string;
  montant: string;
  gain: string;
  date: string;
  status: "win" | "lose" | "pending" | "cancelled";
  details: PartieDetails;
}

const parties: Partie[] = [
  {
    id: "#PART-7841",
    user: "Sophie Dubois",
    userEmail: "sophie.dubois@email.com",
    game: "Blackjack",
    gameIcon: "🃏",
    montant: "248 000",
    gain: "496 000",
    date: "30 Août 2025 14:32",
    status: "win",
    details: {
      mise: 248000,
      gainNet: 248000,
      carte: ["As ♠", "Roi ♥"],
      croupier: "10 ♦",
      duree: "3 min",
    },
  },
  {
    id: "#PART-7840",
    user: "Thomas Leroy",
    userEmail: "thomas.leroy@email.com",
    game: "Roulette",
    gameIcon: "🎰",
    montant: "89 900",
    gain: "0",
    date: "29 Août 2025 18:15",
    status: "lose",
    details: {
      mise: 89900,
      gainNet: -89900,
      numero: 17,
      couleur: "Noir",
      duree: "2 min",
    },
  },
  {
    id: "#PART-7839",
    user: "Marie Bernard",
    userEmail: "marie.bernard@email.com",
    game: "Poker",
    gameIcon: "♠️",
    montant: "412 500",
    gain: "825 000",
    date: "29 Août 2025 21:00",
    status: "win",
    details: {
      mise: 412500,
      gainNet: 412500,
      main: "Full House",
      carteHaute: "As",
      duree: "8 min",
    },
  },
  {
    id: "#PART-7838",
    user: "Lucas Petit",
    userEmail: "lucas.petit@email.com",
    game: "Blackjack",
    gameIcon: "🃏",
    montant: "67 000",
    gain: "0",
    date: "28 Août 2025 11:30",
    status: "lose",
    details: {
      mise: 67000,
      gainNet: -67000,
      carte: ["7 ♠", "9 ♥"],
      croupier: "Roi ♣",
      duree: "4 min",
    },
  },
  {
    id: "#PART-7837",
    user: "Emma Roux",
    userEmail: "emma.roux@email.com",
    game: "Roulette",
    gameIcon: "🎰",
    montant: "156 800",
    gain: "313 600",
    date: "28 Août 2025 16:45",
    status: "win",
    details: {
      mise: 156800,
      gainNet: 156800,
      numero: 7,
      couleur: "Rouge",
      duree: "3 min",
    },
  },
  {
    id: "#PART-7836",
    user: "Nicolas Moreau",
    userEmail: "nicolas.moreau@email.com",
    game: "Poker",
    gameIcon: "♠️",
    montant: "324 000",
    gain: "0",
    date: "27 Août 2025 19:20",
    status: "pending",
    details: {
      mise: 324000,
      gainNet: 0,
      main: "En cours",
      duree: "--",
    },
  },
  {
    id: "#PART-7835",
    user: "Camille Lefèvre",
    userEmail: "camille.lefevre@email.com",
    game: "Slot",
    gameIcon: "🎰",
    montant: "45 000",
    gain: "0",
    date: "27 Août 2025 09:10",
    status: "cancelled",
    details: {
      mise: 45000,
      gainNet: 0,
      raison: "Annulation par l'utilisateur",
      duree: "1 min",
    },
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
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
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
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.3 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -18 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.4 + i * 0.055,
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

interface PartiesPageProps {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
}

export default function PartiesPage({
  currentPage,
  onNavigate,
}: PartiesPageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedPartie, setSelectedPartie] = useState<Partie | null>(null);

  const getStatusBadge = (status: Partie["status"]) => {
    const styles = {
      win: "bg-[#00c896]/15 text-emerald-300",
      lose: "bg-red-400/15 text-red-300",
      pending: "bg-orange-400/15 text-orange-300",
      cancelled: "bg-slate-400/15 text-slate-400",
    };
    const labels = {
      win: "Gagné",
      lose: "Perdu",
      pending: "En attente",
      cancelled: "Annulé",
    };
    return (
      <span
        className={`inline-block rounded-full px-3 py-0.5 text-xs font-medium ${styles[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  const stats = [
    {
      icon: Dice5,
      value: 18724,
      label: "Total parties",
      color: "text-[#6c5ce7]",
    },
    {
      icon: Calendar,
      value: 392,
      label: "Parties aujourd'hui",
      color: "text-[#00c896]",
    },
    {
      icon: Trophy,
      value: 6553,
      label: "Parties gagnées",
      color: "text-[#00c896]",
    },
    {
      icon: XCircle,
      value: 5242,
      label: "Parties perdues",
      color: "text-red-400",
    },
    {
      icon: ArrowUp,
      value: 248,
      label: "Gagnées aujourd'hui",
      color: "text-[#00c896]",
    },
    {
      icon: ArrowDown,
      value: 144,
      label: "Perdues aujourd'hui",
      color: "text-red-400",
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
                Gestion des parties
              </h1>
              <p className="mt-0.5 text-sm text-white/60 sm:text-[0.95rem]">
                Consultez l&apos;historique complet des parties jouées
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[#00c896] to-[#059669] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_10px_rgba(0,200,150,0.25)]"
              >
                <Plus className="h-4 w-4" />
                Nouvelle partie
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
            className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6"
          >
            {stats.map((stat) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-xl border border-white/6 bg-[#14142b] p-3.5 text-center sm:p-4"
              >
                <stat.icon className={`mx-auto mb-1 h-5 w-5 ${stat.color}`} />
                <div className="text-lg font-bold text-white sm:text-xl">
                  <AnimatedNumber value={stat.value} />
                </div>
                <div className="mt-0.5 text-[0.7rem] text-white/60">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Filters */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.45 }}
            className="mb-5 flex flex-wrap items-center gap-3"
          >
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs font-medium text-white/60">
                Statut :
              </label>
              <select className="cursor-pointer rounded-lg border border-white/10 bg-[#0b0b1a] px-3 py-1.5 text-sm text-white outline-none focus:border-[#00c896]">
                <option>Tous</option>
                <option>Gagné</option>
                <option>Perdu</option>
                <option>En attente</option>
                <option>Annulé</option>
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs font-medium text-white/60">Jeu :</label>
              <select className="cursor-pointer rounded-lg border border-white/10 bg-[#0b0b1a] px-3 py-1.5 text-sm text-white outline-none focus:border-[#00c896]">
                <option>Tous</option>
                <option>Blackjack</option>
                <option>Roulette</option>
                <option>Poker</option>
                <option>Slot</option>
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs font-medium text-white/60">Tri :</label>
              <select className="cursor-pointer rounded-lg border border-white/10 bg-[#0b0b1a] px-3 py-1.5 text-sm text-white outline-none focus:border-[#00c896]">
                <option>Date ↓</option>
                <option>Date ↑</option>
                <option>Montant ↓</option>
                <option>Montant ↑</option>
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
          <motion.div
            variants={tableVariants}
            initial="hidden"
            animate="visible"
            className="overflow-hidden rounded-2xl border border-white/6 bg-[#14142b]"
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm">
                <thead>
                  <tr className="border-b border-white/6 text-left text-xs font-semibold tracking-wide text-white/60 uppercase">
                    <th className="px-3.5 py-3">ID</th>
                    <th className="px-3.5 py-3">Utilisateur</th>
                    <th className="px-3.5 py-3">Jeu</th>
                    <th className="px-3.5 py-3">Montant</th>
                    <th className="px-3.5 py-3">Gain</th>
                    <th className="px-3.5 py-3">Date</th>
                    <th className="px-3.5 py-3">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {parties.map((partie, i) => (
                    <motion.tr
                      key={partie.id}
                      custom={i}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      onClick={() => setSelectedPartie(partie)}
                      className="cursor-pointer border-b border-white/6 transition hover:bg-white/5"
                    >
                      <td className="px-3.5 py-3 font-mono text-xs text-white">
                        {partie.id}
                      </td>
                      <td className="px-3.5 py-3 text-white">{partie.user}</td>
                      <td className="px-3.5 py-3 text-white">
                        <span className="mr-1.5">{partie.gameIcon}</span>
                        {partie.game}
                      </td>
                      <td className="px-3.5 py-3 text-white">
                        {partie.montant} XOF
                      </td>
                      <td
                        className={`px-3.5 py-3 font-medium ${
                          partie.status === "win"
                            ? "text-[#00c896]"
                            : partie.status === "lose"
                            ? "text-red-400"
                            : partie.status === "pending"
                            ? "text-orange-400"
                            : "text-white/50"
                        }`}
                      >
                        {partie.status === "win"
                          ? `+${partie.gain} XOF`
                          : partie.status === "lose"
                          ? `-${partie.montant} XOF`
                          : partie.status === "pending"
                          ? "En attente"
                          : "Annulé"}
                      </td>
                      <td className="px-3.5 py-3 text-white">
                        {partie.date.split(" ").slice(0, 3).join(" ")}
                      </td>
                      <td className="px-3.5 py-3">
                        {getStatusBadge(partie.status)}
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
                <strong className="text-white">7</strong> sur{" "}
                <strong className="text-white">18 724</strong> parties
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
                <button className="rounded-lg border border-white/10 bg-[#0b0b1a] px-3 py-1.5 text-sm text-white/60">
                  ...
                </button>
                <button className="rounded-lg border border-white/10 bg-[#0b0b1a] px-3 py-1.5 text-sm text-white/60 transition hover:border-[#00c896] hover:text-white">
                  12
                </button>
                <button className="rounded-lg border border-white/10 bg-[#0b0b1a] px-3 py-1.5 text-sm text-white/60 transition hover:border-[#00c896] hover:text-white">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ===== MODAL ===== */}
      <AnimatePresence>
        {selectedPartie && (
          <motion.div
            variants={modalOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-5 backdrop-blur-md"
            onClick={() => setSelectedPartie(null)}
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
                  Détails - {selectedPartie.id}
                </h2>
                <button
                  onClick={() => setSelectedPartie(null)}
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
                          {selectedPartie.id}
                        </span>
                      </span>
                      <span>
                        <strong className="text-white/60">Utilisateur :</strong>{" "}
                        <span className="text-white">
                          {selectedPartie.user}
                        </span>
                      </span>
                      <span>
                        <strong className="text-white/60">Email :</strong>{" "}
                        <span className="text-white/60">
                          {selectedPartie.userEmail}
                        </span>
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
                      Jeu
                    </div>
                    <div className="mt-0.5 text-lg font-bold text-white">
                      {selectedPartie.gameIcon} {selectedPartie.game}
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
                      Date
                    </div>
                    <div className="mt-0.5 text-lg font-bold text-white">
                      {selectedPartie.date}
                    </div>
                  </motion.div>

                  <motion.div
                    custom={3}
                    variants={modalItemVariants}
                    initial="hidden"
                    animate="visible"
                    className="rounded-xl border border-white/6 bg-[#0b0b1a] p-4"
                  >
                    <div className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                      Mise
                    </div>
                    <div className="mt-0.5 text-lg font-bold text-white">
                      {selectedPartie.montant} XOF
                    </div>
                  </motion.div>

                  <motion.div
                    custom={4}
                    variants={modalItemVariants}
                    initial="hidden"
                    animate="visible"
                    className="rounded-xl border border-white/6 bg-[#0b0b1a] p-4"
                  >
                    <div className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                      Gain net
                    </div>
                    <div
                      className={`mt-0.5 text-lg font-bold ${
                        selectedPartie.status === "win"
                          ? "text-[#00c896]"
                          : selectedPartie.status === "lose"
                          ? "text-red-400"
                          : selectedPartie.status === "pending"
                          ? "text-orange-400"
                          : "text-white/50"
                      }`}
                    >
                      {selectedPartie.status === "win"
                        ? `+${selectedPartie.gain} XOF`
                        : selectedPartie.status === "lose"
                        ? `-${selectedPartie.montant} XOF`
                        : selectedPartie.status === "pending"
                        ? "En attente"
                        : "Annulé"}
                    </div>
                  </motion.div>

                  <motion.div
                    custom={5}
                    variants={modalItemVariants}
                    initial="hidden"
                    animate="visible"
                    className="col-span-full rounded-xl border border-white/6 bg-[#0b0b1a] p-4"
                  >
                    <div className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                      Statut
                    </div>
                    <div className="mt-1">
                      {getStatusBadge(selectedPartie.status)}
                    </div>
                  </motion.div>

                  <motion.div
                    custom={6}
                    variants={modalItemVariants}
                    initial="hidden"
                    animate="visible"
                    className="col-span-full mt-1 text-xs font-semibold tracking-wide text-white/60 uppercase"
                  >
                    Détails de la partie
                  </motion.div>

                  <div className="col-span-full grid grid-cols-2 gap-2">
                    {Object.entries({
                      Mise: selectedPartie.details.mise
                        ? `${selectedPartie.details.mise.toLocaleString()} XOF`
                        : null,
                      "Gain net":
                        selectedPartie.details.gainNet !== undefined
                          ? `${selectedPartie.details.gainNet.toLocaleString()} XOF`
                          : null,
                      Durée: selectedPartie.details.duree,
                      Main: selectedPartie.details.main,
                      Carte: selectedPartie.details.carte?.join(", "),
                      Croupier: selectedPartie.details.croupier,
                      Numéro: selectedPartie.details.numero,
                      Couleur: selectedPartie.details.couleur,
                      "Carte haute": selectedPartie.details.carteHaute,
                      Raison: selectedPartie.details.raison,
                    })
                      .filter(([, value]) => value && value !== "N/A")
                      .map(([key, value], i) => (
                        <motion.div
                          key={key}
                          custom={7 + i}
                          variants={modalItemVariants}
                          initial="hidden"
                          animate="visible"
                          className="rounded-lg border border-white/6 bg-[#0b0b1a] px-3 py-2"
                        >
                          <div className="text-[0.65rem] tracking-wide text-white/50 uppercase">
                            {key}
                          </div>
                          <div className="text-sm font-medium text-white">
                            {value}
                          </div>
                        </motion.div>
                      ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
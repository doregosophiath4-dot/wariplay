"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  FileDown,
  Users,
  Calendar,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import Sidebar, { type AdminPage } from "@/components/admin/side";
import Header from "@/components/admin/header";

interface UserData {
  id: string;
  name: string;
  email: string;
  wariId: string;
  date: string;
  solde: string;
  avatar: string;
  color: string;
  nbMises: number;
  nbRetraits: number;
  nbDepots: number;
  nbGains: number;
  nbPertes: number;
  montantMises: string;
  montantPertes: string;
  montantGains: string;
  montantDepots: string;
  montantRetraits: string;
  nbJeuxAchetes: number;
  nbJeuxActifs: number;
  nbPathAchetes: number;
  nbPathActifs: number;
  createdAt: string;
}

const users: UserData[] = [
  {
    id: "#USR-7841",
    name: "Sophie Dubois",
    email: "sophie.dubois@email.com",
    wariId: "WARI-8872",
    date: "15 Jan 2025",
    solde: "245 800",
    avatar: "SD",
    color: "#00c896",
    nbMises: 342,
    nbRetraits: 28,
    nbDepots: 45,
    nbGains: 189,
    nbPertes: 153,
    montantMises: "1 245 800",
    montantPertes: "892 400",
    montantGains: "2 890 450",
    montantDepots: "4 560 200",
    montantRetraits: "3 210 550",
    nbJeuxAchetes: 12,
    nbJeuxActifs: 5,
    nbPathAchetes: 8,
    nbPathActifs: 3,
    createdAt: "15 Jan 2025 14:32",
  },
  {
    id: "#USR-7840",
    name: "Thomas Leroy",
    email: "thomas.leroy@email.com",
    wariId: "WARI-5543",
    date: "03 Fév 2025",
    solde: "12 450",
    avatar: "TL",
    color: "#6c5ce7",
    nbMises: 89,
    nbRetraits: 6,
    nbDepots: 12,
    nbGains: 34,
    nbPertes: 55,
    montantMises: "412 000",
    montantPertes: "298 500",
    montantGains: "113 500",
    montantDepots: "180 000",
    montantRetraits: "95 000",
    nbJeuxAchetes: 4,
    nbJeuxActifs: 2,
    nbPathAchetes: 2,
    nbPathActifs: 1,
    createdAt: "03 Fév 2025 09:15",
  },
  {
    id: "#USR-7839",
    name: "Marie Bernard",
    email: "marie.bernard@email.com",
    wariId: "WARI-3317",
    date: "22 Déc 2024",
    solde: "1 250 000",
    avatar: "MB",
    color: "#ff6b35",
    nbMises: 567,
    nbRetraits: 42,
    nbDepots: 78,
    nbGains: 312,
    nbPertes: 255,
    montantMises: "4 200 000",
    montantPertes: "2 950 000",
    montantGains: "6 150 000",
    montantDepots: "8 400 000",
    montantRetraits: "5 200 000",
    nbJeuxAchetes: 18,
    nbJeuxActifs: 9,
    nbPathAchetes: 15,
    nbPathActifs: 7,
    createdAt: "22 Déc 2024 11:45",
  },
  {
    id: "#USR-7838",
    name: "Lucas Petit",
    email: "lucas.petit@email.com",
    wariId: "WARI-2291",
    date: "10 Jan 2025",
    solde: "3 200",
    avatar: "LP",
    color: "#3b82f6",
    nbMises: 23,
    nbRetraits: 1,
    nbDepots: 3,
    nbGains: 7,
    nbPertes: 16,
    montantMises: "67 000",
    montantPertes: "51 000",
    montantGains: "16 000",
    montantDepots: "25 000",
    montantRetraits: "8 000",
    nbJeuxAchetes: 1,
    nbJeuxActifs: 0,
    nbPathAchetes: 0,
    nbPathActifs: 0,
    createdAt: "10 Jan 2025 16:20",
  },
  {
    id: "#USR-7837",
    name: "Emma Roux",
    email: "emma.roux@email.com",
    wariId: "WARI-7765",
    date: "05 Mar 2025",
    solde: "678 900",
    avatar: "ER",
    color: "#ec4899",
    nbMises: 234,
    nbRetraits: 18,
    nbDepots: 34,
    nbGains: 98,
    nbPertes: 136,
    montantMises: "2 890 000",
    montantPertes: "1 890 000",
    montantGains: "3 450 000",
    montantDepots: "4 200 000",
    montantRetraits: "2 800 000",
    nbJeuxAchetes: 9,
    nbJeuxActifs: 6,
    nbPathAchetes: 7,
    nbPathActifs: 4,
    createdAt: "05 Mar 2025 08:55",
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
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.3 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -18 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.4 + i * 0.06,
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
    transition: { delay: 0.1 + i * 0.04, duration: 0.35 },
  }),
};

interface UsersPageProps {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
}

export default function UsersPage({ currentPage, onNavigate }: UsersPageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  const getSoldeClass = (solde: string) => {
    const value = parseInt(solde.replace(/\s/g, ""), 10);
    if (value < 10000) return "bg-red-400/15 text-red-300";
    if (value < 100000) return "bg-orange-400/15 text-orange-300";
    return "bg-[#00c896]/15 text-emerald-300";
  };

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
                Gestion des utilisateurs
              </h1>
              <p className="mt-0.5 text-sm text-white/60 sm:text-[0.95rem]">
                Cliquez sur un utilisateur pour voir ses statistiques détaillées
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[#00c896] to-[#059669] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_10px_rgba(0,200,150,0.25)]"
              >
                <UserPlus className="h-4 w-4" />
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
            className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            {[
              {
                icon: Users,
                value: 3421,
                prefix: "",
                label: "Total utilisateurs",
                color: "text-[#6c5ce7]",
              },
              {
                icon: UserPlus,
                value: 48,
                prefix: "+",
                label: "Nouveaux aujourd'hui",
                color: "text-[#00c896]",
              },
              {
                icon: Calendar,
                value: 384,
                prefix: "+",
                label: "Nouveaux (30 derniers jours)",
                color: "text-[#ff6b35]",
              },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="rounded-xl border border-white/6 bg-[#14142b] p-4 text-center sm:p-5"
              >
                <stat.icon className={`mx-auto mb-1.5 h-6 w-6 ${stat.color}`} />
                <div className="text-2xl font-bold text-white sm:text-[1.8rem]">
                  {stat.prefix}
                  <AnimatedNumber value={stat.value} />
                </div>
                <div className="mt-1 text-sm text-white/60">{stat.label}</div>
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
              <label className="text-xs font-medium text-white/60">Statut :</label>
              <select className="cursor-pointer rounded-lg border border-white/10 bg-[#0b0b1a] px-3 py-1.5 text-sm text-white outline-none focus:border-[#00c896]">
                <option>Tous</option>
                <option>Actif</option>
                <option>Inactif</option>
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs font-medium text-white/60">Solde :</label>
              <select className="cursor-pointer rounded-lg border border-white/10 bg-[#0b0b1a] px-3 py-1.5 text-sm text-white outline-none focus:border-[#00c896]">
                <option>Tous</option>
                <option>Élevé (&gt; 100 000)</option>
                <option>Moyen (10k - 100k)</option>
                <option>Faible (&lt; 10 000)</option>
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs font-medium text-white/60">Tri :</label>
              <select className="cursor-pointer rounded-lg border border-white/10 bg-[#0b0b1a] px-3 py-1.5 text-sm text-white outline-none focus:border-[#00c896]">
                <option>Date d&apos;inscription ↓</option>
                <option>Date d&apos;inscription ↑</option>
                <option>Nom A-Z</option>
                <option>Nom Z-A</option>
                <option>Solde ↓</option>
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
              <table className="w-full min-w-[700px] text-sm">
                <thead>
                  <tr className="border-b border-white/6 text-left text-xs font-semibold tracking-wide text-white/60 uppercase">
                    <th className="px-3.5 py-3">Utilisateur</th>
                    <th className="px-3.5 py-3">Email</th>
                    <th className="px-3.5 py-3">Wari ID</th>
                    <th className="px-3.5 py-3">Date d&apos;inscription</th>
                    <th className="px-3.5 py-3">Solde</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => (
                    <motion.tr
                      key={user.id}
                      custom={i}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      onClick={() => setSelectedUser(user)}
                      className="cursor-pointer border-b border-white/6 transition hover:bg-white/5"
                    >
                      <td className="px-3.5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white"
                            style={{
                              background: `linear-gradient(135deg, ${user.color}, ${user.color}cc)`,
                            }}
                          >
                            {user.avatar}
                          </div>
                          <span className="font-medium text-white">
                            {user.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-3.5 py-3 text-white/60">{user.email}</td>
                      <td className="px-3.5 py-3 font-mono text-sm text-white">
                        {user.wariId}
                      </td>
                      <td className="px-3.5 py-3 text-white">{user.date}</td>
                      <td className="px-3.5 py-3">
                        <span
                          className={`inline-block rounded-full px-3 py-0.5 text-xs font-semibold ${getSoldeClass(
                            user.solde
                          )}`}
                        >
                          {user.solde} XOF
                        </span>
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
                <strong className="text-white">3 421</strong> utilisateurs
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
        {selectedUser && (
          <motion.div
            variants={modalOverlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-5 backdrop-blur-md"
            onClick={() => setSelectedUser(null)}
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="max-h-[90vh] w-full max-w-[800px] overflow-y-auto rounded-2xl border border-white/6 bg-[#14142b] shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-white/6 bg-[#14142b] px-6 py-5">
                <h2 className="flex items-center gap-3 text-xl font-bold text-white">
                  <span
                    className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-white"
                    style={{
                      background: `linear-gradient(135deg, ${selectedUser.color}, ${selectedUser.color}cc)`,
                    }}
                  >
                    {selectedUser.avatar}
                  </span>
                  {selectedUser.name}
                </h2>
                <button
                  onClick={() => setSelectedUser(null)}
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
                    <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
                      <span>
                        <strong className="text-white/60">ID :</strong>{" "}
                        <span className="text-white">{selectedUser.id}</span>
                      </span>
                      <span>
                        <strong className="text-white/60">Wari ID :</strong>{" "}
                        <span className="font-mono text-white">
                          {selectedUser.wariId}
                        </span>
                      </span>
                      <span>
                        <strong className="text-white/60">Email :</strong>{" "}
                        <span className="text-white">{selectedUser.email}</span>
                      </span>
                      <span>
                        <strong className="text-white/60">Date création :</strong>{" "}
                        <span className="text-white">
                          {selectedUser.createdAt}
                        </span>
                      </span>
                      <span>
                        <strong className="text-white/60">Solde :</strong>{" "}
                        <span className="font-bold text-[#00c896]">
                          {selectedUser.solde} XOF
                        </span>
                      </span>
                    </div>
                  </motion.div>

                  {[
                    { label: "Nombre de mises", value: selectedUser.nbMises },
                    {
                      label: "Nombre de retraits",
                      value: selectedUser.nbRetraits,
                    },
                    { label: "Nombre de dépôts", value: selectedUser.nbDepots },
                    {
                      label: "Nombre de gains",
                      value: selectedUser.nbGains,
                      color: "text-[#00c896]",
                    },
                    {
                      label: "Nombre de pertes",
                      value: selectedUser.nbPertes,
                      color: "text-red-400",
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      custom={i + 1}
                      variants={modalItemVariants}
                      initial="hidden"
                      animate="visible"
                      className="rounded-xl border border-white/6 bg-[#0b0b1a] p-4"
                    >
                      <div className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                        {item.label}
                      </div>
                      <div
                        className={`mt-0.5 text-lg font-bold ${
                          item.color || "text-white"
                        }`}
                      >
                        <AnimatedNumber value={item.value} duration={0.9} />
                      </div>
                    </motion.div>
                  ))}

                  <motion.div
                    custom={6}
                    variants={modalItemVariants}
                    initial="hidden"
                    animate="visible"
                    className="col-span-full mt-2 text-xs font-semibold tracking-wide text-white/60 uppercase"
                  >
                    Montants Totaux
                  </motion.div>

                  {[
                    {
                      label: "Montant total (mise)",
                      value: selectedUser.montantMises,
                    },
                    {
                      label: "Montant total (perte)",
                      value: selectedUser.montantPertes,
                      color: "text-red-400",
                    },
                    {
                      label: "Montant total (gains)",
                      value: selectedUser.montantGains,
                      color: "text-[#00c896]",
                    },
                    {
                      label: "Montant total (dépôt)",
                      value: selectedUser.montantDepots,
                      color: "text-[#6c5ce7]",
                    },
                    {
                      label: "Montant total (retrait)",
                      value: selectedUser.montantRetraits,
                      color: "text-[#ff6b35]",
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      custom={i + 7}
                      variants={modalItemVariants}
                      initial="hidden"
                      animate="visible"
                      className="rounded-xl border border-white/6 bg-[#0b0b1a] p-4"
                    >
                      <div className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                        {item.label}
                      </div>
                      <div
                        className={`mt-0.5 text-lg font-bold ${
                          item.color || "text-white"
                        }`}
                      >
                        {item.value} XOF
                      </div>
                    </motion.div>
                  ))}

                  <motion.div
                    custom={12}
                    variants={modalItemVariants}
                    initial="hidden"
                    animate="visible"
                    className="col-span-full mt-2 text-xs font-semibold tracking-wide text-white/60 uppercase"
                  >
                    Jeux & Paths
                  </motion.div>

                  {[
                    {
                      label: "Nombre de jeux achetés",
                      value: selectedUser.nbJeuxAchetes,
                    },
                    {
                      label: "Nombre de jeux actifs",
                      value: selectedUser.nbJeuxActifs,
                      color: "text-[#00c896]",
                    },
                    {
                      label: "Nombre de Paths achetés",
                      value: selectedUser.nbPathAchetes,
                    },
                    {
                      label: "Nombre de Paths actifs",
                      value: selectedUser.nbPathActifs,
                      color: "text-[#00c896]",
                    },
                  ].map((item, i) => (
                    <motion.div
                      key={item.label}
                      custom={i + 13}
                      variants={modalItemVariants}
                      initial="hidden"
                      animate="visible"
                      className="rounded-xl border border-white/6 bg-[#0b0b1a] p-4"
                    >
                      <div className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                        {item.label}
                      </div>
                      <div
                        className={`mt-0.5 text-lg font-bold ${
                          item.color || "text-white"
                        }`}
                      >
                        <AnimatedNumber value={item.value} duration={0.9} />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import Chart from "chart.js/auto";
import {
  ArrowDown,
  ArrowUp,
  Coins,
  CreditCard,
  Dice5,
  Users,
} from "lucide-react";
import Sidebar, { type AdminPage } from "@/components/admin/side";
import Header from "@/components/admin/header";

interface DashboardProps {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
}

/* ===== Compteur animé ===== */
function AnimatedNumber({
  value,
  suffix = "",
  duration = 1.4,
}: {
  value: number;
  suffix?: string;
  duration?: number;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let startTime = performance.now();

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / (duration * 1000), 1);
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.floor(eased * value));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }, [value, duration]);

  return (
    <span>
      {display.toLocaleString("fr-FR")}
      {suffix}
    </span>
  );
}

/* ===== Variants Framer Motion ===== */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 28, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const chartVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.35 },
  },
};

const tableVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.5 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, x: -16 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.6 + i * 0.06,
      duration: 0.4,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

export default function Dashboard({ currentPage, onNavigate }: DashboardProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const salesChartRef = useRef<HTMLCanvasElement>(null);
  const trafficChartRef = useRef<HTMLCanvasElement>(null);

  // ===== Charts =====
  useEffect(() => {
    let salesChart: Chart | null = null;
    let trafficChart: Chart | null = null;

    // Délai pour laisser Framer Motion démarrer l'entrée des cards
    const timer = setTimeout(() => {
      if (salesChartRef.current) {
        salesChart = new Chart(salesChartRef.current, {
          type: "bar",
          data: {
            labels: ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août"],
            datasets: [
              {
                label: "Mises (XOF)",
                data: [4200, 5100, 4800, 6200, 7100, 6800, 8500, 9200],
                backgroundColor: "rgba(0, 200, 150, 0.7)",
                borderRadius: 8,
                borderSkipped: false,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              duration: 1800,
              easing: "easeOutQuart",
              delay: (ctx) => {
                // chaque barre apparaît en cascade
                if (ctx.type === "data" && ctx.mode === "default") {
                  return ctx.dataIndex * 90;
                }
                return 0;
              },
            },
            plugins: { legend: { display: false } },
            scales: {
              y: {
                beginAtZero: true,
                grid: { color: "rgba(255,255,255,0.06)" },
                ticks: { color: "#94a3b8", font: { size: 10 } },
              },
              x: {
                grid: { display: false },
                ticks: { color: "#94a3b8", font: { size: 10 } },
              },
            },
          },
        });
      }

      if (trafficChartRef.current) {
        trafficChart = new Chart(trafficChartRef.current, {
          type: "doughnut",
          data: {
            labels: [
              "Paris gagnants",
              "Paris perdants",
              "En attente",
              "Annulés",
            ],
            datasets: [
              {
                data: [35, 28, 18, 12],
                backgroundColor: [
                  "#00c896",
                  "#ff6b35",
                  "#6c5ce7",
                  "#64748b",
                ],
                borderWidth: 0,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
              animateRotate: true,
              animateScale: true,
              duration: 1800,
              easing: "easeOutQuart",
            },
            plugins: {
              legend: {
                position: "bottom",
                labels: {
                  color: "#94a3b8",
                  padding: 12,
                  font: { size: 11 },
                },
              },
            },
          },
        });
      }
    }, 450);

    return () => {
      clearTimeout(timer);
      salesChart?.destroy();
      trafficChart?.destroy();
    };
  }, []);

  // Fermer la sidebar en cliquant dehors (mobile)
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (window.innerWidth <= 768 && sidebarOpen) {
        const sidebar = document.getElementById("sidebar");
        const toggle = document.getElementById("menuToggle");
        if (
          sidebar &&
          !sidebar.contains(e.target as Node) &&
          toggle &&
          !toggle.contains(e.target as Node)
        ) {
          setSidebarOpen(false);
        }
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [sidebarOpen]);

  const kpis = [
    {
      value: 1245800,
      suffix: " XOF",
      label: "Perte Totale (Mise)",
      change: "-325 000 XOF",
      changeUp: false,
      icon: ArrowDown,
      iconBg: "from-red-500 to-red-600",
      changeColor: "text-red-400",
    },
    {
      value: 2890450,
      suffix: " XOF",
      label: "Gains Totaux (Mise)",
      change: "+312 000 XOF",
      changeUp: true,
      icon: ArrowUp,
      iconBg: "from-[#00c896] to-[#059669]",
      changeColor: "text-[#00c896]",
    },
    {
      value: 3421,
      suffix: "",
      label: "Nombre d'utilisateurs",
      change: "+48",
      changeUp: true,
      icon: Users,
      iconBg: "from-[#6c5ce7] to-[#7c3aed]",
      changeColor: "text-[#00c896]",
    },
    {
      value: 4560200,
      suffix: " XOF",
      label: "Montant des dépôts",
      change: "+415 000 XOF",
      changeUp: true,
      icon: Coins,
      iconBg: "from-blue-500 to-blue-600",
      changeColor: "text-[#00c896]",
    },
    {
      value: 3210550,
      suffix: " XOF",
      label: "Montant des retraits",
      change: "-98 000 XOF",
      changeUp: false,
      icon: CreditCard,
      iconBg: "from-[#ff6b35] to-[#ea580c]",
      changeColor: "text-red-400",
    },
    {
      value: 18724,
      suffix: "",
      label: "Nombre de mises",
      change: "+392",
      changeUp: true,
      icon: Dice5,
      iconBg: "from-pink-500 to-pink-600",
      changeColor: "text-[#00c896]",
    },
  ];

  const parties = [
    {
      id: "#PART-7841",
      user: "Sophie Dubois",
      game: "Blackjack",
      amount: "248 000 XOF",
      date: "30 Août 2025",
      status: "win",
      label: "Gagné",
    },
    {
      id: "#PART-7840",
      user: "Thomas Leroy",
      game: "Roulette",
      amount: "89 900 XOF",
      date: "29 Août 2025",
      status: "lose",
      label: "Perdu",
    },
    {
      id: "#PART-7839",
      user: "Marie Bernard",
      game: "Poker",
      amount: "412 500 XOF",
      date: "29 Août 2025",
      status: "win",
      label: "Gagné",
    },
    {
      id: "#PART-7838",
      user: "Lucas Petit",
      game: "Blackjack",
      amount: "67 000 XOF",
      date: "28 Août 2025",
      status: "lose",
      label: "Perdu",
    },
    {
      id: "#PART-7837",
      user: "Emma Roux",
      game: "Roulette",
      amount: "156 800 XOF",
      date: "28 Août 2025",
      status: "win",
      label: "Gagné",
    },
    {
      id: "#PART-7836",
      user: "Nicolas Moreau",
      game: "Poker",
      amount: "324 000 XOF",
      date: "27 Août 2025",
      status: "pending",
      label: "En attente",
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

        <div className="relative z-10 flex-1 p-4 sm:p-6">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-6"
          >
            <h1 className="text-2xl font-bold text-white sm:text-[1.6rem]">
              Dashboard
            </h1>
            <p className="mt-0.5 text-sm text-white/60 sm:text-[0.95rem]">
              Bienvenue, voici un aperçu de vos performances
            </p>
          </motion.div>

          {/* KPI Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {kpis.map((kpi) => (
              <motion.div
                key={kpi.label}
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="flex flex-col rounded-2xl border border-white/6 bg-[#14142b] p-4 shadow-lg transition hover:border-[#00c896]/20 sm:p-5"
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div>
                    <div className="text-xl font-bold text-white sm:text-[1.4rem]">
                      <AnimatedNumber value={kpi.value} suffix={kpi.suffix} />
                    </div>
                    <div className="text-xs text-white/60 sm:text-[0.8rem]">
                      {kpi.label}
                    </div>
                  </div>
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${kpi.iconBg} text-white sm:h-10 sm:w-10`}
                  >
                    <kpi.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                </div>
                <div
                  className={`mt-1.5 flex flex-wrap items-center gap-1 text-xs font-medium sm:text-[0.8rem] ${kpi.changeColor}`}
                >
                  {kpi.changeUp ? (
                    <ArrowUp className="h-3.5 w-3.5" />
                  ) : (
                    <ArrowDown className="h-3.5 w-3.5" />
                  )}
                  {kpi.change}
                  <span className="font-normal text-white/60">
                    aujourd&apos;hui
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Charts */}
          <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Évolution des mises */}
            <motion.div
              variants={chartVariants}
              initial="hidden"
              animate="visible"
              className="rounded-2xl border border-white/6 bg-[#14142b] p-5 shadow-lg transition hover:border-[#6c5ce7]/20"
            >
              <h3 className="mb-4 text-base font-semibold text-white">
                Évolution des mises
              </h3>
              <div className="relative h-[220px] w-full">
                <canvas ref={salesChartRef} className="h-full w-full" />
              </div>
            </motion.div>

            {/* Répartition des gains */}
            <motion.div
              variants={chartVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.45 }}
              className="rounded-2xl border border-white/6 bg-[#14142b] p-5 shadow-lg transition hover:border-[#6c5ce7]/20"
            >
              <h3 className="mb-4 text-base font-semibold text-white">
                Répartition des gains
              </h3>
              <div className="relative h-[220px] w-full">
                <canvas ref={trafficChartRef} className="h-full w-full" />
              </div>
            </motion.div>
          </div>

          {/* Table */}
          <motion.div
            variants={tableVariants}
            initial="hidden"
            animate="visible"
            className="rounded-2xl border border-white/6 bg-[#14142b] p-5 shadow-lg"
          >
            <h3 className="mb-4 text-base font-semibold text-white">
              Dernières Parties
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] text-sm">
                <thead>
                  <tr className="border-b border-white/6 text-left text-xs font-semibold tracking-wide text-white/60 uppercase">
                    <th className="px-3.5 py-3">ID</th>
                    <th className="px-3.5 py-3">Utilisateur</th>
                    <th className="px-3.5 py-3">Jeu</th>
                    <th className="px-3.5 py-3">Montant</th>
                    <th className="px-3.5 py-3">Date</th>
                    <th className="px-3.5 py-3">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {parties.map((row, i) => (
                    <motion.tr
                      key={row.id}
                      custom={i}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      className="border-b border-white/6 transition hover:bg-white/5"
                    >
                      <td className="px-3.5 py-3 text-white">{row.id}</td>
                      <td className="px-3.5 py-3 text-white">{row.user}</td>
                      <td className="px-3.5 py-3 text-white">{row.game}</td>
                      <td className="px-3.5 py-3 text-white">{row.amount}</td>
                      <td className="px-3.5 py-3 text-white">{row.date}</td>
                      <td className="px-3.5 py-3">
                        <span
                          className={`inline-block rounded-full px-3 py-0.5 text-xs font-medium ${
                            row.status === "win"
                              ? "bg-[#00c896]/15 text-emerald-300"
                              : row.status === "lose"
                              ? "bg-red-400/15 text-red-300"
                              : "bg-orange-400/15 text-orange-300"
                          }`}
                        >
                          {row.label}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";
import {
  FileDown,
  Users,
  Coins,
  Trophy,
  Calendar,
  Crown,
  Flame,
  ArrowUp,
} from "lucide-react";
import Sidebar, { type AdminPage } from "@/components/admin/side";
import Header from "@/components/admin/header";

type Period = "today" | "7j" | "30j" | "90j" | "1a" | "all";

const periodData: Record<
  Period,
  {
    label: string;
    users: string;
    usersChange: string;
    mises: string;
    misesChange: string;
    gains: string;
    gainsChange: string;
    volume: string;
    volumeChange: string;
    chartLabels: string[];
    misesData: number[];
    gainsData: number[];
  }
> = {
  today: {
    label: "Aujourd'hui",
    users: "3 421",
    usersChange: "+48",
    mises: "392",
    misesChange: "+392",
    gains: "248",
    gainsChange: "+248",
    volume: "892 450 XOF",
    volumeChange: "+892 450 XOF",
    chartLabels: ["00h", "02h", "04h", "06h", "08h", "10h", "12h", "14h", "16h", "18h", "20h", "22h", "23h"],
    misesData: [12, 8, 5, 3, 15, 42, 58, 67, 72, 55, 38, 22, 10],
    gainsData: [5, 3, 2, 1, 8, 25, 35, 42, 48, 32, 20, 12, 6],
  },
  "7j": {
    label: "7 jours",
    users: "6 842",
    usersChange: "+124",
    mises: "2 744",
    misesChange: "+2 744",
    gains: "1 736",
    gainsChange: "+1 736",
    volume: "6 245 000 XOF",
    volumeChange: "+6 245 000 XOF",
    chartLabels: ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"],
    misesData: [320, 380, 410, 520, 490, 420, 392],
    gainsData: [210, 245, 280, 340, 310, 265, 248],
  },
  "30j": {
    label: "30 jours",
    users: "12 456",
    usersChange: "+1 024",
    mises: "8 234",
    misesChange: "+8 234",
    gains: "5 210",
    gainsChange: "+5 210",
    volume: "18 450 000 XOF",
    volumeChange: "+18 450 000 XOF",
    chartLabels: ["Sem 1", "Sem 2", "Sem 3", "Sem 4"],
    misesData: [1800, 2100, 1950, 2384],
    gainsData: [1100, 1350, 1250, 1510],
  },
  "90j": {
    label: "90 jours",
    users: "24 891",
    usersChange: "+3 412",
    mises: "18 724",
    misesChange: "+18 724",
    gains: "11 850",
    gainsChange: "+11 850",
    volume: "52 300 000 XOF",
    volumeChange: "+52 300 000 XOF",
    chartLabels: ["Jan", "Fév", "Mar"],
    misesData: [5600, 6200, 6924],
    gainsData: [3500, 4000, 4350],
  },
  "1a": {
    label: "1 an",
    users: "45 672",
    usersChange: "+12 450",
    mises: "52 341",
    misesChange: "+52 341",
    gains: "33 120",
    gainsChange: "+33 120",
    volume: "185 000 000 XOF",
    volumeChange: "+185 000 000 XOF",
    chartLabels: ["T1", "T2", "T3", "T4"],
    misesData: [12000, 13500, 14800, 12041],
    gainsData: [7500, 8500, 9400, 7720],
  },
  all: {
    label: "Tout",
    users: "87 234",
    usersChange: "+25 000",
    mises: "124 567",
    misesChange: "+124 567",
    gains: "78 890",
    gainsChange: "+78 890",
    volume: "420 000 000 XOF",
    volumeChange: "+420 000 000 XOF",
    chartLabels: ["2019", "2020", "2021", "2022", "2023", "2024"],
    misesData: [15000, 18000, 22000, 28000, 35000, 24567],
    gainsData: [9000, 11000, 14000, 18000, 22000, 15670],
  },
};

interface AnalyticsPageProps {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
}

export default function AnalyticsPage({ currentPage, onNavigate }: AnalyticsPageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [period, setPeriod] = useState<Period>("today");
  const misesChartRef = useRef<HTMLCanvasElement>(null);
  const gamesChartRef = useRef<HTMLCanvasElement>(null);
  const misesChartInstance = useRef<Chart | null>(null);
  const gamesChartInstance = useRef<Chart | null>(null);

  const data = periodData[period];

  // Charts
  useEffect(() => {
    // Mises chart
    if (misesChartRef.current) {
      if (misesChartInstance.current) {
        misesChartInstance.current.destroy();
      }
      misesChartInstance.current = new Chart(misesChartRef.current, {
        type: "bar",
        data: {
          labels: data.chartLabels,
          datasets: [
            {
              label: "Mises",
              data: data.misesData,
              backgroundColor: "rgba(0, 200, 150, 0.7)",
              borderRadius: 6,
              borderSkipped: false,
            },
            {
              label: "Gains",
              data: data.gainsData,
              backgroundColor: "rgba(108, 92, 231, 0.6)",
              borderRadius: 6,
              borderSkipped: false,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              labels: {
                color: "#94a3b8",
                font: { size: 11 },
                boxWidth: 12,
                padding: 12,
              },
            },
          },
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

    // Games chart (once)
    if (gamesChartRef.current && !gamesChartInstance.current) {
      gamesChartInstance.current = new Chart(gamesChartRef.current, {
        type: "doughnut",
        data: {
          labels: ["Blackjack", "Roulette", "Poker", "Slot"],
          datasets: [
            {
              data: [42, 32, 20, 6],
              backgroundColor: ["#00c896", "#6c5ce7", "#ff6b35", "#64748b"],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
              labels: {
                color: "#94a3b8",
                padding: 12,
                font: { size: 11 },
                boxWidth: 12,
              },
            },
          },
          cutout: "60%",
        },
      });
    }

    return () => {
      misesChartInstance.current?.destroy();
      misesChartInstance.current = null;
    };
  }, [period, data]);

  useEffect(() => {
    return () => {
      gamesChartInstance.current?.destroy();
      gamesChartInstance.current = null;
    };
  }, []);

  return (
    <div className="flex min-h-screen text-slate-100">
      <Sidebar open={sidebarOpen} active={currentPage} onNavigate={onNavigate} />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col md:ml-[260px]">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Page Header */}
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-[1.6rem]">Analytics</h1>
              <p className="mt-0.5 text-sm text-white/60 sm:text-[0.95rem]">
                Analyse détaillée des performances de la plateforme
              </p>
            </div>
            <button className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#7c3aed] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_10px_rgba(108,92,231,0.25)] transition hover:scale-[1.02]">
              <FileDown className="h-4 w-4" />
              Exporter rapport
            </button>
          </div>

          {/* Time Filter */}
          <div className="mb-5 flex flex-wrap gap-1 rounded-xl border border-white/6 bg-[#14142b] p-1">
            {(
              [
                { key: "today", label: "Aujourd'hui" },
                { key: "7j", label: "7 jours" },
                { key: "30j", label: "30 jours" },
                { key: "90j", label: "90 jours" },
                { key: "1a", label: "1 an" },
                { key: "all", label: "Tout" },
              ] as { key: Period; label: string }[]
            ).map((btn) => (
              <button
                key={btn.key}
                onClick={() => setPeriod(btn.key)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  period === btn.key
                    ? "bg-[#00c896] text-white shadow-[0_4px_12px_rgba(0,200,150,0.25)]"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* KPI Cards */}
          <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              {
                icon: Users,
                value: data.users,
                label: "Utilisateurs actifs",
                change: data.usersChange,
                color: "text-[#6c5ce7]",
              },
              {
                icon: Coins,
                value: data.mises,
                label: "Total des mises",
                change: data.misesChange,
                color: "text-[#00c896]",
              },
              {
                icon: Trophy,
                value: data.gains,
                label: "Parties gagnées",
                change: data.gainsChange,
                color: "text-[#ff6b35]",
              },
              {
                icon: Calendar,
                value: data.volume,
                label: "Volume total (mises)",
                change: data.volumeChange,
                color: "text-red-400",
              },
            ].map((kpi) => (
              <div
                key={kpi.label}
                className="rounded-2xl border border-white/6 bg-[#14142b] p-4 text-center transition hover:-translate-y-0.5 hover:border-[#00c896]/20 sm:p-5"
              >
                <kpi.icon className={`mx-auto mb-1 h-5 w-5 ${kpi.color}`} />
                <div className="text-xl font-bold text-white sm:text-[1.8rem]">{kpi.value}</div>
                <div className="mt-0.5 text-xs text-white/60 sm:text-sm">{kpi.label}</div>
                <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-[#00c896]/15 px-3 py-0.5 text-xs font-medium text-[#00c896]">
                  <ArrowUp className="h-3 w-3" />
                  {kpi.change}
                </span>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="mb-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/6 bg-[#14142b] p-5 shadow-lg transition hover:border-[#6c5ce7]/20">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">Évolution des mises</h3>
                <span className="rounded-full bg-[#0b0b1a] px-3 py-0.5 text-xs text-white/60">
                  {data.label}
                </span>
              </div>
              <div className="relative h-[220px] w-full">
                <canvas ref={misesChartRef} className="h-full w-full" />
              </div>
            </div>

            <div className="rounded-2xl border border-white/6 bg-[#14142b] p-5 shadow-lg transition hover:border-[#6c5ce7]/20">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold text-white">Répartition par jeu</h3>
                <span className="rounded-full bg-[#0b0b1a] px-3 py-0.5 text-xs text-white/60">
                  Volume
                </span>
              </div>
              <div className="relative h-[220px] w-full">
                <canvas ref={gamesChartRef} className="h-full w-full" />
              </div>
            </div>
          </div>

          {/* Tops */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Top gagnants */}
            <div className="rounded-2xl border border-white/6 bg-[#14142b] p-5">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
                <Crown className="h-5 w-5 text-[#00c896]" />
                Top 5 gagnants
              </h3>
              <div className="flex flex-col gap-2">
                {[
                  {
                    rank: "🥇",
                    rankClass: "text-yellow-400",
                    avatar: "SD",
                    color: "from-yellow-400 to-yellow-600",
                    name: "Sophie Dubois",
                    sub: "248 000 XOF misés",
                    value: "+2 890 450 XOF",
                  },
                  {
                    rank: "🥈",
                    rankClass: "text-slate-400",
                    avatar: "MB",
                    color: "from-slate-400 to-slate-600",
                    name: "Marie Bernard",
                    sub: "412 500 XOF misés",
                    value: "+1 456 200 XOF",
                  },
                  {
                    rank: "🥉",
                    rankClass: "text-orange-500",
                    avatar: "ER",
                    color: "from-orange-500 to-orange-700",
                    name: "Emma Roux",
                    sub: "156 800 XOF misés",
                    value: "+987 500 XOF",
                  },
                  {
                    rank: "4",
                    rankClass: "text-white/50",
                    avatar: "CL",
                    color: "from-[#6c5ce7] to-[#7c3aed]",
                    name: "Camille Lefèvre",
                    sub: "45 000 XOF misés",
                    value: "+654 300 XOF",
                  },
                  {
                    rank: "5",
                    rankClass: "text-white/50",
                    avatar: "NM",
                    color: "from-blue-500 to-blue-600",
                    name: "Nicolas Moreau",
                    sub: "324 000 XOF misés",
                    value: "+432 800 XOF",
                  },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-3 rounded-xl border border-white/6 bg-[#0b0b1a] px-3.5 py-2.5 transition hover:border-[#00c896]/20"
                  >
                    <span className={`min-w-[24px] text-sm font-bold ${item.rankClass}`}>
                      {item.rank}
                    </span>
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${item.color} text-xs font-semibold text-white`}
                    >
                      {item.avatar}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-white">{item.name}</div>
                      <div className="text-xs text-white/50">{item.sub}</div>
                    </div>
                    <div className="shrink-0 text-sm font-bold text-[#00c896]">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Jeux populaires */}
            <div className="rounded-2xl border border-white/6 bg-[#14142b] p-5">
              <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-white">
                <Flame className="h-5 w-5 text-red-400" />
                Jeux les plus populaires
              </h3>
              <div className="flex flex-col gap-2">
                {[
                  { rank: "🥇", rankClass: "text-yellow-400", icon: "🃏", name: "Blackjack", sub: "5 234 parties", value: "2 198" },
                  { rank: "🥈", rankClass: "text-slate-400", icon: "🎰", name: "Roulette", sub: "4 876 parties", value: "1 675" },
                  { rank: "🥉", rankClass: "text-orange-500", icon: "♠️", name: "Poker", sub: "3 124 parties", value: "1 047" },
                  { rank: "4", rankClass: "text-white/50", icon: "🎰", name: "Slot", sub: "1 234 parties", value: "314", muted: true },
                ].map((item) => (
                  <div
                    key={item.name}
                    className="flex items-center gap-3 rounded-xl border border-white/6 bg-[#0b0b1a] px-3.5 py-2.5 transition hover:border-[#00c896]/20"
                  >
                    <span className={`min-w-[24px] text-sm font-bold ${item.rankClass}`}>
                      {item.rank}
                    </span>
                    <span className="text-xl">{item.icon}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-white">{item.name}</div>
                      <div className="text-xs text-white/50">{item.sub}</div>
                    </div>
                    <div
                      className={`shrink-0 text-sm font-bold ${
                        item.muted ? "text-white/50" : "text-[#00c896]"
                      }`}
                    >
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import {
  Plus,
  FileDown,
  Coins,
  Calendar,
  Calculator,
  ChartColumn,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import Sidebar, { type AdminPage } from "@/components/admin/side";
import Header from "@/components/admin/header";

interface MiseDetails {
  cote?: number;
  mise?: number;
  gainNet?: number;
  type?: string;
  main?: string;
  carte?: string[];
  croupier?: string;
  numero?: number;
  couleur?: string;
  raison?: string;
}

interface Mise {
  id: string;
  user: string;
  userEmail: string;
  game: string;
  gameIcon: string;
  montant: string;
  gain: string;
  date: string;
  status: "win" | "lose" | "pending" | "cancelled";
  details: MiseDetails;
  historique: string[];
}

const mises: Mise[] = [
  {
    id: "#MISE-7841",
    user: "Sophie Dubois",
    userEmail: "sophie.dubois@email.com",
    game: "Blackjack",
    gameIcon: "🃏",
    montant: "248 000",
    gain: "496 000",
    date: "30 Août 2025 14:32",
    status: "win",
    details: { cote: 2.0, mise: 248000, gainNet: 248000, type: "Main" },
    historique: [
      "Mise initiale 248 000 XOF",
      "Tirage : As ♠, Roi ♥",
      "Gain x2",
    ],
  },
  {
    id: "#MISE-7840",
    user: "Thomas Leroy",
    userEmail: "thomas.leroy@email.com",
    game: "Roulette",
    gameIcon: "🎰",
    montant: "89 900",
    gain: "0",
    date: "29 Août 2025 18:15",
    status: "lose",
    details: {
      cote: 0,
      mise: 89900,
      gainNet: -89900,
      type: "Plein",
      numero: 17,
    },
    historique: [
      "Mise sur le 17",
      "Résultat : 22 Noir",
      "Perte de la mise",
    ],
  },
  {
    id: "#MISE-7839",
    user: "Marie Bernard",
    userEmail: "marie.bernard@email.com",
    game: "Poker",
    gameIcon: "♠️",
    montant: "412 500",
    gain: "825 000",
    date: "29 Août 2025 21:00",
    status: "win",
    details: {
      cote: 2.0,
      mise: 412500,
      gainNet: 412500,
      type: "Tournoi",
      main: "Full House",
    },
    historique: [
      "Mise 412 500 XOF",
      "Main : Full House",
      "Gain x2",
    ],
  },
  {
    id: "#MISE-7838",
    user: "Lucas Petit",
    userEmail: "lucas.petit@email.com",
    game: "Blackjack",
    gameIcon: "🃏",
    montant: "67 000",
    gain: "0",
    date: "28 Août 2025 11:30",
    status: "lose",
    details: {
      cote: 0,
      mise: 67000,
      gainNet: -67000,
      type: "Main",
      carte: ["7 ♠", "9 ♥"],
    },
    historique: [
      "Mise 67 000 XOF",
      "Tirage : 7 ♠, 9 ♥",
      "Croupier : Roi ♣, 8 ♦",
      "Perte de la mise",
    ],
  },
  {
    id: "#MISE-7837",
    user: "Emma Roux",
    userEmail: "emma.roux@email.com",
    game: "Roulette",
    gameIcon: "🎰",
    montant: "156 800",
    gain: "313 600",
    date: "28 Août 2025 16:45",
    status: "win",
    details: {
      cote: 2.0,
      mise: 156800,
      gainNet: 156800,
      type: "Rouge",
      numero: 7,
    },
    historique: [
      "Mise sur le Rouge",
      "Résultat : 7 Rouge",
      "Gain x2",
    ],
  },
  {
    id: "#MISE-7836",
    user: "Nicolas Moreau",
    userEmail: "nicolas.moreau@email.com",
    game: "Poker",
    gameIcon: "♠️",
    montant: "324 000",
    gain: "0",
    date: "27 Août 2025 19:20",
    status: "pending",
    details: {
      cote: 0,
      mise: 324000,
      gainNet: 0,
      type: "Tournoi",
      main: "En cours",
    },
    historique: ["Mise 324 000 XOF", "Partie en cours..."],
  },
  {
    id: "#MISE-7835",
    user: "Camille Lefèvre",
    userEmail: "camille.lefevre@email.com",
    game: "Slot",
    gameIcon: "🎰",
    montant: "45 000",
    gain: "0",
    date: "27 Août 2025 09:10",
    status: "cancelled",
    details: {
      cote: 0,
      mise: 45000,
      gainNet: 0,
      type: "Slot",
      raison: "Annulation",
    },
    historique: [
      "Mise 45 000 XOF",
      "Annulation par l'utilisateur",
    ],
  },
];

interface MisesPageProps {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
}

export default function MisesPage({ currentPage, onNavigate }: MisesPageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedMise, setSelectedMise] = useState<Mise | null>(null);

  const getStatusBadge = (status: Mise["status"]) => {
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

  return (
    <div className="flex min-h-screen text-slate-100">
      <Sidebar open={sidebarOpen} active={currentPage} onNavigate={onNavigate} />

      <div className="flex min-h-screen min-w-0 flex-1 flex-col md:ml-[260px]">
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Page Header */}
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold text-white sm:text-[1.6rem]">
                Gestion des mises
              </h1>
              <p className="mt-0.5 text-sm text-white/60 sm:text-[0.95rem]">
                Consultez l&apos;historique complet des mises et paris
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[#00c896] to-[#059669] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_10px_rgba(0,200,150,0.25)] transition hover:scale-[1.02]">
                <Plus className="h-4 w-4" />
                Nouvelle mise
              </button>
              <button className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#7c3aed] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_10px_rgba(108,92,231,0.25)] transition hover:scale-[1.02]">
                <FileDown className="h-4 w-4" />
                Exporter
              </button>
            </div>
          </div>

          {/* Stats mini */}
          <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              {
                icon: Coins,
                value: "18 724",
                label: "Total mises",
                color: "text-[#6c5ce7]",
              },
              {
                icon: Calendar,
                value: "392",
                label: "Mises aujourd'hui",
                color: "text-[#00c896]",
              },
              {
                icon: Calculator,
                value: "2 890 450 XOF",
                label: "Montant total misé",
                color: "text-[#ff6b35]",
              },
              {
                icon: ChartColumn,
                value: "154 XOF",
                label: "Mise moyenne",
                color: "text-[#00c896]",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-white/6 bg-[#14142b] p-4 text-center sm:p-5"
              >
                <stat.icon className={`mx-auto mb-1 h-5 w-5 ${stat.color}`} />
                <div className="text-lg font-bold text-white sm:text-[1.6rem]">
                  {stat.value}
                </div>
                <div className="mt-0.5 text-xs text-white/60 sm:text-sm">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Filters */}
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs font-medium text-white/60">Statut :</label>
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
              <label className="text-xs font-medium text-white/60">Montant :</label>
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
                <option>Date ↓</option>
                <option>Date ↑</option>
                <option>Montant ↓</option>
                <option>Montant ↑</option>
              </select>
            </div>
            <button className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#7c3aed] px-4 py-1.5 text-xs font-semibold text-white transition hover:scale-[1.02]">
              <Filter className="h-3.5 w-3.5" />
              Appliquer
            </button>
          </div>

          {/* Table */}
          <div className="overflow-hidden rounded-2xl border border-white/6 bg-[#14142b]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm">
                <thead>
                  <tr className="border-b border-white/6 text-left text-xs font-semibold tracking-wide text-white/60 uppercase">
                    <th className="px-3.5 py-3">ID</th>
                    <th className="px-3.5 py-3">Utilisateur</th>
                    <th className="px-3.5 py-3">Jeu</th>
                    <th className="px-3.5 py-3">Montant misé</th>
                    <th className="px-3.5 py-3">Gain</th>
                    <th className="px-3.5 py-3">Date</th>
                    <th className="px-3.5 py-3">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {mises.map((mise) => (
                    <tr
                      key={mise.id}
                      onClick={() => setSelectedMise(mise)}
                      className="cursor-pointer border-b border-white/6 transition hover:bg-white/5"
                    >
                      <td className="px-3.5 py-3 font-mono text-xs text-white">
                        {mise.id}
                      </td>
                      <td className="px-3.5 py-3 text-white">{mise.user}</td>
                      <td className="px-3.5 py-3 text-white">
                        <span className="mr-1.5">{mise.gameIcon}</span>
                        {mise.game}
                      </td>
                      <td className="px-3.5 py-3 text-white">
                        {mise.montant} XOF
                      </td>
                      <td
                        className={`px-3.5 py-3 font-medium ${
                          mise.status === "win"
                            ? "text-[#00c896]"
                            : mise.status === "lose"
                            ? "text-red-400"
                            : mise.status === "pending"
                            ? "text-orange-400"
                            : "text-white/50"
                        }`}
                      >
                        {mise.status === "win"
                          ? `+${mise.gain} XOF`
                          : mise.status === "lose"
                          ? `-${mise.montant} XOF`
                          : mise.status === "pending"
                          ? "En attente"
                          : "Annulé"}
                      </td>
                      <td className="px-3.5 py-3 text-white">
                        {mise.date.split(" ").slice(0, 3).join(" ")}
                      </td>
                      <td className="px-3.5 py-3">
                        {getStatusBadge(mise.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/6 px-5 py-4">
              <div className="text-sm text-white/60">
                Affichage de <strong className="text-white">1</strong> à{" "}
                <strong className="text-white">7</strong> sur{" "}
                <strong className="text-white">18 724</strong> mises
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
          </div>
        </div>
      </div>

      {/* ===== MODAL ===== */}
      {selectedMise && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-5 backdrop-blur-md"
          onClick={() => setSelectedMise(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-[600px] overflow-y-auto rounded-2xl border border-white/6 bg-[#14142b] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-white/6 bg-[#14142b] px-6 py-5">
              <h2 className="text-lg font-bold text-white">
                Détails - {selectedMise.id}
              </h2>
              <button
                onClick={() => setSelectedMise(null)}
                className="rounded-lg p-1.5 text-white/60 transition hover:bg-white/5 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Infos générales */}
                <div className="col-span-full rounded-xl border border-white/6 bg-[#0b0b1a] p-4">
                  <div className="mb-2 text-xs font-semibold tracking-wide text-white/60 uppercase">
                    Informations générales
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
                    <span>
                      <strong className="text-white/60">ID :</strong>{" "}
                      <span className="font-mono text-white">
                        {selectedMise.id}
                      </span>
                    </span>
                    <span>
                      <strong className="text-white/60">Utilisateur :</strong>{" "}
                      <span className="text-white">{selectedMise.user}</span>
                    </span>
                    <span>
                      <strong className="text-white/60">Email :</strong>{" "}
                      <span className="text-white/60">
                        {selectedMise.userEmail}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/6 bg-[#0b0b1a] p-4">
                  <div className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                    Jeu
                  </div>
                  <div className="mt-0.5 text-lg font-bold text-white">
                    {selectedMise.gameIcon} {selectedMise.game}
                  </div>
                </div>

                <div className="rounded-xl border border-white/6 bg-[#0b0b1a] p-4">
                  <div className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                    Date
                  </div>
                  <div className="mt-0.5 text-lg font-bold text-white">
                    {selectedMise.date}
                  </div>
                </div>

                <div className="rounded-xl border border-white/6 bg-[#0b0b1a] p-4">
                  <div className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                    Montant misé
                  </div>
                  <div className="mt-0.5 text-lg font-bold text-white">
                    {selectedMise.montant} XOF
                  </div>
                </div>

                <div className="rounded-xl border border-white/6 bg-[#0b0b1a] p-4">
                  <div className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                    Cote
                  </div>
                  <div className="mt-0.5 text-lg font-bold text-white">
                    {selectedMise.details.cote && selectedMise.details.cote > 0
                      ? selectedMise.details.cote.toFixed(1)
                      : "--"}
                  </div>
                </div>

                <div className="rounded-xl border border-white/6 bg-[#0b0b1a] p-4">
                  <div className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                    Gain net
                  </div>
                  <div
                    className={`mt-0.5 text-lg font-bold ${
                      selectedMise.status === "win"
                        ? "text-[#00c896]"
                        : selectedMise.status === "lose"
                        ? "text-red-400"
                        : selectedMise.status === "pending"
                        ? "text-orange-400"
                        : "text-white/50"
                    }`}
                  >
                    {selectedMise.status === "win"
                      ? `+${selectedMise.gain} XOF`
                      : selectedMise.status === "lose"
                      ? `-${selectedMise.montant} XOF`
                      : selectedMise.status === "pending"
                      ? "En attente"
                      : "Annulé"}
                  </div>
                </div>

                <div className="col-span-full rounded-xl border border-white/6 bg-[#0b0b1a] p-4">
                  <div className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                    Statut
                  </div>
                  <div className="mt-1">
                    {getStatusBadge(selectedMise.status)}
                  </div>
                </div>

                {/* Détails */}
                <div className="col-span-full mt-1 text-xs font-semibold tracking-wide text-white/60 uppercase">
                  Détails de la mise
                </div>
                <div className="col-span-full grid grid-cols-2 gap-2">
                  {Object.entries({
                    Type: selectedMise.details.type,
                    Mise: selectedMise.details.mise
                      ? `${selectedMise.details.mise.toLocaleString()} XOF`
                      : null,
                    "Gain net":
                      selectedMise.details.gainNet !== undefined
                        ? `${selectedMise.details.gainNet.toLocaleString()} XOF`
                        : null,
                    Cote: selectedMise.details.cote
                      ? selectedMise.details.cote.toFixed(1)
                      : null,
                    Main: selectedMise.details.main,
                    Carte: selectedMise.details.carte?.join(", "),
                    Numéro: selectedMise.details.numero,
                    Couleur: selectedMise.details.couleur,
                    Raison: selectedMise.details.raison,
                  })
                    .filter(([, value]) => value != null && value !== "N/A")
                    .map(([key, value]) => (
                      <div
                        key={key}
                        className="rounded-lg border border-white/6 bg-[#0b0b1a] px-3 py-2"
                      >
                        <div className="text-[0.65rem] tracking-wide text-white/50 uppercase">
                          {key}
                        </div>
                        <div className="text-sm font-medium text-white">
                          {value}
                        </div>
                      </div>
                    ))}
                </div>

                {/* Historique */}
                <div className="col-span-full mt-1 text-xs font-semibold tracking-wide text-white/60 uppercase">
                  Historique
                </div>
                <div className="col-span-full flex flex-col gap-1.5">
                  {selectedMise.historique.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2.5 rounded-lg border border-white/6 bg-[#0b0b1a] px-3 py-2"
                    >
                      <span className="min-w-[24px] text-xs font-semibold text-white/50">
                        #{index + 1}
                      </span>
                      <span className="text-sm text-white">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
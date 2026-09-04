"use client";

import { useState } from "react";
import {
  Plus,
  FileDown,
  Coins,
  Calendar,
  Clock,
  CircleCheck,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import Sidebar, { type AdminPage } from "@/components/admin/side";
import Header from "@/components/admin/header";

interface DepotDetails {
  reference?: string;
  frais?: number;
  total?: string;
  telephone?: string;
  reference_pd?: string;
  raison?: string;
}

interface Depot {
  id: string;
  user: string;
  userEmail: string;
  method: string;
  methodIcon: string;
  montant: string;
  date: string;
  status: "completed" | "pending" | "failed" | "cancelled";
  details: DepotDetails;
}

const depots: Depot[] = [
  {
    id: "#DEP-7841",
    user: "Sophie Dubois",
    userEmail: "sophie.dubois@email.com",
    method: "FedaPay",
    methodIcon: "💳",
    montant: "248 000",
    date: "30 Août 2025 14:32",
    status: "completed",
    details: {
      reference: "FP-2025-7841",
      frais: 1240,
      total: "249 240",
      telephone: "+225 07 12 34 56",
    },
  },
  {
    id: "#DEP-7840",
    user: "Thomas Leroy",
    userEmail: "thomas.leroy@email.com",
    method: "SubPay",
    methodIcon: "🔵",
    montant: "89 900",
    date: "29 Août 2025 18:15",
    status: "pending",
    details: {
      reference: "SP-2025-7840",
      frais: 0,
      total: "89 900",
      telephone: "+225 05 98 76 54",
    },
  },
  {
    id: "#DEP-7839",
    user: "Marie Bernard",
    userEmail: "marie.bernard@email.com",
    method: "PayDunya",
    methodIcon: "🟣",
    montant: "412 500",
    date: "29 Août 2025 21:00",
    status: "completed",
    details: {
      reference: "PD-2025-7839",
      frais: 4125,
      total: "416 625",
      reference_pd: "PD-REF-8832",
    },
  },
  {
    id: "#DEP-7838",
    user: "Lucas Petit",
    userEmail: "lucas.petit@email.com",
    method: "FedaPay",
    methodIcon: "💳",
    montant: "67 000",
    date: "28 Août 2025 11:30",
    status: "failed",
    details: {
      reference: "FP-2025-7838",
      frais: 0,
      total: "67 000",
      telephone: "+225 01 23 45 67",
      raison: "Transaction annulée",
    },
  },
  {
    id: "#DEP-7837",
    user: "Emma Roux",
    userEmail: "emma.roux@email.com",
    method: "SubPay",
    methodIcon: "🔵",
    montant: "156 800",
    date: "28 Août 2025 16:45",
    status: "completed",
    details: {
      reference: "SP-2025-7837",
      frais: 784,
      total: "157 584",
      telephone: "+225 07 89 01 23",
    },
  },
  {
    id: "#DEP-7836",
    user: "Nicolas Moreau",
    userEmail: "nicolas.moreau@email.com",
    method: "PayDunya",
    methodIcon: "🟣",
    montant: "324 000",
    date: "27 Août 2025 19:20",
    status: "pending",
    details: {
      reference: "PD-2025-7836",
      frais: 0,
      total: "324 000",
      reference_pd: "PD-REF-5512",
    },
  },
  {
    id: "#DEP-7835",
    user: "Camille Lefèvre",
    userEmail: "camille.lefevre@email.com",
    method: "FedaPay",
    methodIcon: "💳",
    montant: "45 000",
    date: "27 Août 2025 09:10",
    status: "cancelled",
    details: {
      reference: "FP-2025-7835",
      frais: 450,
      total: "45 450",
      raison: "Annulation par l'utilisateur",
    },
  },
];

interface DepotsPageProps {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
}

export default function DepotsPage({
  currentPage,
  onNavigate,
}: DepotsPageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedDepot, setSelectedDepot] = useState<Depot | null>(null);

  const getStatusBadge = (status: Depot["status"]) => {
    const styles = {
      completed: "bg-[#00c896]/15 text-emerald-300",
      pending: "bg-orange-400/15 text-orange-300",
      failed: "bg-red-400/15 text-red-300",
      cancelled: "bg-slate-400/15 text-slate-400",
    };
    const labels = {
      completed: "Validé",
      pending: "En attente",
      failed: "Échoué",
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
                Gestion des dépôts
              </h1>
              <p className="mt-0.5 text-sm text-white/60 sm:text-[0.95rem]">
                Consultez et gérez tous les dépôts des utilisateurs
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              <button className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[#00c896] to-[#059669] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_10px_rgba(0,200,150,0.25)] transition hover:scale-[1.02]">
                <Plus className="h-4 w-4" />
                Nouveau dépôt
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
                value: "4 560 200 XOF",
                label: "Total des dépôts",
                color: "text-[#6c5ce7]",
              },
              {
                icon: Calendar,
                value: "415 000 XOF",
                label: "Dépôts aujourd'hui",
                color: "text-[#00c896]",
              },
              {
                icon: Clock,
                value: "12",
                label: "En attente",
                color: "text-[#ff6b35]",
              },
              {
                icon: CircleCheck,
                value: "1 847",
                label: "Dépôts validés",
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
                <option>Validé</option>
                <option>En attente</option>
                <option>Échoué</option>
                <option>Annulé</option>
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs font-medium text-white/60">Méthode :</label>
              <select className="cursor-pointer rounded-lg border border-white/10 bg-[#0b0b1a] px-3 py-1.5 text-sm text-white outline-none focus:border-[#00c896]">
                <option>Toutes</option>
                <option>FedaPay</option>
                <option>SubPay</option>
                <option>PayDunya</option>
              </select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label className="text-xs font-medium text-white/60">Montant :</label>
              <select className="cursor-pointer rounded-lg border border-white/10 bg-[#0b0b1a] px-3 py-1.5 text-sm text-white outline-none focus:border-[#00c896]">
                <option>Tous</option>
                <option>Élevé (&gt; 500 000)</option>
                <option>Moyen (100k - 500k)</option>
                <option>Faible (&lt; 100 000)</option>
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
                    <th className="px-3.5 py-3">Méthode</th>
                    <th className="px-3.5 py-3">Montant</th>
                    <th className="px-3.5 py-3">Date</th>
                    <th className="px-3.5 py-3">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {depots.map((depot) => (
                    <tr
                      key={depot.id}
                      onClick={() => setSelectedDepot(depot)}
                      className="cursor-pointer border-b border-white/6 transition hover:bg-white/5"
                    >
                      <td className="px-3.5 py-3 font-mono text-xs text-white">
                        {depot.id}
                      </td>
                      <td className="px-3.5 py-3 text-white">{depot.user}</td>
                      <td className="px-3.5 py-3 text-white">
                        <span className="mr-1.5">{depot.methodIcon}</span>
                        {depot.method}
                      </td>
                      <td className="px-3.5 py-3 text-white">
                        {depot.montant} XOF
                      </td>
                      <td className="px-3.5 py-3 text-white">
                        {depot.date.split(" ").slice(0, 3).join(" ")}
                      </td>
                      <td className="px-3.5 py-3">
                        {getStatusBadge(depot.status)}
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
                <strong className="text-white">1 847</strong> dépôts
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
      {selectedDepot && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 p-5 backdrop-blur-md"
          onClick={() => setSelectedDepot(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-[600px] overflow-y-auto rounded-2xl border border-white/6 bg-[#14142b] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-white/6 bg-[#14142b] px-6 py-5">
              <h2 className="text-lg font-bold text-white">
                Détails - {selectedDepot.id}
              </h2>
              <button
                onClick={() => setSelectedDepot(null)}
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
                        {selectedDepot.id}
                      </span>
                    </span>
                    <span>
                      <strong className="text-white/60">Utilisateur :</strong>{" "}
                      <span className="text-white">{selectedDepot.user}</span>
                    </span>
                    <span>
                      <strong className="text-white/60">Email :</strong>{" "}
                      <span className="text-white/60">
                        {selectedDepot.userEmail}
                      </span>
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-white/6 bg-[#0b0b1a] p-4">
                  <div className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                    Méthode
                  </div>
                  <div className="mt-0.5 text-lg font-bold text-white">
                    {selectedDepot.methodIcon} {selectedDepot.method}
                  </div>
                </div>

                <div className="rounded-xl border border-white/6 bg-[#0b0b1a] p-4">
                  <div className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                    Date
                  </div>
                  <div className="mt-0.5 text-lg font-bold text-white">
                    {selectedDepot.date}
                  </div>
                </div>

                <div className="rounded-xl border border-white/6 bg-[#0b0b1a] p-4">
                  <div className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                    Montant
                  </div>
                  <div className="mt-0.5 text-lg font-bold text-white">
                    {selectedDepot.montant} XOF
                  </div>
                </div>

                <div className="rounded-xl border border-white/6 bg-[#0b0b1a] p-4">
                  <div className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                    Frais
                  </div>
                  <div className="mt-0.5 text-lg font-bold text-white">
                    {selectedDepot.details.frais
                      ? `${selectedDepot.details.frais.toLocaleString()} XOF`
                      : "0 XOF"}
                  </div>
                </div>

                <div className="rounded-xl border border-white/6 bg-[#0b0b1a] p-4">
                  <div className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                    Total
                  </div>
                  <div className="mt-0.5 text-lg font-bold text-[#00c896]">
                    {selectedDepot.details.total
                      ? `${selectedDepot.details.total} XOF`
                      : `${selectedDepot.montant} XOF`}
                  </div>
                </div>

                <div className="col-span-full rounded-xl border border-white/6 bg-[#0b0b1a] p-4">
                  <div className="text-xs font-semibold tracking-wide text-white/60 uppercase">
                    Statut
                  </div>
                  <div className="mt-1">
                    {getStatusBadge(selectedDepot.status)}
                  </div>
                </div>

                {/* Détails complémentaires */}
                <div className="col-span-full mt-1 text-xs font-semibold tracking-wide text-white/60 uppercase">
                  Informations complémentaires
                </div>
                <div className="col-span-full grid grid-cols-2 gap-2">
                  {Object.entries({
                    Référence: selectedDepot.details.reference,
                    Téléphone: selectedDepot.details.telephone,
                    "Référence PayDunya": selectedDepot.details.reference_pd,
                    Raison: selectedDepot.details.raison,
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
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
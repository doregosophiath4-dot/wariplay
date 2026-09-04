"use client";

import { useState } from "react";
import {
  SlidersHorizontal,
  Palette,
  Shield,
  Globe,
  Mail,
  Image,
  Lock,        // ← à la place de UserLock
  Upload,
} from "lucide-react";
import Sidebar, { type AdminPage } from "@/components/admin/side";
import Header from "@/components/admin/header";

type SettingsTab = "general" | "apparence" | "securite";

interface ParametresPageProps {
  currentPage: AdminPage;
  onNavigate: (page: AdminPage) => void;
}

function Toggle({
  active,
  onToggle,
}: {
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`relative h-[26px] w-12 shrink-0 cursor-pointer rounded-full border transition-colors ${
        active
          ? "border-[#00c896] bg-[#00c896]"
          : "border-white/10 bg-[#0b0b1a]"
      }`}
    >
      <span
        className={`absolute top-[2px] left-[2px] h-5 w-5 rounded-full bg-white shadow transition-transform ${
          active ? "translate-x-[22px]" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function ParametresPage({
  currentPage,
  onNavigate,
}: ParametresPageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");

  // Général
  const [platformName, setPlatformName] = useState("AdminPro Casino");
  const [currency, setCurrency] = useState("XOF");
  const [language, setLanguage] = useState("fr");
  const [timezone, setTimezone] = useState("UTC+1");
  const [emailNotif, setEmailNotif] = useState(true);
  const [adminAlerts, setAdminAlerts] = useState(true);
  const [dailyReports, setDailyReports] = useState(false);

  // Apparence
  const [darkMode, setDarkMode] = useState(true);
  const [primaryColor, setPrimaryColor] = useState("#00c896");
  const [secondaryColor, setSecondaryColor] = useState("#6c5ce7");
  const [font, setFont] = useState("Segoe UI");

  // Sécurité
  const [twoFactor, setTwoFactor] = useState(true);
  const [maxAttempts, setMaxAttempts] = useState(5);
  const [sessionTimeout, setSessionTimeout] = useState("30");
  const [activityLog, setActivityLog] = useState(true);
  const [autoSignup, setAutoSignup] = useState(true);
  const [emailVerification, setEmailVerification] = useState(true);

  const handleSave = () => {
    alert("✅ Paramètres sauvegardés avec succès !");
  };

  const handleReset = () => {
    if (confirm("⚠️ Voulez-vous vraiment réinitialiser tous les paramètres ?")) {
      alert("🔄 Paramètres réinitialisés par défaut");
    }
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
                Paramètres
              </h1>
              <p className="mt-0.5 text-sm text-white/60 sm:text-[0.95rem]">
                Gérez la configuration de votre plateforme
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[#00c896] to-[#059669] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_10px_rgba(0,200,150,0.25)] transition hover:scale-[1.02]"
              >
                Sauvegarder
              </button>
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[#ff6b35] to-[#ea580c] px-4 py-2 text-sm font-semibold text-white shadow-[0_4px_10px_rgba(255,107,53,0.25)] transition hover:scale-[1.02]"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-white/6 bg-[#14142b] p-1">
            {[
              { key: "general" as const, icon: SlidersHorizontal, label: "Général" },
              { key: "apparence" as const, icon: Palette, label: "Apparence" },
              { key: "securite" as const, icon: Shield, label: "Sécurité" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium whitespace-nowrap transition ${
                  activeTab === tab.key
                    ? "bg-[#00c896] text-white shadow-[0_4px_12px_rgba(0,200,150,0.25)]"
                    : "text-white/60 hover:bg-white/5 hover:text-white"
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* ===== TAB GENERAL ===== */}
          {activeTab === "general" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-white/6 bg-[#14142b] p-5 transition hover:border-[#00c896]/20 sm:p-6">
                <h3 className="mb-4 flex items-center gap-2.5 text-base font-semibold text-white">
                  <Globe className="h-5 w-5 text-[#00c896]" />
                  Informations générales
                </h3>

                <div className="divide-y divide-white/6">
                  <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-medium text-white">
                        Nom de la plateforme
                      </div>
                      <div className="text-xs text-white/50">
                        Nom affiché dans l&apos;interface et les emails
                      </div>
                    </div>
                    <input
                      type="text"
                      value={platformName}
                      onChange={(e) => setPlatformName(e.target.value)}
                      className="w-full rounded-lg border border-white/10 bg-[#0b0b1a] px-3 py-1.5 text-sm text-white outline-none focus:border-[#00c896] sm:w-[200px]"
                    />
                  </div>

                  <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-medium text-white">
                        Devise principale
                      </div>
                      <div className="text-xs text-white/50">
                        Devise utilisée pour les transactions
                      </div>
                    </div>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full cursor-pointer rounded-lg border border-white/10 bg-[#0b0b1a] px-3 py-1.5 text-sm text-white outline-none focus:border-[#00c896] sm:min-w-[160px] sm:w-auto"
                    >
                      <option value="XOF">XOF - Franc CFA</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="USD">USD - Dollar US</option>
                      <option value="GBP">GBP - Livre Sterling</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-medium text-white">
                        Langue par défaut
                      </div>
                      <div className="text-xs text-white/50">
                        Langue affichée sur la plateforme
                      </div>
                    </div>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full cursor-pointer rounded-lg border border-white/10 bg-[#0b0b1a] px-3 py-1.5 text-sm text-white outline-none focus:border-[#00c896] sm:min-w-[160px] sm:w-auto"
                    >
                      <option value="fr">Français</option>
                      <option value="en">Anglais</option>
                      <option value="es">Espagnol</option>
                      <option value="pt">Portugais</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-medium text-white">
                        Fuseau horaire
                      </div>
                      <div className="text-xs text-white/50">
                        Fuseau horaire de référence
                      </div>
                    </div>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full cursor-pointer rounded-lg border border-white/10 bg-[#0b0b1a] px-3 py-1.5 text-sm text-white outline-none focus:border-[#00c896] sm:min-w-[160px] sm:w-auto"
                    >
                      <option value="UTC+0">UTC+0 (GMT)</option>
                      <option value="UTC+1">UTC+1 (Paris/Lagos)</option>
                      <option value="UTC+2">UTC+2 (Le Cap/Le Caire)</option>
                      <option value="UTC-5">UTC-5 (New York)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/6 bg-[#14142b] p-5 transition hover:border-[#00c896]/20 sm:p-6">
                <h3 className="mb-4 flex items-center gap-2.5 text-base font-semibold text-white">
                  <Mail className="h-5 w-5 text-[#00c896]" />
                  Notifications
                </h3>

                <div className="divide-y divide-white/6">
                  {[
                    {
                      label: "Notifications par email",
                      desc: "Recevoir les notifications par email",
                      value: emailNotif,
                      toggle: () => setEmailNotif((v) => !v),
                    },
                    {
                      label: "Alertes admin",
                      desc: "Notifications pour les administrateurs",
                      value: adminAlerts,
                      toggle: () => setAdminAlerts((v) => !v),
                    },
                    {
                      label: "Rapports journaliers",
                      desc: "Recevoir un résumé des activités chaque jour",
                      value: dailyReports,
                      toggle: () => setDailyReports((v) => !v),
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      <div>
                        <div className="text-sm font-medium text-white">
                          {item.label}
                        </div>
                        <div className="text-xs text-white/50">{item.desc}</div>
                      </div>
                      <Toggle active={item.value} onToggle={item.toggle} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB APPARENCE ===== */}
          {activeTab === "apparence" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-white/6 bg-[#14142b] p-5 transition hover:border-[#00c896]/20 sm:p-6">
                <h3 className="mb-4 flex items-center gap-2.5 text-base font-semibold text-white">
                  <Palette className="h-5 w-5 text-[#00c896]" />
                  Thème et couleurs
                </h3>

                <div className="divide-y divide-white/6">
                  <div className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-white">Mode nuit</div>
                      <div className="text-xs text-white/50">
                        Activer le thème sombre
                      </div>
                    </div>
                    <Toggle
                      active={darkMode}
                      onToggle={() => setDarkMode((v) => !v)}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-white">
                        Couleur primaire
                      </div>
                      <div className="text-xs text-white/50">
                        Couleur principale de l&apos;interface
                      </div>
                    </div>
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="h-9 w-9 cursor-pointer rounded-lg border border-white/10 bg-[#0b0b1a] p-0.5"
                    />
                  </div>

                  <div className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-white">
                        Couleur secondaire
                      </div>
                      <div className="text-xs text-white/50">
                        Couleur secondaire de l&apos;interface
                      </div>
                    </div>
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="h-9 w-9 cursor-pointer rounded-lg border border-white/10 bg-[#0b0b1a] p-0.5"
                    />
                  </div>

                  <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-medium text-white">
                        Police d&apos;écriture
                      </div>
                      <div className="text-xs text-white/50">
                        Police utilisée sur l&apos;ensemble de l&apos;application
                      </div>
                    </div>
                    <select
                      value={font}
                      onChange={(e) => setFont(e.target.value)}
                      className="w-full cursor-pointer rounded-lg border border-white/10 bg-[#0b0b1a] px-3 py-1.5 text-sm text-white outline-none focus:border-[#00c896] sm:min-w-[140px] sm:w-auto"
                    >
                      <option>Segoe UI</option>
                      <option>Inter</option>
                      <option>Roboto</option>
                      <option>Poppins</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/6 bg-[#14142b] p-5 transition hover:border-[#00c896]/20 sm:p-6">
                <h3 className="mb-4 flex items-center gap-2.5 text-base font-semibold text-white">
                  <Image className="h-5 w-5 text-[#00c896]" />
                  Personnalisation
                </h3>

                <div className="divide-y divide-white/6">
                  {[
                    { label: "Logo", desc: "Logo de la plateforme" },
                    { label: "Favicon", desc: "Icône du navigateur" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      <div>
                        <div className="text-sm font-medium text-white">
                          {item.label}
                        </div>
                        <div className="text-xs text-white/50">{item.desc}</div>
                      </div>
                      <button className="flex items-center gap-1.5 rounded-full bg-gradient-to-br from-[#6c5ce7] to-[#7c3aed] px-3.5 py-1.5 text-xs font-semibold text-white transition hover:scale-[1.02]">
                        <Upload className="h-3.5 w-3.5" />
                        Changer
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ===== TAB SECURITE ===== */}
          {activeTab === "securite" && (
            <div className="space-y-5">
              <div className="rounded-2xl border border-white/6 bg-[#14142b] p-5 transition hover:border-[#00c896]/20 sm:p-6">
                <h3 className="mb-4 flex items-center gap-2.5 text-base font-semibold text-white">
                  <Shield className="h-5 w-5 text-[#00c896]" />
                  Sécurité
                </h3>

                <div className="divide-y divide-white/6">
                  <div className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-white">
                        Authentification à deux facteurs
                      </div>
                      <div className="text-xs text-white/50">
                        Sécuriser les comptes administrateurs
                      </div>
                    </div>
                    <Toggle
                      active={twoFactor}
                      onToggle={() => setTwoFactor((v) => !v)}
                    />
                  </div>

                  <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-medium text-white">
                        Limite de tentatives de connexion
                      </div>
                      <div className="text-xs text-white/50">
                        Nombre maximum de tentatives avant blocage
                      </div>
                    </div>
                    <input
                      type="number"
                      value={maxAttempts}
                      onChange={(e) => setMaxAttempts(Number(e.target.value))}
                      className="w-20 rounded-lg border border-white/10 bg-[#0b0b1a] px-3 py-1.5 text-sm text-white outline-none focus:border-[#00c896]"
                    />
                  </div>

                  <div className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-medium text-white">
                        Session timeout
                      </div>
                      <div className="text-xs text-white/50">
                        Déconnexion automatique après inactivité
                      </div>
                    </div>
                    <select
                      value={sessionTimeout}
                      onChange={(e) => setSessionTimeout(e.target.value)}
                      className="w-full cursor-pointer rounded-lg border border-white/10 bg-[#0b0b1a] px-3 py-1.5 text-sm text-white outline-none focus:border-[#00c896] sm:min-w-[140px] sm:w-auto"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 heure</option>
                      <option value="120">2 heures</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <div className="text-sm font-medium text-white">
                        Journal des activités
                      </div>
                      <div className="text-xs text-white/50">
                        Conserver les logs des administrateurs
                      </div>
                    </div>
                    <Toggle
                      active={activityLog}
                      onToggle={() => setActivityLog((v) => !v)}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/6 bg-[#14142b] p-5 transition hover:border-[#00c896]/20 sm:p-6">
                <h3 className="mb-4 flex items-center gap-2.5 text-base font-semibold text-white">
                  <Lock className="h-5 w-5 text-[#00c896]" />
                  Gestion des accès
                </h3>

                <div className="divide-y divide-white/6">
                  {[
                    {
                      label: "Inscriptions automatiques",
                      desc: "Permettre les inscriptions sur la plateforme",
                      value: autoSignup,
                      toggle: () => setAutoSignup((v) => !v),
                    },
                    {
                      label: "Vérification email",
                      desc: "Vérifier les emails des nouveaux utilisateurs",
                      value: emailVerification,
                      toggle: () => setEmailVerification((v) => !v),
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      <div>
                        <div className="text-sm font-medium text-white">
                          {item.label}
                        </div>
                        <div className="text-xs text-white/50">{item.desc}</div>
                      </div>
                      <Toggle active={item.value} onToggle={item.toggle} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
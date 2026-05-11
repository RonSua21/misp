"use client";
import { useState, useEffect } from "react";
import { useTheme } from "@/components/providers/ThemeProvider";
import { createClient } from "@/lib/supabase/client";
import {
  Sun, Moon, Bell, Globe, ShieldCheck,
  Eye, EyeOff, CheckCircle2, AlertCircle,
} from "lucide-react";

interface NotifPrefs {
  applicationUpdates:  boolean;
  appointmentReminders: boolean;
  certificateUpdates:  boolean;
  announcements:       boolean;
}

interface AppSettings {
  notifications: NotifPrefs;
  language: "en" | "fil";
}

const DEFAULTS: AppSettings = {
  notifications: {
    applicationUpdates:  true,
    appointmentReminders: true,
    certificateUpdates:  true,
    announcements:       false,
  },
  language: "en",
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none
        ${checked ? "bg-makati-blue" : "bg-gray-300 dark:bg-slate-600"}`}
    >
      <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200
        ${checked ? "translate-x-4" : "translate-x-0.5"}`}
      />
    </button>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-slate-700 mb-4">
      <Icon className="w-4 h-4 text-makati-blue" />
      <h2 className="font-bold text-gray-900 dark:text-white">{title}</h2>
    </div>
  );
}

export default function SettingsClient({ userEmail }: { userEmail: string }) {
  const { theme, toggle } = useTheme();
  const [settings, setSettings]   = useState<AppSettings>(DEFAULTS);
  const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null);

  // Password change state
  const [newPass,     setNewPass]     = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("misp-settings");
      if (stored) setSettings(JSON.parse(stored));
    } catch {}
  }, []);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  function save(next: AppSettings) {
    setSettings(next);
    localStorage.setItem("misp-settings", JSON.stringify(next));
    showToast("Settings saved");
  }

  function updateNotif(key: keyof NotifPrefs, value: boolean) {
    save({ ...settings, notifications: { ...settings.notifications, [key]: value } });
  }

  function updateLanguage(lang: "en" | "fil") {
    save({ ...settings, language: lang });
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    if (newPass.length < 8) {
      showToast("Password must be at least 8 characters.", false); return;
    }
    if (newPass !== confirmPass) {
      showToast("Passwords do not match.", false); return;
    }
    setPassLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPass });
    setPassLoading(false);
    if (error) { showToast(error.message, false); return; }
    setNewPass(""); setConfirmPass("");
    showToast("Password updated successfully.");
  }

  return (
    <div className="space-y-4">

      {/* ── Appearance ─────────────────────────────── */}
      <div className="card p-6">
        <SectionHeader icon={Sun} title="Appearance" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-slate-100">Theme</p>
            <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">Choose how MISP looks for you</p>
          </div>
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-slate-700 rounded-lg p-1">
            <button
              onClick={() => theme === "dark" && toggle()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                ${theme === "light"
                  ? "bg-white dark:bg-slate-600 text-gray-900 dark:text-white shadow-sm"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"}`}
            >
              <Sun className="w-3.5 h-3.5" /> Light
            </button>
            <button
              onClick={() => theme === "light" && toggle()}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                ${theme === "dark"
                  ? "bg-slate-600 text-white shadow-sm"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"}`}
            >
              <Moon className="w-3.5 h-3.5" /> Dark
            </button>
          </div>
        </div>
      </div>

      {/* ── Notification Preferences ────────────────── */}
      <div className="card p-6">
        <SectionHeader icon={Bell} title="Notification Preferences" />
        <div className="space-y-4">
          {([
            { key: "applicationUpdates",   label: "Application Status Updates",  desc: "When your application status changes" },
            { key: "appointmentReminders", label: "Appointment Reminders",        desc: "Reminders before your scheduled appointments" },
            { key: "certificateUpdates",   label: "Certificate Status Updates",  desc: "When your certificate is ready for release" },
            { key: "announcements",        label: "MSWD Announcements",          desc: "News and updates from the MSWD office" },
          ] as const).map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{label}</p>
                <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">{desc}</p>
              </div>
              <Toggle
                checked={settings.notifications[key]}
                onChange={(v) => updateNotif(key, v)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Language ────────────────────────────────── */}
      <div className="card p-6">
        <SectionHeader icon={Globe} title="Language" />
        <div className="grid grid-cols-2 gap-3">
          {([
            { value: "en",  label: "English",  sub: "Default" },
            { value: "fil", label: "Filipino", sub: "Wikang Filipino" },
          ] as const).map(({ value, label, sub }) => (
            <button
              key={value}
              onClick={() => updateLanguage(value)}
              className={`flex flex-col items-start px-4 py-3 rounded-lg border-2 transition-colors text-left
                ${settings.language === value
                  ? "border-makati-blue bg-makati-blue-light dark:bg-blue-900/30"
                  : "border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50"}`}
            >
              <p className={`text-sm font-semibold ${settings.language === value ? "text-makati-blue dark:text-blue-400" : "text-gray-700 dark:text-slate-300"}`}>
                {label}
              </p>
              <p className="text-xs text-gray-400 dark:text-slate-500">{sub}</p>
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 dark:text-slate-500 mt-3">
          Full Filipino translation is coming soon.
        </p>
      </div>

      {/* ── Account Security ────────────────────────── */}
      <div className="card p-6">
        <SectionHeader icon={ShieldCheck} title="Account Security" />
        <p className="text-xs text-gray-400 dark:text-slate-500 mb-4">
          Signed in as <span className="font-medium text-gray-600 dark:text-slate-400">{userEmail}</span>
        </p>
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div>
            <label className="label">New Password</label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                placeholder="Min. 8 characters"
                className="input pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="label">Confirm New Password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                placeholder="Repeat new password"
                className="input pr-10"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(p => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-300"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={passLoading || !newPass || !confirmPass}
            className="btn-primary mt-1"
          >
            {passLoading ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>

      {/* ── Toast ───────────────────────────────────── */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl text-sm font-medium transition-all
          ${toast.ok
            ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
            : "bg-red-600 text-white"}`}
        >
          {toast.ok
            ? <CheckCircle2 className="w-4 h-4 shrink-0" />
            : <AlertCircle className="w-4 h-4 shrink-0" />}
          {toast.msg}
        </div>
      )}
    </div>
  );
}

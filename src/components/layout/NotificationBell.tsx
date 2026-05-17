"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Bell, X, CheckCheck, Megaphone, AlertTriangle, FileText } from "lucide-react";

type NotificationType = "APPLICATION_UPDATE" | "ANNOUNCEMENT" | "DISASTER_ALERT";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
}

const TYPE_CONFIG: Record<NotificationType, { icon: React.ElementType; color: string; bg: string }> = {
  APPLICATION_UPDATE: { icon: FileText,      color: "text-blue-300",  bg: "bg-blue-400/20" },
  ANNOUNCEMENT:       { icon: Megaphone,      color: "text-green-300", bg: "bg-green-400/20" },
  DISASTER_ALERT:     { icon: AlertTriangle,  color: "text-red-300",   bg: "bg-red-400/20" },
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen]               = useState(false);
  const [notifications, setNotifs]    = useState<Notification[]>([]);
  const [unreadCount, setUnread]      = useState(0);
  const [loading, setLoading]         = useState(false);
  const panelRef                      = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) return;
      const data = await res.json();
      setNotifs(data.notifications ?? []);
      setUnread(data.unreadCount ?? 0);
    } catch {
      // silently ignore network errors
    }
  }, []);

  // Fetch on mount and every 60 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60_000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function markRead(id: string) {
    setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    setUnread((c) => Math.max(0, c - 1));
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  async function markAllRead() {
    setLoading(true);
    setNotifs((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnread(0);
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true }),
    });
    setLoading(false);
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell trigger */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 rounded-lg hover:bg-white/10 transition-colors"
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <Bell className="w-5 h-5 text-white/60" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 min-w-[16px] h-4 flex items-center justify-center text-[10px] font-bold text-white bg-red-500 rounded-full px-0.5">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-makati-blue/80 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/15 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <h3 className="font-bold text-white text-sm">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  disabled={loading}
                  className="flex items-center gap-1 text-xs text-makati-gold hover:underline disabled:opacity-50"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  Mark all read
                </button>
              )}
              <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white/70">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[360px] overflow-y-auto divide-y divide-white/5">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="w-8 h-8 text-white/20 mx-auto mb-2" />
                <p className="text-sm text-white/40">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => {
                const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.ANNOUNCEMENT;
                const Icon = cfg.icon;
                return (
                  <button
                    key={n.id}
                    onClick={() => !n.isRead && markRead(n.id)}
                    className={`w-full text-left px-4 py-3 flex gap-3 transition-colors ${
                      n.isRead ? "opacity-50" : "hover:bg-white/10"
                    }`}
                  >
                    <div className={`mt-0.5 w-8 h-8 rounded-full ${cfg.bg} flex items-center justify-center shrink-0`}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm leading-tight text-white ${!n.isRead ? "font-semibold" : "font-normal"}`}>
                          {n.title}
                        </p>
                        {!n.isRead && (
                          <span className="w-2 h-2 rounded-full bg-makati-gold shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-xs text-white/50 mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-[10px] text-white/30 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

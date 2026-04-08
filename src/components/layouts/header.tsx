"use client";

import { useUiStore } from "@/stores/ui-store";
import { useTheme } from "@/components/providers/theme-provider";
import { useNotifications, useMarkNotificationsRead } from "@/lib/hooks/use-notifications";
import { GlobalSearch } from "@/components/layouts/global-search";
import { Menu, Bell, LogOut, Sun, Moon } from "lucide-react";
import { signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

export function Header() {
  const { toggleSidebar } = useUiStore();
  const { resolvedTheme, toggleTheme } = useTheme();
  const { data } = useNotifications();
  const { mutate: markRead } = useMarkNotificationsRead();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const unreadCount = data?.unreadCount ?? 0;
  const notifications = data?.data ?? [];

  // Close panel on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function handleBellClick() {
    setOpen((prev) => !prev);
    if (!open && unreadCount > 0) {
      markRead(undefined);
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-900 lg:px-6">
      <button
        onClick={toggleSidebar}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1 px-4">
        <GlobalSearch />
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label={resolvedTheme === "dark" ? "Passer en mode clair" : "Passer en mode sombre"}
        >
          {resolvedTheme === "dark" ? (
            <Sun className="h-5 w-5" aria-hidden="true" />
          ) : (
            <Moon className="h-5 w-5" aria-hidden="true" />
          )}
        </button>

        {/* Notification bell */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={handleBellClick}
            className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label={`Notifications${unreadCount > 0 ? ` — ${unreadCount} non lues` : ""}`}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-500 px-0.5 text-[10px] font-bold leading-none text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-full z-50 mt-1 w-80 rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
              <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  Notifications
                </p>
              </div>
              <ul className="max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <li className="px-4 py-6 text-center text-sm text-gray-500">
                    Aucune notification
                  </li>
                ) : (
                  notifications.slice(0, 10).map((n) => (
                    <li
                      key={n.id}
                      className={`border-b border-gray-100 px-4 py-3 last:border-0 dark:border-gray-800 ${
                        !n.read ? "bg-blue-50 dark:bg-blue-900/10" : ""
                      }`}
                    >
                      {n.link ? (
                        <a
                          href={n.link}
                          className="block"
                          onClick={() => setOpen(false)}
                        >
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {n.title}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">{n.body}</p>
                        </a>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {n.title}
                          </p>
                          <p className="mt-0.5 text-xs text-gray-500">{n.body}</p>
                        </>
                      )}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Se déconnecter"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}

"use client";

import { useUiStore } from "@/stores/ui-store";
import { useTheme } from "@/components/providers/theme-provider";
import { Menu, Bell, LogOut, Sun, Moon } from "lucide-react";
import { signOut } from "next-auth/react";

export function Header() {
  const { toggleSidebar } = useUiStore();
  const { resolvedTheme, toggleTheme } = useTheme();

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-900 lg:px-6">
      <button
        onClick={toggleSidebar}
        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
        aria-label="Ouvrir le menu"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="flex-1" />

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

        <button
          className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </button>

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

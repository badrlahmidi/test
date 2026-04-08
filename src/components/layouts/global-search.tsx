"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Search, Users, FileText, FileCheck, Package, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SearchResult } from "@/app/api/v1/search/route";

const typeIcon: Record<SearchResult["type"], React.ElementType> = {
  client: Users,
  invoice: FileText,
  quote: FileCheck,
  product: Package,
};

const typeLabel: Record<SearchResult["type"], string> = {
  client: "Client",
  invoice: "Facture",
  quote: "Devis",
  product: "Produit",
};

const typeColor: Record<SearchResult["type"], string> = {
  client: "bg-purple-100 text-purple-600",
  invoice: "bg-blue-100 text-blue-600",
  quote: "bg-amber-100 text-amber-600",
  product: "bg-green-100 text-green-600",
};

function useGlobalSearch(q: string) {
  return useQuery<{ results: SearchResult[] }>({
    queryKey: ["global-search", q],
    queryFn: async () => {
      const res = await fetch(`/api/v1/search?q=${encodeURIComponent(q)}`);
      if (!res.ok) throw new Error("Erreur recherche");
      return res.json();
    },
    enabled: q.trim().length >= 2,
    staleTime: 10_000,
  });
}

export function GlobalSearch() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isFetching } = useGlobalSearch(query);
  const results = useMemo(() => data?.results ?? [], [data]);

  // Cmd+K / Ctrl+K to open
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery("");
      setSelected(0);
    }
  }, [open]);

  // Keyboard navigation inside modal
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelected((s) => Math.min(s + 1, results.length - 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelected((s) => Math.max(s - 1, 0));
      } else if (e.key === "Enter" && results[selected]) {
        e.preventDefault();
        router.push(results[selected].href);
        setOpen(false);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    },
    [results, selected, router],
  );

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-500 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        aria-label="Recherche globale (Ctrl+K)"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Rechercher...</span>
        <kbd className="hidden rounded border border-gray-200 bg-white px-1 py-0.5 text-xs text-gray-400 dark:border-gray-700 dark:bg-gray-900 sm:inline">
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16"
      role="dialog"
      aria-modal="true"
      aria-label="Recherche globale"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative w-full max-w-xl rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 dark:border-gray-700">
          {isFetching ? (
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          ) : (
            <Search className="h-5 w-5 text-gray-400" />
          )}
          <input
            ref={inputRef}
            type="text"
            placeholder="Chercher un client, une facture, un produit..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(0);
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-white"
          />
          <kbd className="rounded border border-gray-200 bg-gray-50 px-1.5 py-0.5 text-xs text-gray-400 dark:border-gray-700 dark:bg-gray-800">
            ESC
          </kbd>
        </div>

        {/* Results */}
        {results.length > 0 && (
          <ul className="max-h-[360px] overflow-y-auto p-2">
            {results.map((result, i) => {
              const Icon = typeIcon[result.type];
              return (
                <li key={result.id}>
                  <button
                    className={cn(
                      "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                      i === selected
                        ? "bg-blue-50 dark:bg-blue-900/20"
                        : "hover:bg-gray-50 dark:hover:bg-gray-800",
                    )}
                    onClick={() => {
                      router.push(result.href);
                      setOpen(false);
                    }}
                    onMouseEnter={() => setSelected(i)}
                  >
                    <span className={cn("flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg", typeColor[result.type])}>
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                        {result.title}
                      </p>
                      <p className="truncate text-xs text-gray-500">{result.subtitle}</p>
                    </div>
                    <span className="flex-shrink-0 text-xs text-gray-400">
                      {typeLabel[result.type]}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        {query.length >= 2 && !isFetching && results.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-gray-500">
            Aucun résultat pour &ldquo;{query}&rdquo;
          </p>
        )}

        {query.length < 2 && (
          <p className="px-4 py-4 text-center text-xs text-gray-400">
            Saisissez au moins 2 caractères pour lancer la recherche
          </p>
        )}

        <div className="border-t border-gray-100 px-4 py-2 dark:border-gray-700">
          <p className="text-xs text-gray-400">
            <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 text-xs dark:border-gray-700 dark:bg-gray-800">↑↓</kbd>{" "}
            naviguer &nbsp;
            <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 text-xs dark:border-gray-700 dark:bg-gray-800">↵</kbd>{" "}
            ouvrir &nbsp;
            <kbd className="rounded border border-gray-200 bg-gray-50 px-1 py-0.5 text-xs dark:border-gray-700 dark:bg-gray-800">ESC</kbd>{" "}
            fermer
          </p>
        </div>
      </div>
    </div>
  );
}

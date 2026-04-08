"use client";

import * as React from "react";
import Papa from "papaparse";
import { Modal } from "@/components/ui/modal";

interface ImportError {
  row: number;
  message: string;
}

interface CsvImportModalProps {
  open: boolean;
  onClose: () => void;
  endpoint: string;
  title: string;
}

export function CsvImportModal({ open, onClose, endpoint, title }: CsvImportModalProps) {
  const [rows, setRows] = React.useState<Record<string, string>[]>([]);
  const [errors, setErrors] = React.useState<ImportError[]>([]);
  const [result, setResult] = React.useState<{ created: number; errors: ImportError[] } | null>(null);
  const [loading, setLoading] = React.useState(false);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setResult(null);
    setErrors([]);
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => setRows(res.data),
    });
  }

  async function handleImport() {
    setLoading(true);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      setResult(data);
      setErrors(data.errors ?? []);
    } finally {
      setLoading(false);
    }
  }

  const preview = rows.slice(0, 5);
  const columns = preview[0] ? Object.keys(preview[0]) : [];

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <div className="space-y-4">
        <input
          type="file"
          accept=".csv"
          onChange={handleFile}
          className="block w-full text-sm text-gray-500 file:mr-4 file:rounded-md file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-700 hover:file:bg-blue-100"
        />

        {preview.length > 0 && (
          <div className="overflow-x-auto rounded border">
            <table className="w-full text-xs">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((col) => (
                    <th key={col} className="px-2 py-1 text-left font-medium text-gray-600">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((row, i) => (
                  <tr key={i} className="border-t">
                    {columns.map((col) => (
                      <td key={col} className="px-2 py-1 text-gray-700">{row[col]}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {rows.length > 5 && (
              <p className="px-2 py-1 text-xs text-gray-400">+{rows.length - 5} autres lignes</p>
            )}
          </div>
        )}

        {errors.length > 0 && (
          <ul className="space-y-1 text-xs text-red-600">
            {errors.map((e) => (
              <li key={e.row}>Ligne {e.row}: {e.message}</li>
            ))}
          </ul>
        )}

        {result && (
          <p className="text-sm text-green-600">{result.created} enregistrement(s) importé(s).</p>
        )}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100">
            Annuler
          </button>
          <button
            onClick={handleImport}
            disabled={rows.length === 0 || loading}
            className="rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Import..." : "Importer"}
          </button>
        </div>
      </div>
    </Modal>
  );
}

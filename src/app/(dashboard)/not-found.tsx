import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
      <div className="rounded-full bg-gray-100 p-4">
        <FileQuestion className="h-8 w-8 text-gray-500" aria-hidden="true" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900">
        Page introuvable
      </h2>
      <p className="text-gray-500">
        La ressource demandée n&apos;existe pas ou a été supprimée.
      </p>
      <Link
        href="/overview"
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        Retour au tableau de bord
      </Link>
    </div>
  );
}

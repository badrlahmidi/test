import { SkeletonTable } from "@/components/ui";

export default function ListPageLoading() {
  return (
    <div>
      <div className="mb-6 h-8 w-48 animate-pulse rounded bg-gray-200" />
      <SkeletonTable rows={8} />
    </div>
  );
}

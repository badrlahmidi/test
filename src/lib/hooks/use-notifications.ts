import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  read: boolean;
  createdAt: string;
}

interface NotificationsResponse {
  data: Notification[];
  unreadCount: number;
}

async function fetchNotifications(unreadOnly = false): Promise<NotificationsResponse> {
  const url = unreadOnly
    ? "/api/v1/notifications?unread=true"
    : "/api/v1/notifications";
  const res = await fetch(url);
  if (!res.ok) throw new Error("Erreur chargement notifications");
  return res.json();
}

async function markRead(ids?: string[]): Promise<void> {
  const res = await fetch("/api/v1/notifications/mark-read", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(ids ? { ids } : {}),
  });
  if (!res.ok) throw new Error("Erreur mise à jour notifications");
}

export function useNotifications(unreadOnly = false) {
  return useQuery({
    queryKey: ["notifications", { unreadOnly }],
    queryFn: () => fetchNotifications(unreadOnly),
    refetchInterval: 60_000, // poll every 60 s
    staleTime: 30_000,
  });
}

export function useMarkNotificationsRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: markRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

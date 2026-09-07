"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useMyNotificationsQuery,
  useMarkAllNotificationsAsReadMutation,
} from "@/hooks/queries/use-notifications-queries";
import { queryKeys } from "@/constants/query-keys";

export function NotificationsAutoRead() {
  const queryClient = useQueryClient();
  const { data: notifications } = useMyNotificationsQuery();
  const { mutate: markAllAsRead } = useMarkAllNotificationsAsReadMutation();
  const hasRun = useRef(false);

  useEffect(() => {
    if (!notifications || hasRun.current) return;

    const unreadCount = notifications.filter((n) => !n.readAt && !n.read_at).length;

    if (unreadCount > 0) {
      hasRun.current = true;
      markAllAsRead(undefined, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["notifications"] });
          queryClient.invalidateQueries({
            queryKey: queryKeys.notifications.myNotifications(),
          });
        },
      });
    }
  }, [notifications, markAllAsRead, queryClient]);

  return null;
}

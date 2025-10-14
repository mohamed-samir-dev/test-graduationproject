import { useState, useEffect, useCallback } from "react";
import { Notification, getNotifications } from "@/lib/services/notificationService";

export const useNotifications = (employeeId: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const notifications = await getNotifications(employeeId);
      setNotifications(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [employeeId]);

  useEffect(() => {
    if (employeeId) {
      fetchNotifications();
    }
  }, [employeeId, fetchNotifications]);

  return { notifications, loading, refetch: fetchNotifications };
};
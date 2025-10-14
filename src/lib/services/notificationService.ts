import { collection, addDoc, query, where, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

export interface Notification {
  id: string;
  employeeId: string;
  message: string;
  type: 'leave_approved' | 'leave_rejected';
  isRead: boolean;
  createdAt: string;
}

export const createNotification = async (employeeId: string, message: string, type: 'leave_approved' | 'leave_rejected'): Promise<void> => {
  try {
    const notificationsCollection = collection(db, "notifications");
    await addDoc(notificationsCollection, {
      employeeId,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    throw new Error("Failed to create notification");
  }
};

export const getNotifications = async (employeeId: string): Promise<Notification[]> => {
  try {
    const notificationsCollection = collection(db, "notifications");
    const q = query(notificationsCollection, where("employeeId", "==", employeeId));
    const snapshot = await getDocs(q);
    const notifications = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
    return notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return [];
  }
};

export const markAsRead = async (notificationId: string): Promise<void> => {
  try {
    const notificationRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationRef, { isRead: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
};
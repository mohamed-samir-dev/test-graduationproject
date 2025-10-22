export interface User {
  id: string;
  numericId?: number;
  name: string;
  username: string;
  email?: string;
  image: string;
  password?: string;
  department?: string;
  Department?: string;
  jobTitle?: string;
  status?: 'Active' | 'OnLeave' | 'Inactive';
  salary?: number;
  phone?: string;
  // Notification preferences
  systemAnnouncements?: boolean;
  leaveStatusUpdates?: boolean;
  attendanceReminders?: boolean;
}
"use client";

import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import NavigationBlocker from "@/components/NavigationBlocker";
import Toast from "@/components/common/Toast";
import { User } from "@/lib/types";

interface LeaveRequestLayoutProps {
  user: User;
  toast: { message: string; type: 'success' | 'error' | 'warning'; isVisible: boolean };
  onCloseToast: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function LeaveRequestLayout({ 
  user, 
  toast, 
  onCloseToast, 
  onLogout, 
  children 
}: LeaveRequestLayoutProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Inter',sans-serif]">
      <NavigationBlocker />
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={onCloseToast}
      />
      <Navbar 
        user={user}
        title="Attendance Tracker"
        onUserClick={onLogout}
        showNavigation
        navigationItems={[
          { label: "Dashboard", href: "#", onClick: () => router.push("/userData") },
          { label: "Reports", href: "#" },
          { label: "Settings", href: "#" }
        ]}
      />

      <div className="max-w-full mx-auto p-3 sm:p-6">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
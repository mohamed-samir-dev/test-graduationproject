"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import ProfileSection from "@/components/dashboard/ProfileSection";
import AttendanceSummary from "@/components/dashboard/AttendanceSummary";
import AttendanceChart from "@/components/dashboard/AttendanceChart";
import NavigationBlocker from "@/components/NavigationBlocker";

export default function DashboardPage() {
  const { user, mounted, logout } = useAuth();
  const router = useRouter();

  if (!mounted || !user) {
    return null;
  }

  const handleTakeAttendance = () => {
    router.push("/camera");
  };

  const handleRequestLeave = () => {
    alert("Leave request functionality coming soon!");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Inter',sans-serif]">
      <NavigationBlocker />
      <Navbar 
        user={user}
        title="Attendance Tracker"
        onUserClick={logout}
        showNavigation
        navigationItems={[
          { label: "Dashboard", href: "#" },
          { label: "Reports", href: "#" },
          { label: "Settings", href: "#" }
        ]}
      />

      <div className="max-w-full mx-auto p-6">
        <ProfileSection 
          user={user}
          onTakePhoto={handleTakeAttendance}
          onRequestLeave={handleRequestLeave}
        />

        <AttendanceSummary />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AttendanceChart 
            title="Attendance Trends"
            percentage={95}
            improvement={5}
            type="line"
          />
          <AttendanceChart 
            title="Monthly Performance"
            percentage={85}
            improvement={10}
            type="bar"
          />
        </div>
      </div>
    </div>
  );
}

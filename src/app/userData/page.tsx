"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import ProfileSection from "@/components/dashboard/ProfileSection";
import AttendanceSummary from "@/components/dashboard/AttendanceSummary";
import AttendanceChart from "@/components/dashboard/AttendanceChart";
import NavigationBlocker from "@/components/NavigationBlocker";

export default function DashboardPage() {
  const { user, mounted, logout, refreshUserData } = useAuth();
  const router = useRouter();

  // Redirect admin to admin dashboard and refresh user data
  useEffect(() => {
    if (user && user.numericId === 1) {
      router.push("/admin");
    }
  }, [user, router]);

  // Refresh user data on component mount
  useEffect(() => {
    if (mounted && user && refreshUserData) {
      refreshUserData();
    }
  }, [mounted, user, refreshUserData]);

  if (!mounted || !user) {
    return null;
  }

  if (user && user.numericId === 1) {
    return null;
  }

  const handleTakeAttendance = () => {
    router.push("/camera");
  };

  const handleRequestLeave = () => {
    router.push("/leaveRequest");
  };

  const handleSettings = () => {
    router.push("/profile");
  };

  const handleReports = () => {
    // Future implementation
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
          { label: "Dashboard", onClick: () => router.push("/userData") },
          { label: "Reports", onClick: handleReports },
          { label: "Settings", onClick: handleSettings }
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

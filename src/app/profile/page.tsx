"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import ProfileSettingsForm from "@/components/profile/ProfileSettingsForm";
import NavigationBlocker from "@/components/NavigationBlocker";

export default function ProfilePage() {
  const { user, mounted, logout, refreshUserData } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (mounted && user && refreshUserData) {
      refreshUserData();
    }
  }, [mounted, user, refreshUserData]);

  useEffect(() => {
    if (user && user.numericId === 1) {
      router.push("/admin");
    }
  }, [user, router]);

  if (!mounted || !user) {
    return null;
  }

  if (user && user.numericId === 1) {
    return null;
  }

  const handleDashboard = () => {
    router.push("/userData");
  };

  const handleReports = () => {
    // Future implementation
  };

  const handleSettings = () => {
    router.push("/profile");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Inter',sans-serif]">
      <NavigationBlocker />
      <Navbar 
        user={user}
        title="Profile Settings"
        onUserClick={logout}
        showNavigation
        navigationItems={[
          { label: "Dashboard", onClick: handleDashboard },
          { label: "Reports", onClick: handleReports },
          { label: "Settings", onClick: handleSettings }
        ]}
      />

      <div className="max-w-full mx-auto p-6">
        <ProfileSettingsForm user={user} />
      </div>
    </div>
  );
}
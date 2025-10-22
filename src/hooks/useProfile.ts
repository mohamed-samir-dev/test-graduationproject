import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function useProfile() {
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

  const handleDashboard = () => {
    router.push("/userData");
  };

  const handleReports = () => {
    // Future implementation
  };

  const handleSettings = () => {
    router.push("/profile");
  };

  return {
    user,
    mounted,
    logout,
    handleDashboard,
    handleReports,
    handleSettings
  };
}
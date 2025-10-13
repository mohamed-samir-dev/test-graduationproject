"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DocumentData } from "firebase/firestore";

export function useAuth() {
  const [user, setUser] = useState<DocumentData | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);

    if (typeof window !== "undefined") {
      const savedUser = sessionStorage.getItem("attendanceUser");
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      } else {
        router.push("/login");
      }
    }
  }, [router]);

  const clearSession = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("attendanceUser");
      sessionStorage.removeItem("sessionTime");
      localStorage.removeItem("showUserData");
      localStorage.removeItem("totalHoursWorked");
    }
  };

  const logout = () => {
    clearSession();
    router.push("/login");
  };

  return {
    user,
    mounted,
    logout,
    clearSession
  };
}
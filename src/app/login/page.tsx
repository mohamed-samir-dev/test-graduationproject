"use client";

import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useRouter } from "next/navigation";
import { LoginFormData } from "@/lib/types";
import AppLogo from "@/components/layout/AppLogo";
import PageHeader from "@/components/layout/PageHeader";
import LoginForm from "@/components/auth/LoginForm";
import AuthDivider from "@/components/auth/AuthDivider";
import FacialRecognitionButton from "@/components/auth/FacialRecognitionButton";
import Card from "@/components/common/Card";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [faceLoading, setFaceLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const handleLogin = async (formData: LoginFormData) => {
    setError("");
    setLoading(true);

    try {
      const q = query(
        collection(db, "users"),
        where("username", "==", formData.email),
        where("password", "==", formData.password)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        const currentTime = new Date().getTime();

        if (typeof window !== "undefined") {
          sessionStorage.setItem("attendanceUser", JSON.stringify(userData));
          sessionStorage.setItem("sessionTime", currentTime.toString());
        }
        
        router.push("/userData");
      } else {
        setError("Invalid username or password");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const handleFacialRecognition = () => {
    setFaceLoading(true);
    router.push("/camera");
  };

  const handleClearSession = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("attendanceUser");
      sessionStorage.removeItem("sessionTime");
      localStorage.removeItem("showUserData");
      localStorage.removeItem("totalHoursWorked");
    }
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 font-['Inter',sans-serif]">
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6">
        <AppLogo size="sm" />
      </div>

      <div className="w-full max-w-lg">
        <PageHeader 
          title="Welcome Back" 
          subtitle="Log in to mark your attendance." 
        />

        <Card>
          <LoginForm 
            onSubmit={handleLogin}
            loading={loading}
            error={error}
          />
          
          <AuthDivider />
          
          <FacialRecognitionButton onClick={handleFacialRecognition} loading={faceLoading} />
          
          <p className="text-center text-xs sm:text-sm text-gray-500 mt-3 sm:mt-4 leading-relaxed">
            Position your face in the frame with good lighting for accurate recognition.
          </p>
          
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={handleClearSession}
              className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 underline cursor-pointer"
            >
              Clear saved session
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
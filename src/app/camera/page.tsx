"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useCamera } from "@/hooks/useCamera";
import { detectFace } from "@/utils/faceDetection";
import Navbar from "@/components/layout/Navbar";
import CameraPreview from "@/components/camera/CameraPreview";
import CameraControls from "@/components/camera/CameraControls";
import Card from "@/components/common/Card";
import NavigationBlocker from "@/components/NavigationBlocker";

export default function CameraPage() {
  const { user, mounted } = useAuth();
  const { cameraActive, isProcessing, videoRef, canvasRef, startCamera, stopCamera, captureImage } = useCamera();
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [error, setError] = useState("");
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [exhaustedAttempts, setExhaustedAttempts] = useState(false);
  const [multipleFaces, setMultipleFaces] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (mounted && !user) {
      router.push("/login");
    }
  }, [mounted, user, router]);

  const handleStartCamera = async () => {
    try {
      setError("");
      await startCamera();
    } catch (error) {
      setError((error as Error).message);
    }
  };

  const handleCaptureAndDetect = async () => {
    const imageData = captureImage();
    if (!imageData) {
      setError("Camera not ready. Please start camera first.");
      return;
    }

    try {
      setError("");
      setMultipleFaces(false);
      const result = await detectFace(imageData);

      if (result.success && result.face_detected) {
        setAttendanceMarked(true);
        stopCamera();
        
        if (typeof window !== "undefined") {
          const currentHours = parseInt(localStorage.getItem("totalHoursWorked") || "0");
          localStorage.setItem("totalHoursWorked", (currentHours + 1).toString());
          
          const attendanceTime = new Date().toISOString();
          localStorage.setItem("lastAttendance", attendanceTime);
        }

        setTimeout(() => {
          router.push("/userData");
        }, 2500);
      } else if (result.error_type === 'multiple_faces') {
        setMultipleFaces(true);
      } else {
        const newAttempts = attemptsRemaining - 1;
        setAttemptsRemaining(newAttempts);
        
        if (newAttempts === 0) {
          setExhaustedAttempts(true);
          stopCamera();
          setTimeout(() => {
            localStorage.removeItem("attendanceUser");
            localStorage.removeItem("sessionTime");
            router.push("/login");
          }, 3000);
        } else {
          setError("face_not_recognized");
        }
      }
    } catch (error) {
      console.error("Face detection error:", error);
      setError("Connection error. Please check if the Python server is running on localhost:5000.");
    }
  };

  const handleRetry = () => {
    setError("");
    setMultipleFaces(false);
    setAttendanceMarked(false);
    if (cameraActive) {
      stopCamera();
    }
    handleStartCamera();
  };

  const handleDashboardClick = () => {
    if (cameraActive) {
      stopCamera();
    }
    router.push("/userData");
  };

  if (!mounted || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] font-sans">
      <NavigationBlocker />
      <Navbar 
        user={user}
        showNavigation
        navigationItems={[
          { label: "Dashboard", href: "/userData", onClick: handleDashboardClick },
          { label: "Reports", href: "#" }
        ]}
      />

      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-3 sm:p-6 relative">
        <Card className="w-full max-w-sm sm:max-w-md">
          <h2 className="text-xl sm:text-2xl font-bold text-[#1A1A1A] text-center mb-2">
            Mark Your Attendance
          </h2>
          
          <p className="text-sm sm:text-base text-[#555] text-center mb-6 sm:mb-8">
            Position your face within the frame for recognition.
          </p>

          <div className="mb-4 sm:mb-6">
            <CameraPreview
              ref={videoRef}
              cameraActive={cameraActive}
              isProcessing={isProcessing}
              attendanceMarked={attendanceMarked}
              error={error}
              exhaustedAttempts={exhaustedAttempts}
              attemptsRemaining={attemptsRemaining}
              multipleFaces={multipleFaces}
            />
          </div>
          
          <canvas ref={canvasRef} className="hidden" />

          <CameraControls
            cameraActive={cameraActive}
            attendanceMarked={attendanceMarked}
            isProcessing={isProcessing}
            error={error}
            exhaustedAttempts={exhaustedAttempts}
            attemptsRemaining={attemptsRemaining}
            multipleFaces={multipleFaces}
            onStartCamera={handleStartCamera}
            onCaptureAndDetect={handleCaptureAndDetect}
            onRetry={handleRetry}
          />
        </Card>
      </div>
    </div>
  );
}
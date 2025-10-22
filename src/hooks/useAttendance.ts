import { useState } from "react";
import { useRouter } from "next/navigation";
import { detectFace } from "@/utils/faceDetection";

export function useAttendance() {
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [error, setError] = useState("");
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [exhaustedAttempts, setExhaustedAttempts] = useState(false);
  const [multipleFaces, setMultipleFaces] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const router = useRouter();

  const processAttendance = async (imageData: string, stopCamera: () => void) => {
    try {
      setDetecting(true);
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
    } finally {
      setDetecting(false);
    }
  };

  const resetState = () => {
    setError("");
    setMultipleFaces(false);
    setAttendanceMarked(false);
  };

  return {
    attendanceMarked,
    error,
    attemptsRemaining,
    exhaustedAttempts,
    multipleFaces,
    detecting,
    processAttendance,
    resetState,
    setError
  };
}
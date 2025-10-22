"use client";

import { useCamera } from "@/hooks/useCamera";
import { useAttendance } from "@/hooks/useAttendance";
import CameraPreview from "./CameraPreview";
import CameraControls from "./CameraControls";
import Card from "@/components/common/Card";

export default function CameraContainer() {
  const { cameraActive, isProcessing, videoRef, canvasRef, startCamera, stopCamera, captureImage } = useCamera();
  const { 
    attendanceMarked, 
    error, 
    attemptsRemaining, 
    exhaustedAttempts, 
    multipleFaces, 
    detecting, 
    processAttendance, 
    resetState, 
    setError 
  } = useAttendance();

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
    await processAttendance(imageData, stopCamera);
  };

  const handleRetry = () => {
    resetState();
    if (cameraActive) {
      stopCamera();
    }
    handleStartCamera();
  };

  return (
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
        isProcessing={isProcessing || detecting}
        error={error}
        exhaustedAttempts={exhaustedAttempts}
        attemptsRemaining={attemptsRemaining}
        multipleFaces={multipleFaces}
        onStartCamera={handleStartCamera}
        onCaptureAndDetect={handleCaptureAndDetect}
        onRetry={handleRetry}
      />
    </Card>
  );
}
interface CameraControlsProps {
  cameraActive: boolean;
  attendanceMarked: boolean;
  isProcessing: boolean;
  error: string;
  exhaustedAttempts: boolean;
  attemptsRemaining: number;
  multipleFaces: boolean;
  onStartCamera: () => void;
  onCaptureAndDetect: () => void;
  onRetry: () => void;
}

export default function CameraControls({
  cameraActive,
  attendanceMarked,
  isProcessing,
  error,
  exhaustedAttempts,
  attemptsRemaining,
  multipleFaces,
  onStartCamera,
  onCaptureAndDetect,
  onRetry
}: CameraControlsProps) {
  return (
    <div className="space-y-3">
      {!cameraActive && !attendanceMarked && (
        <button
          onClick={onStartCamera}
          disabled={isProcessing}
          className="w-full bg-[#2563EB] hover:bg-blue-700 disabled:bg-gray-400 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-medium text-sm sm:text-base transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {isProcessing ? "Starting Camera..." : "Start Camera"}
        </button>
      )}
      
      {cameraActive && !attendanceMarked && (
        <button
          onClick={onCaptureAndDetect}
          disabled={isProcessing}
          className="w-full bg-[#2563EB] hover:bg-blue-700 disabled:bg-gray-400 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-medium text-sm sm:text-base transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {isProcessing ? "Processing..." : "Capture & Detect Face"}
        </button>
      )}
      
      {(error || multipleFaces) && !exhaustedAttempts && (
        <button
          onClick={onRetry}
          className="w-full bg-[#2563EB] hover:bg-blue-700 text-white py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl font-medium text-sm sm:text-base transition-colors cursor-pointer"
        >
          Retry
        </button>
      )}

      {error && !exhaustedAttempts && !multipleFaces && (
        <div className="mt-3 sm:mt-4 text-center">
          <p className="text-xs sm:text-sm text-[#666]">
            Attempts remaining: {attemptsRemaining}
          </p>
        </div>
      )}
    </div>
  );
}
"use client";

import { Camera } from "lucide-react";

interface FacialRecognitionButtonProps {
  onClick: () => void;
}

export default function FacialRecognitionButton({ onClick }: FacialRecognitionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-gray-100 text-gray-700 py-2.5 sm:py-3 px-4 rounded-lg font-medium text-sm sm:text-base hover:bg-gray-200 focus:ring-4 focus:ring-gray-200 transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer transform hover:scale-[1.02] active:scale-[0.98]"
    >
      <Camera className="w-4 h-4 sm:w-5 sm:h-5" />
      <span>Use Facial Recognition</span>
    </button>
  );
}
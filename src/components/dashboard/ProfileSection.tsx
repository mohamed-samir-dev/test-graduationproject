"use client";

import Image from "next/image";
import { Calendar, Camera } from "lucide-react";
import { DocumentData } from "firebase/firestore";

interface ProfileSectionProps {
  user: DocumentData;
  onRequestLeave?: () => void;
  onTakePhoto: () => void;
}

export default function ProfileSection({ user, onRequestLeave, onTakePhoto }: ProfileSectionProps) {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-8 mb-8">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-6 lg:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-6 space-y-4 sm:space-y-0">
          <div className="relative flex justify-center sm:justify-start">
            <Image
              src={user.image}
              alt={user.name}
              width={120}
              height={120}
              className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full object-cover ring-4 ring-blue-100 shadow-lg"
              unoptimized
            />
          </div>
          <div className="text-center sm:text-left">
            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#1A1A1A] mb-2">
              {user.name || "Sophia Clark"}
            </h2>
            <p className="text-xs sm:text-sm text-[#555] mb-1">
              Employee ID: {user.numericId || "12345"}
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          {onRequestLeave && (
            <button 
              onClick={onRequestLeave}
              className="bg-[#2563EB] cursor-pointer text-white px-6 py-3 rounded-xl font-medium text-base hover:bg-blue-700  flex items-center justify-center space-x-2 transition-all duration-200 transform "
            >
              <Calendar className="w-5 h-5" />
              <span>Request Leave</span>
            </button>
          )}
          <button
            onClick={onTakePhoto}
            className="bg-[#2563EB] cursor-pointer text-white px-6 py-3 rounded-xl font-medium text-base hover:bg-blue-700  flex items-center justify-center space-x-2 transition-all duration-200 transform"
          >
            <Camera className="w-5 h-5" />
            <span>Taking attendance</span>
          </button>
        </div>
      </div>
    </div>
  );
}
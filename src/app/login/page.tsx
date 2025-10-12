"use client";

import { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  DocumentData,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import Image from "next/image";
import { Camera, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [user, setUser] = useState<DocumentData | null>(null);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [showUserData, setShowUserData] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(
    null
  );
  const [cameraError, setCameraError] = useState(false);
  const [videoRef, setVideoRef] = useState<HTMLVideoElement | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);

    if (typeof window !== "undefined") {
      const savedUser = localStorage.getItem("attendanceUser");
      const sessionTime = localStorage.getItem("sessionTime");

      if (savedUser && sessionTime) {
        const currentTime = new Date().getTime();
        const loginTime = parseInt(sessionTime);
        const eightHours = 8 * 60 * 60 * 1000;

        if (currentTime - loginTime < eightHours) {
          setUser(JSON.parse(savedUser));
          setShowUserData(true);
        } else {
          localStorage.removeItem("attendanceUser");
          localStorage.removeItem("sessionTime");
          localStorage.removeItem("showUserData");
        }
      }
    }

    // Cleanup camera when component unmounts
    return () => {
      if (videoRef && videoRef.srcObject) {
        (videoRef.srcObject as MediaStream)
          .getTracks()
          .forEach((track) => track.stop());
      }
    };
  }, [videoRef]);

  // Stop camera when transitioning to user data page
  useEffect(() => {
    if (showUserData && videoRef && videoRef.srcObject) {
      (videoRef.srcObject as MediaStream)
        .getTracks()
        .forEach((track) => track.stop());
      videoRef.srcObject = null;
      setVideoRef(null);
      setCameraActive(false);
      setPhotoTaken(false);
    }
  }, [showUserData, videoRef]);

  if (!mounted) {
    return null;
  }

  const handleContinue = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const q = query(
        collection(db, "users"),
        where("username", "==", email),
        where("password", "==", password)
      );

      const snapshot = await getDocs(q);

      if (!snapshot.empty) {
        const userData = snapshot.docs[0].data();
        const currentTime = new Date().getTime();

        if (typeof window !== "undefined") {
          localStorage.setItem("attendanceUser", JSON.stringify(userData));
          localStorage.setItem("sessionTime", currentTime.toString());
        }
        setUser(userData);
        setShowUserData(true);
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

  if (user && showCamera) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Top Navigation */}
        <nav className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex justify-between items-center h-14 sm:h-16">
              {/* Left side */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 bg-blue-50 rounded-lg">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-sm sm:text-base font-semibold text-gray-900">
                    Attendance System
                  </h1>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    Facial Recognition
                  </p>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs sm:text-sm font-medium text-gray-900">
                    {user.name}
                  </span>
                  <span className="text-xs text-gray-500">Employee</span>
                </div>
                <div className="relative">
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover ring-2 ring-blue-100"
                    unoptimized
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] p-4 sm:p-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50 p-4 sm:p-6 w-full max-w-sm sm:max-w-md">
            {/* Header */}
            <div className="text-center mb-4 sm:mb-6">
              <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-full mb-3">
                <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Mark Attendance
              </h2>
              <p className="text-sm text-gray-600">
                Position your face within the frame
              </p>
            </div>

            {/* Camera Preview */}
            <div className="relative mb-4 sm:mb-6">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200 rounded-xl aspect-[4/3] flex items-center justify-center relative overflow-hidden shadow-inner">
                {/* Camera Frame Overlay */}
                <div className="absolute inset-3 sm:inset-4 border-2 border-dashed border-slate-300 rounded-lg z-20 pointer-events-none">
                  <div className="absolute top-0 left-0 w-4 h-4 sm:w-5 sm:h-5 border-l-2 border-t-2 sm:border-l-3 sm:border-t-3 border-blue-500 rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-4 h-4 sm:w-5 sm:h-5 border-r-2 border-t-2 sm:border-r-3 sm:border-t-3 border-blue-500 rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-4 h-4 sm:w-5 sm:h-5 border-l-2 border-b-2 sm:border-l-3 sm:border-b-3 border-blue-500 rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-4 h-4 sm:w-5 sm:h-5 border-r-2 border-b-2 sm:border-r-3 sm:border-b-3 border-blue-500 rounded-br-lg"></div>
                </div>

                {cameraPermission === null ? (
                  <div className="text-center px-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                      <Camera className="w-8 h-8 sm:w-9 sm:h-9 text-white" />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-2">
                      Camera Access Required
                    </h3>
                    <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                      Grant camera permission for attendance
                    </p>
                  </div>
                ) : cameraActive && !cameraError ? (
                  <>
                    {/* Reference Image Overlay */}
                    <div className="absolute inset-0 z-5">
                      <Image
                        src={user.image}
                        alt={user.name}
                        width={320}
                        height={240}
                        className="w-full h-full object-cover rounded-xl opacity-20"
                        unoptimized
                      />
                    </div>

                    {/* Live Video Feed */}
                    <video
                      ref={(video) => {
                        setVideoRef(video);
                        if (video && !video.srcObject) {
                          navigator.mediaDevices
                            .getUserMedia({
                              video: {
                                width: { ideal: 640 },
                                height: { ideal: 480 },
                                facingMode: "user",
                              },
                            })
                            .then((stream) => {
                              video.srcObject = stream;
                            })
                            .catch(() => {
                              setCameraActive(false);
                              setCameraError(true);
                            });
                        }
                      }}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 w-full h-full object-cover rounded-xl z-10"
                    />


                    {/* Stop Camera Button */}
                    <button
                      onClick={() => {
                        if (videoRef && videoRef.srcObject) {
                          (videoRef.srcObject as MediaStream)
                            .getTracks()
                            .forEach((track) => track.stop());
                          videoRef.srcObject = null;
                        }
                        setCameraActive(false);
                        setVideoRef(null);
                      }}
                    ></button>
                  </>
                ) : photoTaken ? (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"></div>
                    <div className="relative z-10 text-center px-4">
                      <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-full w-16 h-16 sm:w-20 sm:h-20 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-xl">
                        <CheckCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-emerald-800 mb-2">
                        Attendance Marked!
                      </h3>
                      <p className="text-emerald-700 font-medium mb-3 text-xs sm:text-sm">
                        Identity verified successfully
                      </p>
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                        <span className="text-emerald-600 text-xs sm:text-sm font-medium">
                          Finalizing...
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-50 via-orange-50 to-red-50 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent"></div>
                    <div className="relative z-10 text-center px-4">
                      <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-full w-16 h-16 sm:w-18 sm:h-18 flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                        <AlertTriangle className="w-8 h-8 sm:w-9 sm:h-9 text-white" />
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-red-800 mb-2">
                        Recognition Failed
                      </h3>
                      <p className="text-red-700 text-xs sm:text-sm leading-relaxed">
                        Ensure proper lighting and face the camera
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Indicator */}
              <div className="absolute -bottom-2 sm:-bottom-3 left-1/2 transform -translate-x-1/2">
                <div
                  className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-full text-xs font-medium shadow-lg border ${
                    cameraPermission === null
                      ? "bg-blue-100 text-blue-800 border-blue-200"
                      : cameraActive
                      ? "bg-green-100 text-green-800 border-green-200"
                      : photoTaken
                      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                      : "bg-red-100 text-red-800 border-red-200"
                  }`}
                >
                  {cameraPermission === null
                    ? "Awaiting Permission"
                    : cameraActive
                    ? "Camera Active"
                    : photoTaken
                    ? "Processing..."
                    : "Ready to Retry"}
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => {
                if (cameraPermission === null) {
                  navigator.mediaDevices
                    .getUserMedia({ video: true })
                    .then(() => {
                      setCameraPermission(true);
                      setCameraActive(true);
                    })
                    .catch(() => {
                      setCameraPermission(false);
                      setCameraError(true);
                    });
                } else if (cameraActive) {
                  // Immediately stop camera stream
                  if (videoRef && videoRef.srcObject) {
                    (videoRef.srcObject as MediaStream)
                      .getTracks()
                      .forEach((track) => track.stop());
                    videoRef.srcObject = null;
                  }
                  setCameraActive(false);
                  setVideoRef(null);
                  setPhotoTaken(true);

                  if (typeof window !== "undefined") {
                    const today = new Date().toDateString();
                    localStorage.setItem("lastPhotoDate", today);
                  }

                  setTimeout(() => {
                    setShowCamera(false);
                    setPhotoTaken(false);
                    setCameraPermission(null);
                  }, 2000);
                } else {
                  setCameraActive(true);
                  setCameraError(false);
                }
              }}
              disabled={photoTaken}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium text-sm transition-colors disabled:cursor-not-allowed"
            >
              {photoTaken
                ? "Processing..."
                : cameraPermission === null
                ? "Enable Camera"
                : cameraActive
                ? "Capture Photo"
                : "Start Camera"}
            </button>

            {/* Attempts remaining */}
            <p className="text-center text-xs text-gray-500 mt-3">
              Attempts remaining: 2/3
            </p>
          </div>

          {/* Back to Dashboard Button */}
          <button
            onClick={() => {
              setShowCamera(false);
              setCameraActive(false);
              setPhotoTaken(false);
              setCameraPermission(null);
              if (videoRef && videoRef.srcObject) {
                (videoRef.srcObject as MediaStream)
                  .getTracks()
                  .forEach((track) => track.stop());
                videoRef.srcObject = null;
              }
            }}
            className="mt-4 px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium text-sm transition-colors flex items-center space-x-2"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span>Back to Dashboard</span>
          </button>
        </div>
      </div>
    );
  }

  if (user && showUserData) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Top Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14 sm:h-16">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <svg
                  className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
                <h1 className="text-lg sm:text-xl font-semibold text-gray-900 max-[350]:text-[14px] max-[320]:text-[12px] max-[280]:text-[10px]">
                  Attendance Tracker
                </h1>
              </div>
              <div className="flex items-center space-x-2 sm:space-x-6">
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                <a
                  href="#"
                  className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm hidden md:block"
                >
                  Dashboard
                </a>
                <a
                  href="#"
                  className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm hidden md:block"
                >
                  Reports
                </a>
                <a
                  href="#"
                  className="text-gray-600 hover:text-gray-900 text-xs sm:text-sm hidden md:block"
                >
                  Settings
                </a>
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={32}
                    height={32}
                    className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover"
                    unoptimized
                  />
                  <button
                    onClick={() => {
                      if (typeof window !== "undefined") {
                        localStorage.removeItem("attendanceUser");
                        localStorage.removeItem("sessionTime");
                      }
                      setUser(null);
                      setShowUserData(false);
                    }}
                    className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg items-center space-x-1.5 text-xs sm:text-sm group hidden md:flex"
                  >
                    <svg
                      className="w-3 h-3 sm:w-4 sm:h-4 group-hover:rotate-12 transition-transform duration-200"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200">
              <div className="px-4 py-3 space-y-2">
                <a
                  href="#"
                  className="block text-gray-600 hover:text-gray-900 py-2 text-sm"
                >
                  Dashboard
                </a>
                <a
                  href="#"
                  className="block text-gray-600 hover:text-gray-900 py-2 text-sm"
                >
                  Reports
                </a>
                <a
                  href="#"
                  className="block text-gray-600 hover:text-gray-900 py-2 text-sm"
                >
                  Settings
                </a>
                <button
                  onClick={() => {
                    if (typeof window !== "undefined") {
                      localStorage.removeItem("attendanceUser");
                      localStorage.removeItem("sessionTime");
                    }
                    setUser(null);
                    setShowUserData(false);
                  }}
                  className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center space-x-2 text-sm group mt-3"
                >
                  <svg
                    className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <Image
                  src={user.image}
                  alt={user.name}
                  width={80}
                  height={80}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
                  unoptimized
                />
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 max-[350]:text-[13px]">
                    {user.name}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600">
                    Employee ID: {user.id || "12345"}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button className="bg-blue-600 text-white px-4 sm:px-6 py-2 rounded-lg font-medium hover:bg-blue-700 text-sm sm:text-base">
                  Request Leave
                </button>
                <button
                  onClick={() => setShowCamera(true)}
                  className="bg-green-600 text-white px-4 sm:px-6 py-2 rounded-lg font-medium hover:bg-green-700 flex items-center justify-center space-x-2 text-sm sm:text-base"
                >
                  <Camera className="w-4 h-4" />
                  <span>Take Attendance</span>
                </button>
              </div>
            </div>
          </div>

          {/* Monthly Attendance Summary */}
          <div className="mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Monthly Attendance Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
                <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">
                  Total Hours Worked
                </h4>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  --
                </p>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
                <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">
                  Late Arrivals
                </h4>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  --
                </p>
              </div>
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6 sm:col-span-2 md:col-span-1">
                <h4 className="text-xs sm:text-sm font-medium text-gray-600 mb-2">
                  Absences
                </h4>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">
                  --
                </p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                Attendance Trends
              </h4>
              <div className="h-40 sm:h-48 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">
                    --%
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Last 12 months
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    No data available
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-6">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
                Monthly Performance
              </h4>
              <div className="h-40 sm:h-48 bg-gradient-to-r from-green-50 to-green-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">
                    --%
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Last 6 months
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    No data available
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        {/* Top Navigation */}
        <nav className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-14 sm:h-16 lg:h-18">
              {/* Left side */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 bg-blue-50 rounded-lg">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-base sm:text-lg font-semibold text-gray-900">
                    Attendance System
                  </h1>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    Facial Recognition
                  </p>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-medium text-gray-900">
                    {user.name}
                  </span>
                  <span className="text-xs text-gray-500">Employee</span>
                </div>
                <div className="relative">
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={40}
                    height={40}
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-blue-100"
                    unoptimized
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)] sm:min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-4.5rem)] p-4 sm:p-6 lg:p-8">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl sm:rounded-3xl shadow-xl border border-gray-200/50 p-6 sm:p-8 lg:p-10 w-full max-w-sm sm:max-w-md lg:max-w-lg">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-blue-50 rounded-full mb-4">
                <Camera className="w-6 h-6 sm:w-7 sm:h-7 text-blue-600" />
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                Mark Attendance
              </h2>
              <p className="text-sm sm:text-base text-gray-600 max-w-xs mx-auto">
                Position your face within the frame for secure recognition
              </p>
            </div>

            {/* Camera Preview */}
            <div className="relative mb-6 sm:mb-8">
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 border-2 border-slate-200/70 rounded-2xl sm:rounded-3xl aspect-[4/3] flex items-center justify-center relative overflow-hidden shadow-inner">
                {/* Camera Frame Overlay */}
                <div className="absolute inset-4 sm:inset-6 border-2 border-dashed border-slate-300/70 rounded-xl sm:rounded-2xl z-20 pointer-events-none">
                  <div className="absolute top-0 left-0 w-5 h-5 sm:w-7 sm:h-7 border-l-3 border-t-3 sm:border-l-4 sm:border-t-4 border-blue-500 rounded-tl-xl"></div>
                  <div className="absolute top-0 right-0 w-5 h-5 sm:w-7 sm:h-7 border-r-3 border-t-3 sm:border-r-4 sm:border-t-4 border-blue-500 rounded-tr-xl"></div>
                  <div className="absolute bottom-0 left-0 w-5 h-5 sm:w-7 sm:h-7 border-l-3 border-b-3 sm:border-l-4 sm:border-b-4 border-blue-500 rounded-bl-xl"></div>
                  <div className="absolute bottom-0 right-0 w-5 h-5 sm:w-7 sm:h-7 border-r-3 border-b-3 sm:border-r-4 sm:border-b-4 border-blue-500 rounded-br-xl"></div>
                </div>

                {cameraPermission === null ? (
                  <div className="text-center px-4 sm:px-8">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-full w-18 h-18 sm:w-22 sm:h-22 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl">
                      <Camera className="w-9 h-9 sm:w-11 sm:h-11 text-white" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-800 mb-2 sm:mb-3">
                      Camera Access Required
                    </h3>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
                      Grant camera permission to enable secure facial
                      recognition for attendance tracking
                    </p>
                  </div>
                ) : cameraActive && !cameraError ? (
                  <>
                    {/* Reference Image Overlay */}
                    <div className="absolute inset-0 z-5">
                      <Image
                        src={user.image}
                        alt={user.name}
                        width={400}
                        height={300}
                        className="w-full h-full object-cover rounded-2xl sm:rounded-3xl opacity-15"
                        unoptimized
                      />
                    </div>

                    {/* Live Video Feed */}
                    <video
                      ref={(video) => {
                        setVideoRef(video);
                        if (video && !video.srcObject) {
                          navigator.mediaDevices
                            .getUserMedia({
                              video: {
                                width: { ideal: 1280 },
                                height: { ideal: 720 },
                                facingMode: "user",
                              },
                            })
                            .then((stream) => {
                              video.srcObject = stream;
                            })
                            .catch(() => {
                              setCameraActive(false);
                              setCameraError(true);
                            });
                        }
                      }}
                      autoPlay
                      playsInline
                      muted
                      className="absolute inset-0 w-full h-full object-cover rounded-2xl sm:rounded-3xl z-10"
                    />

                    {/* Recording Indicator */}
                  </>
                ) : photoTaken ? (
                  <div className="w-full h-full bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent backdrop-blur-sm"></div>
                    <div className="relative z-10 text-center px-4 sm:px-8">
                      <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-full w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl animate-pulse">
                        <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 text-white" />
                      </div>
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-emerald-800 mb-2 sm:mb-3">
                        Attendance Marked!
                      </h3>
                      <p className="text-emerald-700 font-medium mb-4 sm:mb-6 text-sm sm:text-base">
                        Identity verified successfully
                      </p>
                      <div className="flex items-center justify-center space-x-2">
                        <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 animate-spin" />
                        <span className="text-emerald-600 text-sm sm:text-base font-medium">
                          Finalizing...
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-red-50 via-orange-50 to-red-50 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent"></div>
                    <div className="relative z-10 text-center px-4 sm:px-8">
                      <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-full w-18 h-18 sm:w-22 sm:h-22 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl">
                        <AlertTriangle className="w-9 h-9 sm:w-11 sm:h-11 text-white" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-red-800 mb-2 sm:mb-3">
                        Recognition Failed
                      </h3>
                      <p className="text-red-700 text-sm sm:text-base leading-relaxed">
                        Ensure proper lighting and position your face clearly
                        within the frame
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Status Indicator */}
              <div className="absolute -bottom-3 sm:-bottom-4 left-1/2 transform -translate-x-1/2">
                <div
                  className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold shadow-lg backdrop-blur-sm border ${
                    cameraPermission === null
                      ? "bg-blue-100/90 text-blue-800 border-blue-200"
                      : cameraActive
                      ? "bg-green-100/90 text-green-800 border-green-200"
                      : photoTaken
                      ? "bg-emerald-100/90 text-emerald-800 border-emerald-200"
                      : "bg-red-100/90 text-red-800 border-red-200"
                  }`}
                >
                  <span className="font-medium">
                    {cameraPermission === null
                      ? "Awaiting Permission"
                      : cameraActive
                      ? "Camera Active"
                      : photoTaken
                      ? "Processing..."
                      : "Ready to Retry"}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => {
                if (cameraPermission === null) {
                  navigator.mediaDevices
                    .getUserMedia({ video: true })
                    .then(() => {
                      setCameraPermission(true);
                      setCameraActive(true);
                    })
                    .catch(() => {
                      setCameraPermission(false);
                      setCameraError(true);
                    });
                } else if (cameraActive) {
                  // Immediately stop camera stream
                  if (videoRef && videoRef.srcObject) {
                    (videoRef.srcObject as MediaStream)
                      .getTracks()
                      .forEach((track) => track.stop());
                    videoRef.srcObject = null;
                  }
                  setCameraActive(false);
                  setVideoRef(null);
                  setPhotoTaken(true);

                  if (typeof window !== "undefined") {
                    const today = new Date().toDateString();
                    localStorage.setItem("lastPhotoDate", today);
                  }

                  setTimeout(() => {
                    setShowCamera(false);
                    setPhotoTaken(false);
                    setCameraPermission(null);
                  }, 2000);
                } else {
                  setCameraActive(true);
                  setCameraError(false);
                }
              }}
              disabled={photoTaken}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl sm:rounded-2xl font-semibold text-sm sm:text-base transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {photoTaken ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : cameraPermission === null ? (
                <div className="flex items-center justify-center space-x-2">
                  <Camera className="w-4 h-4" />
                  <span>Enable Camera</span>
                </div>
              ) : cameraActive ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
                  <span>Capture Photo</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <Camera className="w-4 h-4" />
                  <span>Start Camera</span>
                </div>
              )}
            </button>

            {/* Footer Info */}
            <div className="text-center mt-4 sm:mt-6">
              <p className="text-xs sm:text-sm text-gray-500 mb-2">
                Secure facial recognition • Privacy protected
              </p>
              <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                <span>Attempts: 2/3</span>
                <span>•</span>
                <span>Encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      {/* Logo */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex items-center space-x-2">
        <svg
          className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
        </svg>
        <h1 className="text-lg sm:text-2xl font-bold text-gray-800">
          AttendanceAI
        </h1>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-sm sm:text-base text-gray-600">
            Log in to mark your attendance.
          </p>
        </div>

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg p-6 sm:p-8">
          {/* Form */}
          <form onSubmit={handleContinue} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError("");
                }}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base text-black placeholder-gray-400"
                placeholder="Enter Your Username"
                required
                disabled={loading}
              />
              {emailError && (
                <p className="text-red-600 text-sm mt-1">{emailError}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError("");
                }}
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base text-black placeholder-gray-400"
                placeholder="Enter Your Password"
                required
                disabled={loading}
              />
              {passwordError && (
                <p className="text-red-600 text-sm mt-1">{passwordError}</p>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2.5 sm:py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
            >
              {loading ? "Loading..." : "Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

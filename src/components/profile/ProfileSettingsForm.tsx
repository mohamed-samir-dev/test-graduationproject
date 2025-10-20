"use client";

import { useState, useRef } from "react";
import { DocumentData } from "firebase/firestore";
import { Camera, Eye, EyeOff, CheckCircle, Upload, X, Lock } from "lucide-react";
import Image from "next/image";
import Button from "@/components/common/Button";
import { updateUser } from "@/lib/services/userService";

interface ProfileSettingsFormProps {
  user: DocumentData;
}

export default function ProfileSettingsForm({
  user,
}: ProfileSettingsFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    fullName: user.name || "John Doe",
    email: user.email || "john.doe@techcorp.com",
    phone: user.phone || "",
    jobTitle: user.jobTitle || "Software Engineer",
    department: user.department || user.Department || "Engineering",
    employeeId: user.numericId || "",
    attendanceReminders: user.attendanceReminders ?? false,
    leaveStatusUpdates: user.leaveStatusUpdates ?? false,
    systemAnnouncements: user.systemAnnouncements ?? false,
    attendanceHistoryVisibility: user.attendanceHistoryVisibility || "team",
  });

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please select a JPG, PNG, or GIF image.');
        return;
      }
      
      // Check file size (5MB = 5 * 1024 * 1024 bytes)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        setSelectedImage(imageUrl);
        
        try {
          await updateUser(user.id, { image: imageUrl });
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
          console.error("Error updating profile picture:", error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      const updateData: { 
        name: string; 
        email: string; 
        phone: string; 
        image?: string;
        attendanceReminders?: boolean;
        leaveStatusUpdates?: boolean;
        systemAnnouncements?: boolean;
        attendanceHistoryVisibility?: string;
      } = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        attendanceReminders: formData.attendanceReminders,
        leaveStatusUpdates: formData.leaveStatusUpdates,
        systemAnnouncements: formData.systemAnnouncements,
        attendanceHistoryVisibility: formData.attendanceHistoryVisibility,
      };

      if (selectedImage) {
        updateData.image = selectedImage;
      }

      await updateUser(user.id, updateData);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleCancel = () => {
    console.log("Cancelling changes");
  };

  const validatePassword = (password: string) => {
    // Only allow lowercase English letters, English numbers, and special characters
    const validPattern = /^[a-z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
    return validPattern.test(password);
  };

  const handlePasswordChange = (field: 'current' | 'new' | 'confirm', value: string) => {
    if (validatePassword(value)) {
      setPasswordData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handlePasswordUpdate = async () => {
    setPasswordError("");
    
    if (passwordData.current !== user.password) {
      setPasswordError("Current password is incorrect");
      return;
    }
    
    if (passwordData.new !== passwordData.confirm) {
      setPasswordError("New passwords don't match");
      return;
    }
    
    try {
      await updateUser(user.id, { password: passwordData.new });
      setShowPasswordModal(false);
      setPasswordData({ current: "", new: "", confirm: "" });
      setPasswordError("");
      setShowPasswordSuccess(true);
      setTimeout(() => setShowPasswordSuccess(false), 3000);
    } catch (error) {
      console.error("Error updating password:", error);
      setPasswordError("Failed to update password. Please try again.");
    }
  };

  return (
    <>
      {showSuccess && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center space-x-2 z-50 animate-fade-in">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Profile updated successfully!</span>
        </div>
      )}

      {showPasswordSuccess && (
        <div className="fixed top-4 right-4 bg-gradient-to-r from-emerald-500 to-green-500 text-white px-8 py-4 rounded-xl shadow-2xl flex items-center space-x-3 z-50 animate-fade-in border border-white/20">
          <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="font-semibold">Password Updated!</p>
            <p className="text-sm text-green-100">Your password has been changed successfully</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        <div className="xl:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Profile Settings
              </h1>
              <p className="text-gray-600 mt-1 text-sm sm:text-base">
                Manage your personal information and preferences
              </p>
            </div>

            <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
              {/* Personal Information Section */}
              <div>
                <h2 className="text-lg font-medium text-gray-900 mb-4">
                  Personal Information
                </h2>

                {/* Profile Picture */}
                <div className="mb-6 sm:mb-8">
                  <div className="rounded-xl">
                    <h3 className="text-black text-base sm:text-lg font-semibold mb-4 sm:mb-6">
                      Profile Picture
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 lg:space-x-8">
                      <div className="relative flex-shrink-0">
                        <Image
                          src={selectedImage || user.image}
                          alt={user.name}
                          width={120}
                          height={120}
                          className="w-24 h-24 sm:w-28 sm:h-28 lg:w-30 lg:h-30 rounded-full object-cover border-4 border-white shadow-lg"
                          unoptimized
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 bg-white text-blue-600 p-1.5 sm:p-2 rounded-full hover:bg-gray-50 transition-colors shadow-md"
                        >
                          <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                      <div className="text-center sm:text-left">
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all flex items-center space-x-2 mb-3 cursor-pointer text-sm sm:text-base"
                        >
                          <Upload className="w-3 h-3 sm:w-4 sm:h-4" />
                          <span>Change Picture</span>
                        </button>
                        <p className="text-black text-xs sm:text-sm">
                          JPG, GIF or PNG. 5MB max.
                        </p>
                        <p className="text-black text-xs sm:text-sm mt-1">
                          Recommended: 400x400 pixels
                        </p>
                      </div>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) =>
                        handleInputChange("fullName", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        handleInputChange("email", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm sm:text-base"
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Job Title
                    </label>
                    <input
                      type="text"
                      value={formData.jobTitle}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Department
                    </label>
                    <input
                      type="text"
                      value={formData.department}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                      Employee ID
                    </label>
                    <input
                      type="text"
                      value={user.numericId || ""}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 text-sm sm:text-base"
                    />
                  </div>
                </div>

                {/* Password Section */}
                <div className="mt-4 sm:mt-6">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className="relative w-full sm:max-w-xs">
                      <input
                        type={showPassword ? "text" : "password"}
                        value={
                          showPassword
                            ? user.password || ""
                            : "•".repeat((user.password || "").length)
                        }
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 pr-10 text-sm sm:text-base"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <button 
                      onClick={() => setShowPasswordModal(true)}
                      className="text-blue-600 hover:text-blue-700 font-medium text-xs sm:text-sm cursor-pointer self-start sm:self-center"
                    >
                      Update Password
                    </button>
                  </div>
                </div>
              </div>

              {/* Notification Preferences Section */}
              <div>
                <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
                  Notification Preferences
                </h2>
                <div className="space-y-4 sm:space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex-1">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-900">
                        Attendance Reminders
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Receive reminders to clock in and out.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 self-start sm:self-center">
                      <input
                        type="checkbox"
                        checked={formData.attendanceReminders}
                      
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex-1">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-900">
                        Leave Status Updates
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Get notified when your leave requests are approved or
                        rejected.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 self-start sm:self-center">
                      <input
                        type="checkbox"
                        checked={formData.leaveStatusUpdates}
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex-1">
                      <h3 className="text-xs sm:text-sm font-medium text-gray-900">
                        System Announcements
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-1">
                        Receive notifications about system updates and
                        maintenance.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 self-start sm:self-center">
                      <input
                        type="checkbox"
                        checked={formData.systemAnnouncements}
                       
                        className="sr-only peer"
                      />
                      <div className="w-10 h-5 sm:w-11 sm:h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Privacy Settings Section */}
              <div>
                <h2 className="text-base sm:text-lg font-medium text-gray-900 mb-4">
                  Privacy Settings
                </h2>
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Attendance History Visibility
                  </label>
                  <p className="text-xs sm:text-sm text-gray-500 mb-3">
                    Control who can see your attendance history.
                  </p>
                  <select
                    value={formData.attendanceHistoryVisibility}
                    onChange={(e) =>
                      handleInputChange(
                        "attendanceHistoryVisibility",
                        e.target.value
                      )
                    }
                    className="w-full sm:max-w-xs px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-gray-50 text-sm sm:text-base"
                    disabled
                  >
                    <option value="team">Team members</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
              <Button
                variant="secondary"
                onClick={handleCancel}
                className="px-4 sm:px-6 py-2 w-full sm:w-auto text-sm sm:text-base"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                className="px-4 sm:px-6 py-2 w-full sm:w-auto text-sm sm:text-base"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm sm:text-base"
              >
                Update Profile Picture
              </button>
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base"
              >
                Change Password
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
              Account Status
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Account Type</span>
                <span className="text-xs sm:text-sm font-medium text-green-600">
                  Employee
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Status</span>
                <span className="text-xs sm:text-sm font-medium text-green-600">
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs sm:text-sm text-gray-600">Last Login</span>
                <span className="text-xs sm:text-sm text-gray-900">Today</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Update Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-white/20 w-full max-w-lg">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Update Password</h3>
                </div>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
              
              <div className="space-y-3 sm:space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      value={passwordData.current}
                      onChange={(e) => handlePasswordChange('current', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm text-gray-900 text-sm sm:text-base"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={passwordData.new}
                      onChange={(e) => handlePasswordChange('new', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm text-gray-900 text-sm sm:text-base"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Only lowercase letters, numbers, and special characters allowed
                  </p>
                </div>
                
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={passwordData.confirm}
                      onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 sm:pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm text-gray-900 text-sm sm:text-base"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                      ) : (
                        <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              {passwordError && (
                <div className="mt-3 sm:mt-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-xs sm:text-sm text-red-600">{passwordError}</p>
                </div>
              )}
              
              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-4 sm:mt-6">
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors rounded-lg hover:bg-gray-100 text-sm sm:text-base w-full sm:w-auto"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordUpdate}
                  className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-all shadow-lg text-sm sm:text-base w-full sm:w-auto"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

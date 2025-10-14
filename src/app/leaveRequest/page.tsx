"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Calendar, User, Phone, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/layout/Navbar";
import NavigationBlocker from "@/components/NavigationBlocker";
import Toast from "@/components/common/Toast";
import { submitLeaveRequest } from "@/lib/services/leaveService";

type LeaveType = "Sick Leave" | "Vacation" | "Personal Leave" | "Maternity Leave" | "Paternity Leave";

export default function LeaveRequestPage() {
  const { user, mounted, logout } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    startDate: "",
    endDate: "",
    leaveType: "",
    reason: "",
    contactName: "",
    phoneNumber: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning'; isVisible: boolean }>({ message: '', type: 'success', isVisible: false });

  if (!mounted || !user) {
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    try {
      await submitLeaveRequest({
        employeeId: user.numericId.toString(),
        employeeName: user.name,
        leaveType: formData.leaveType as LeaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
        status: 'Pending'
      });
      
      setToast({ message: "Leave request submitted successfully!", type: 'success', isVisible: true });
      setTimeout(() => router.push("/userData"), 2000);
    } catch {
      setToast({ message: "Failed to submit leave request. Please try again.", type: 'error', isVisible: true });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-['Inter',sans-serif]">
      <NavigationBlocker />
      <Toast 
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
      />
      <Navbar 
        user={user}
        title="Attendance Tracker"
        onUserClick={logout}
        showNavigation
        navigationItems={[
          { label: "Dashboard", href: "#", onClick: () => router.push("/userData") },
          { label: "Reports", href: "#" },
          { label: "Settings", href: "#" }
        ]}
      />

      <div className="max-w-full mx-auto p-3 sm:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white shadow-lg rounded-2xl sm:rounded-3xl border border-gray-200 overflow-hidden">
            <div className="px-4 sm:px-8 py-4 sm:py-6 border-b border-gray-200">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
                Leave Request Application
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Please complete all required fields to submit your leave request for approval.
              </p>
            </div>
            <div className="p-4 sm:p-8">

              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                {/* Employee Information */}
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Employee Information</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employee ID
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 bg-white">
                        <User className="text-gray-400 mr-3" size={20} />
                        <input
                          type="text"
                          value={user.numericId || ""}
                          className="w-full outline-none text-gray-800 font-medium bg-transparent"
                          readOnly
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Employee Name
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 bg-white">
                        <User className="text-gray-400 mr-3" size={20} />
                        <input
                          type="text"
                          value={user.name || ""}
                          className="w-full outline-none text-gray-800 font-medium bg-transparent"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Leave Details */}
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Leave Details</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
                        <Calendar className="text-gray-400 mr-3" size={20} />
                        <input
                          type="date"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleChange}
                          className="w-full outline-none text-gray-800"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
                        <Calendar className="text-gray-400 mr-3" size={20} />
                        <input
                          type="date"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleChange}
                          className="w-full outline-none text-gray-800"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type of Leave <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="leaveType"
                      value={formData.leaveType}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 appearance-none outline-none text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                      required
                    >
                      <option value="">Select leave type</option>
                      <option value="Sick Leave">Sick Leave</option>
                      <option value="Vacation">Annual Leave / Vacation</option>
                      <option value="Personal Leave">Personal Leave</option>
                      <option value="Maternity Leave">Maternity Leave</option>
                      <option value="Paternity Leave">Paternity Leave</option>
                    </select>
                    <ChevronDown
                      className="absolute right-4 top-4 text-gray-400 pointer-events-none"
                      size={20}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for Leave
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Please provide a detailed explanation for your leave request. Include any relevant information that may assist in the approval process..."
                    rows={5}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none resize-none text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  ></textarea>
                </div>

                {/* Emergency Contact */}
                <div className="bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 border border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                      Emergency Contact Information
                    </h3>
                    <span className="text-xs sm:text-sm text-gray-500 bg-gray-200 px-2 sm:px-3 py-1 rounded-full self-start sm:self-auto">Optional</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Contact Name
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
                        <User className="text-gray-400 mr-3" size={20} />
                        <input
                          type="text"
                          name="contactName"
                          placeholder="Full name of emergency contact"
                          value={formData.contactName}
                          onChange={handleChange}
                          className="w-full outline-none text-gray-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <div className="flex items-center border border-gray-300 rounded-lg px-4 py-3 bg-white focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200">
                        <Phone className="text-gray-400 mr-3" size={20} />
                        <input
                          type="tel"
                          name="phoneNumber"
                          placeholder="Contact phone number"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          className="w-full outline-none text-gray-800"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => router.push("/userData")}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-sm sm:text-base"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Leave Request"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
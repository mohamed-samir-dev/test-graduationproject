"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Building, Mail, Briefcase, DollarSign, RotateCcw } from "lucide-react";
import { getUsers, updateUser } from "@/lib/services/userService";
import { User as UserType } from "@/lib/types";

export default function EditEmployeeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get("id");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    jobTitle: "",
    salary: "",
    image: "",
  });
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [employee, setEmployee] = useState<UserType | null>(null);

  const [updating, setUpdating] = useState(false);
  const [photoMessage, setPhotoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [hasNewPhoto, setHasNewPhoto] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    const fetchEmployee = async () => {
      if (!userId) return;
      
      try {
        const users = await getUsers();
        const emp = users.find(u => u.id === userId);
        if (emp) {
          setEmployee(emp);
          setFormData({
            name: emp.name,
            email: emp.email || "",
            department: emp.department || emp.Department || "",
            jobTitle: emp.jobTitle || "",
            salary: emp.salary?.toString() || "",
            image: emp.image || "",
          });
        }
      } catch (error) {
        console.error("Error fetching employee:", error);
      }
    };

    fetchEmployee();
  }, [userId]);

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();
      
      img.onload = () => {
        const maxWidth = 400;
        const maxHeight = 400;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      };
      
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleResetPhoto = async () => {
    if (!userId || !employee) return;
    
    try {
      await updateUser(userId, { image: employee.image });
      setFormData({ ...formData, image: employee.image || "" });
      setHasNewPhoto(false);
      setPhotoMessage(null);
    } catch (error) {
      console.error('Error resetting photo:', error);
      setPhotoMessage({ type: 'error', text: 'Failed to reset photo. Please try again.' });
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;

    setUpdating(true);
    setPhotoMessage(null);
    try {
      const compressedImage = await compressImage(file);
      await updateUser(userId, { image: compressedImage });
      setFormData({ ...formData, image: compressedImage });
      setHasNewPhoto(true);
      setPhotoMessage({ type: 'success', text: 'Facial recognition photo updated successfully!' });
    } catch (error) {
      console.error('Error updating facial data:', error);
      setPhotoMessage({ type: 'error', text: 'Failed to update facial recognition photo. Please try again.' });
    } finally {
      setUpdating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    try {
      await updateUser(userId, {
        name: formData.name,
        email: formData.email,
        department: formData.department,
        jobTitle: formData.jobTitle,
        salary: parseInt(formData.salary),
        image: formData.image,
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push("/admin");
      }, 2000);
    } catch (error) {
      console.error("Error updating employee:", error);
      alert("Error updating employee. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!employee) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Edit Employee Profile</h1>
          <p className="text-sm lg:text-base text-gray-600">Update employee information and settings.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 space-y-4 lg:space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Employee Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Employee ID
              </label>
              <input
                type="text"
                value=""
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Building className="w-4 h-4 inline mr-2" />
                Department
              </label>
              <select
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              >
                <option value="">Select Department</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations">Operations</option>
                <option value="Design">Design</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="w-4 h-4 inline mr-2" />
                Job Title
              </label>
              <input
                type="text"
                required
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Salary
              </label>
              <input
                type="number"
                required
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                min="0"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Facial Recognition Data
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Manage facial recognition data for accurate attendance tracking.
            </p>

            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="facial-data-upload"
                />
                <button
                  type="button"
                  disabled={updating}
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Update Facial Data'}
                </button>
              </div>
              {hasNewPhoto && (
                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">Reset Facial Data</span>
                  <span className="sm:hidden">Reset</span>
                </button>
              )}
            </div>
            
            {photoMessage && (
              <div className={`mt-3 p-3 rounded-lg text-sm ${
                photoMessage.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {photoMessage.text}
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4 lg:pt-6">
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {showSuccess && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-4 lg:p-6 flex items-center space-x-3 lg:space-x-4 max-w-sm lg:min-w-80">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h4 className="text-base lg:text-lg font-semibold text-gray-900">Changes Saved Successfully</h4>
              <p className="text-xs lg:text-sm text-gray-600">Employee profile has been updated and saved to the system</p>
            </div>
          </div>
        </div>
      )}

      {/* Reset Photo Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full border border-white/30">
            <div className="relative p-6 pb-4">
              <button
                onClick={() => setShowResetModal(false)}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center shadow-inner">
                    <RotateCcw className="w-8 h-8 text-white" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Facial Data</h2>
                <p className="text-gray-500 text-sm">Restore original photo</p>
              </div>
            </div>

            <div className="px-6 pb-6">
              <div className="bg-orange-50/80 backdrop-blur-sm border border-orange-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="font-medium text-orange-800 mb-1">Confirm Reset</h4>
                    <p className="text-sm text-orange-700">
                      This will restore the original facial recognition photo and discard your recent upload.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    handleResetPhoto();
                    setShowResetModal(false);
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reset Photo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
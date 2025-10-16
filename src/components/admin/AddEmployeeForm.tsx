"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import {

  User,
  Mail,
  Building,
  Briefcase,

  Camera,
  Plus,
} from "lucide-react";
import { createUserWithId } from "@/lib/services/userService";

export default function AddEmployeeForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    jobTitle: "",
    image: "",
  });
  const [imageOption, setImageOption] = useState("upload"); // "upload", "url"

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve('');
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
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const compressedImage = await compressImage(file);
      setFormData({ ...formData, image: compressedImage });
    }
  };

  const getImageUrl = () => {
    return formData.image;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.image) {
      setPhotoError("Employee photo is required to complete registration");
      return;
    }
    
    setPhotoError("");
    
    setLoading(true);

    try {
      const username = formData.name.toLowerCase().replace(/\s+/g, "");
      const password = Math.random().toString(36).substring(2, 8);

      await createUserWithId({
        name: formData.name,
        username,
        email: formData.email,
        department: formData.department,
        jobTitle: formData.jobTitle,
        image: getImageUrl(),
        password,
        status: "Active",
      });

      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        router.push("/admin");
      }, 2000);
    } catch (error) {
      console.error("Error adding employee:", error);
      alert("Error adding employee. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 lg:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 lg:mb-8">
          <h1 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Add New Employee</h1>
          <p className="text-sm lg:text-base text-gray-600">Fill in the details to add a new employee to the system.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 lg:p-6 space-y-4 lg:space-y-6"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-2" />
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Enter full name"
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
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Enter email address"
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
                onChange={(e) =>
                  setFormData({ ...formData, department: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              >
                <option value="">Select Department</option>
                <option value="IT">IT</option>
                <option value="HR">HR</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations">Operations</option>
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
                onChange={(e) =>
                  setFormData({ ...formData, jobTitle: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Enter job title"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Facial Recognition Data
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Upload a clear, forward-facing photo of the employee for accurate
              attendance tracking.
            </p>

            <div className="flex space-x-2 mb-4">
              <button
                type="button"
                onClick={() => setImageOption("upload")}
                className={`px-3 py-2 text-sm rounded ${
                  imageOption === "upload"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                Upload
              </button>
              <button
                type="button"
                onClick={() => setImageOption("url")}
                className={`px-3 py-2 text-sm rounded ${
                  imageOption === "url"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700"
                }`}
              >
                URL
              </button>
            </div>

            {imageOption === "upload" && (
              <div className="relative bg-white border-2 border-dashed border-gray-300 rounded-lg p-6 lg:p-8 text-center">
                <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                  <Camera className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 lg:w-6 lg:h-6 bg-blue-600 rounded-full flex items-center justify-center">
                    <Plus className="w-2.5 h-2.5 lg:w-3 lg:h-3 text-white" />
                  </div>
                </div>
                <p className="text-blue-600 font-medium mb-2 text-sm lg:text-base">
                  Click to upload or drag and drop
                </p>
                <p className="text-gray-500 text-xs lg:text-sm mb-4">
                  PNG, JPG, or GIF (max. 5MB)
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            )}

            {imageOption === "url" && (
              <input
                type="url"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black mb-4"
                placeholder="https://example.com/photo.jpg"
              />
            )}

            {getImageUrl() && (
              <div className="mt-4">
                <NextImage
                  src={getImageUrl()}
                  alt="Preview"
                  width={80}
                  height={80}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                />
              </div>
            )}
            
            {photoError && (
              <p className="text-red-600 text-sm mt-2">{photoError}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4 lg:pt-6">
            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="w-full sm:w-auto px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {loading ? "Adding..." : "Add Employee"}
            </button>
          </div>
        </form>
      </div>

      {showSuccess && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 px-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 p-4 lg:p-6 flex items-center space-x-3 lg:space-x-4 max-w-sm lg:min-w-80">
            <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 lg:w-6 lg:h-6 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-base lg:text-lg font-semibold text-gray-900">Employee Added</h4>
              <p className="text-xs lg:text-sm text-gray-600">
                New employee has been successfully added to the system
              </p>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}

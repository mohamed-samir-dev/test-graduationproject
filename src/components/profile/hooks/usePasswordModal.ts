import { useState } from "react";
import { DocumentData } from "firebase/firestore";
import { updateUser } from "@/lib/services/userService";

export const usePasswordModal = (user: DocumentData) => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({ current: "", new: "", confirm: "" });
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const validatePassword = (password: string) => {
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

  return {
    showPasswordModal,
    setShowPasswordModal,
    passwordData,
    showPasswordSuccess,
    showCurrentPassword,
    setShowCurrentPassword,
    showNewPassword,
    setShowNewPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    passwordError,
    handlePasswordChange,
    handlePasswordUpdate,
  };
};
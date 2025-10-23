import { useState } from "react";
import { useRouter } from "next/navigation";
import { submitLeaveRequest } from "@/lib/services/leaveService";

type LeaveType = "Sick Leave" | "Vacation" | "Personal Leave" | "Maternity Leave" | "Paternity Leave";

interface LeaveFormData {
  startDate: string;
  endDate: string;
  leaveType: string;
  reason: string;
  contactName: string;
  phoneNumber: string;
}

export function useLeaveRequest() {
  const router = useRouter();
  const [formData, setFormData] = useState<LeaveFormData>({
    startDate: "",
    endDate: "",
    leaveType: "",
    reason: "",
    contactName: "",
    phoneNumber: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning'; isVisible: boolean }>({ 
    message: '', 
    type: 'success', 
    isVisible: false 
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateLeaveDays = (startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // +1 to include both start and end dates
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>, userId: string, userName: string, numericId?: number) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      const leaveDays = calculateLeaveDays(formData.startDate, formData.endDate);
      
      await submitLeaveRequest({
        employeeId: numericId?.toString() || userId,
        employeeName: userName,
        leaveType: formData.leaveType as LeaveType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        leaveDays,
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

  const closeToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  return {
    formData,
    isSubmitting,
    toast,
    handleChange,
    handleSubmit,
    closeToast
  };
}
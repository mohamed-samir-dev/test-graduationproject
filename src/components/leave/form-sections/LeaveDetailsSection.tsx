"use client";

import { Calendar } from "lucide-react";
import FormInput from "../form-fields/FormInput";
import FormSelect from "../form-fields/FormSelect";
import FormTextarea from "../form-fields/FormTextarea";

interface LeaveDetailsSectionProps {
  formData: {
    startDate: string;
    endDate: string;
    leaveType: string;
    reason: string;
  };
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
}

const leaveTypeOptions = [
  { value: "", label: "Select leave type" },
  { value: "Sick Leave", label: "Sick Leave" },
  { value: "Vacation", label: "Annual Leave / Vacation" },
  { value: "Personal Leave", label: "Personal Leave" },
  { value: "Maternity Leave", label: "Maternity Leave" },
  { value: "Paternity Leave", label: "Paternity Leave" }
];

export default function LeaveDetailsSection({ formData, onChange }: LeaveDetailsSectionProps) {
  return (
    <div>
      <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">
        Leave Details
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        <FormInput
          label="Start Date"
          name="startDate"
          type="date"
          value={formData.startDate}
          icon={Calendar}
          required
          onChange={onChange}
        />
        <FormInput
          label="End Date"
          name="endDate"
          type="date"
          value={formData.endDate}
          icon={Calendar}
          required
          onChange={onChange}
        />
      </div>
      <div className="mt-6">
        <FormSelect
          label="Type of Leave"
          name="leaveType"
          value={formData.leaveType}
          options={leaveTypeOptions}
          required
          onChange={onChange}
        />
      </div>
      <div className="mt-6">
        <FormTextarea
          label="Reason for Leave"
          name="reason"
          value={formData.reason}
          placeholder="Please provide a detailed explanation for your leave request. Include any relevant information that may assist in the approval process..."
          onChange={onChange}
        />
      </div>
    </div>
  );
}
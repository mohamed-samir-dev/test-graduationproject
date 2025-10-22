"use client";

import { LucideIcon } from "lucide-react";

interface FormInputProps {
  label: string;
  name?: string;
  type?: string;
  value: string;
  placeholder?: string;
  required?: boolean;
  readOnly?: boolean;
  icon: LucideIcon;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function FormInput({
  label,
  name,
  type = "text",
  value,
  placeholder,
  required = false,
  readOnly = false,
  icon: Icon,
  onChange
}: FormInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className={`flex items-center border border-gray-300 rounded-lg px-4 py-3 ${readOnly ? 'bg-white' : 'focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200'}`}>
        <Icon className="text-gray-400 mr-3" size={20} />
        <input
          type={type}
          name={name}
          value={value}
          placeholder={placeholder}
          onChange={onChange}
          className="w-full outline-none text-gray-800 bg-transparent"
          required={required}
          readOnly={readOnly}
        />
      </div>
    </div>
  );
}
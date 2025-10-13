"use client";

import { useState } from "react";
import Image from "next/image";
import { Bell, Menu, X } from "lucide-react";
import { DocumentData } from "firebase/firestore";
import AppLogo from "./AppLogo";

interface NavbarProps {
  user?: DocumentData | null;
  title?: string;
  onUserClick?: () => void;
  showNavigation?: boolean;
  navigationItems?: Array<{
    label: string;
    href: string;
    onClick?: () => void;
  }>;
}

export default function Navbar({ 
  user, 
  title = "Employee Attendance", 
  onUserClick,
  showNavigation = false,
  navigationItems = []
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-full mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <AppLogo size="md" showText={false} />
            <h1 className="text-base sm:text-lg font-semibold text-[#1A1A1A] truncate">
              {title}
            </h1>
          </div>

          {showNavigation && (
            <div className="hidden md:flex items-center space-x-8">
              {navigationItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.onClick}
                  className="text-[#555] hover:text-[#1A1A1A] font-medium cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center space-x-2 sm:space-x-4">
            {user && (
              <>
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-[#555] cursor-pointer hover:text-[#1A1A1A]" />
                <Image
                  src={user.image}
                  alt={user.name}
                  width={40}
                  height={40}
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover cursor-pointer"
                  unoptimized
                  onClick={onUserClick}
                />
              </>
            )}
            
            {showNavigation && (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-[#555] hover:text-[#1A1A1A]"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            )}
          </div>
        </div>

        {showNavigation && isMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-2">
            {navigationItems.map((item, index) => (
              <button
                key={index}
                onClick={() => {
                  item.onClick?.();
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-[#555] hover:text-[#1A1A1A] hover:bg-gray-50 font-medium"
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
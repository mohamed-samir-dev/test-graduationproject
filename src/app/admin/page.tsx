"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLeaveRequests } from "@/hooks/useLeaveRequests";
import NavigationBlocker from "@/components/NavigationBlocker";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminTopBar from "@/components/layout/AdminTopBar";
import DashboardContent from "@/components/admin/DashboardContent";
import AttendanceContent from "@/components/admin/AttendanceContent";
import LeavesContent from "@/components/admin/LeavesContent";
import ReportsContent from "@/components/admin/ReportsContent";
import UserManagementContent from "@/components/admin/UserManagementContent";
import SettingsContent from "@/components/admin/SettingsContent";

export default function AdminDashboard() {
  const { user, mounted, logout } = useAuth();
  const { leaveRequests, loading } = useLeaveRequests();
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!mounted || !user || user.numericId !== 1) {
    return null;
  }

  const pendingRequests = leaveRequests.filter(req => req.status === "Pending");
  const pendingCount = pendingRequests.length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center font-['SF_Pro_Display',system-ui,sans-serif]">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" onClick={() => {
      if (showNotifications) setShowNotifications(false);
      if (sidebarOpen) setSidebarOpen(false);
    }}>
      <NavigationBlocker />
      
      {/* Sidebar */}
      <AdminSidebar 
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setSidebarOpen(false);
        }}
        pendingCount={pendingCount}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Main Content */}
      <div className="lg:ml-56">
        {/* Top Bar */}
        <AdminTopBar 
          user={user}
          onLogout={logout}
          showNotifications={showNotifications}
          onToggleNotifications={() => setShowNotifications(!showNotifications)}
          pendingRequests={pendingRequests}
          onViewRequest={() => {
            setShowNotifications(false);
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {/* Content Area */}
        <div className="p-4 lg:p-0">
          {activeTab === "Dashboard" && <DashboardContent />}
          {activeTab === "Attendance" && <AttendanceContent />}
          {activeTab === "Leaves" && <LeavesContent searchQuery={searchQuery} />}
          {activeTab === "Reports" && <ReportsContent />}
          {activeTab === "UserManagement" && <UserManagementContent />}
          {activeTab === "Settings" && <SettingsContent />}
        </div>
      </div>
    </div>
  );
}
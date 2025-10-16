"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useLeaveRequests } from "@/hooks/useLeaveRequests";
import NavigationBlocker from "@/components/NavigationBlocker";
import AdminSidebar from "@/components/layout/AdminSidebar";
import AdminTopBar from "@/components/layout/AdminTopBar";
import AddEmployeeForm from "@/components/admin/AddEmployeeForm";
import DashboardContent from "@/components/admin/DashboardContent";
import AttendanceContent from "@/components/admin/AttendanceContent";
import LeavesContent from "@/components/admin/LeavesContent";
import ReportsContent from "@/components/admin/ReportsContent";
import UserManagementContent from "@/components/admin/UserManagementContent";
import SettingsContent from "@/components/admin/SettingsContent";

export default function AddEmployeePage() {
  const { user, mounted, logout } = useAuth();
  const { leaveRequests } = useLeaveRequests();
  const [activeTab, setActiveTab] = useState("AddEmployee");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!mounted || !user || user.numericId !== 1) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavigationBlocker />
      
      <AdminSidebar 
        activeTab={activeTab === "AddEmployee" ? "UserManagement" : activeTab}
        onTabChange={setActiveTab}
        pendingCount={leaveRequests.filter(req => req.status === "Pending").length}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      <div className="lg:ml-56">
        <AdminTopBar 
          user={user}
          onLogout={logout}
          showNotifications={showNotifications}
          onToggleNotifications={() => setShowNotifications(!showNotifications)}
          pendingRequests={[]}
          onViewRequest={() => {}}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onMenuClick={() => setSidebarOpen(true)}
        />

        {activeTab === "AddEmployee" && <AddEmployeeForm />}
        {activeTab === "Dashboard" && <DashboardContent />}
        {activeTab === "Attendance" && <AttendanceContent />}
        {activeTab === "Leaves" && <LeavesContent searchQuery={searchQuery} />}
        {activeTab === "Reports" && <ReportsContent />}
        {activeTab === "UserManagement" && <UserManagementContent />}
        {activeTab === "Settings" && <SettingsContent />}
      </div>
    </div>
  );
}
"use client";

import { useState } from "react";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { useLeaveRequests } from "@/hooks/useLeaveRequests";
import { Search, Bell, Calendar, Shield, Eye, Trash2, Menu, X } from "lucide-react";
import NavigationBlocker from "@/components/NavigationBlocker";
import Toast from "@/components/common/Toast";
import Modal from "@/components/common/Modal";
import DeleteConfirmModal from "@/components/common/DeleteConfirmModal";
import { updateLeaveRequestStatus, deleteLeaveRequest } from "@/lib/services/leaveService";
import { createNotification } from "@/lib/services/notificationService";
import { LeaveRequest } from "@/lib/types";

export default function AdminDashboard() {
  const { user, mounted, logout } = useAuth();
  const { leaveRequests, loading, error, refetch } = useLeaveRequests();
  const [activeTab, setActiveTab] = useState("Leaves");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Request");
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning'; isVisible: boolean }>({ message: '', type: 'success', isVisible: false });
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteRequest, setDeleteRequest] = useState<LeaveRequest | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  if (!mounted || !user || user.numericId !== 1) {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved": return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Pending": return "bg-amber-50 text-amber-700 border-amber-200";
      case "Rejected": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const navTabs = ["Dashboard", "Attendance", "Leaves", "Reports", "Settings"];
  const statusTabs = ["All Request", "Pending", "Approve", "Rejected"];
  const pendingCount = leaveRequests.filter(req => req.status === "Pending").length;

  const handleStatusUpdate = async (requestId: string, status: 'Approved' | 'Rejected') => {
    const request = leaveRequests.find(req => req.id === requestId);
    try {
      await updateLeaveRequestStatus(requestId, status);
      
      if (request) {
        const notificationMessage = status === 'Approved'
          ? `🎉 Great news! Your leave request from ${new Date(request.startDate).toLocaleDateString()} to ${new Date(request.endDate).toLocaleDateString()} has been approved.`
          : `❌ Your leave request from ${new Date(request.startDate).toLocaleDateString()} to ${new Date(request.endDate).toLocaleDateString()} has been rejected.`;
        
        await createNotification(
          request.employeeId,
          notificationMessage,
          status === 'Approved' ? 'leave_approved' : 'leave_rejected'
        );
      }
      
      refetch();
      const adminMessage = status === 'Approved' 
        ? `✅ ${request?.employeeName}'s leave request has been approved successfully!`
        : `❌ ${request?.employeeName}'s leave request has been rejected.`;
      setToast({ message: adminMessage, type: 'success', isVisible: true });
    } catch {
      setToast({ message: 'Failed to update request status', type: 'error', isVisible: true });
    }
  };

  const handleDeleteRequest = async () => {
    if (deleteRequest) {
      try {
        await deleteLeaveRequest(deleteRequest.id);
        refetch();
        setToast({ message: `✅ ${deleteRequest.employeeName}'s leave request has been deleted successfully!`, type: 'success', isVisible: true });
        setIsDeleteModalOpen(false);
        setDeleteRequest(null);
      } catch {
        setToast({ message: 'Failed to delete request', type: 'error', isVisible: true });
      }
    }
  };

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
    <>
      <div className={`min-h-screen bg-gray-50 ${isDeleteModalOpen || isModalOpen ? 'blur-sm' : ''}`} onClick={() => {
        if (showNotifications) setShowNotifications(false);
        if (showMobileMenu) setShowMobileMenu(false);
      }}>
        <NavigationBlocker />
        <Toast 
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
        />
        
        {/* Top Navigation */}
        <div className="bg-white border-b">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-semibold text-gray-900">Admin</span>
              </div>
              
              <nav className="hidden md:flex space-x-8">
                {navTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`text-sm font-medium py-4 border-b-2 transition-colors ${
                      activeTab === tab
                        ? "text-blue-600 border-blue-600"
                        : "text-gray-500 border-transparent hover:text-gray-700"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </nav>
              
              <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  onClick={() => setShowMobileMenu(!showMobileMenu)}
                  className="md:hidden p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  {showMobileMenu ? <X className="w-5 h-5 text-gray-400 hover:text-gray-600" /> : <Menu className="w-5 h-5 text-gray-400 hover:text-gray-600" />}
                </button>
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <Bell className="w-5 h-5 text-gray-400 hover:text-gray-600" />
                    {pendingCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                  
                  {showNotifications && (
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-4 border-b border-gray-100">
                        <h3 className="font-semibold text-gray-900">Pending Requests</h3>
                        <p className="text-sm text-gray-500">{pendingCount} new requests</p>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {leaveRequests.filter(req => req.status === "Pending").slice(0, 5).map((request) => (
                          <div key={request.id} className="p-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium text-sm text-gray-900">{request.employeeName}</p>
                                <p className="text-xs text-gray-500">{request.leaveType}</p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setIsModalOpen(true);
                                  setShowNotifications(false);
                                }}
                                className="text-blue-500 text-xs hover:text-blue-700"
                              >
                                View
                              </button>
                            </div>
                          </div>
                        ))}
                        {pendingCount === 0 && (
                          <div className="p-4 text-center text-gray-500 text-sm">
                            No pending requests
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <Image
                  src={user.image}
                  alt={user.name}
                  width={32}
                  height={32}
                  className="w-8 h-8 rounded-full cursor-pointer"
                  onClick={logout}
                />
              </div>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden border-t border-gray-200 bg-white">
              <div className="px-4 py-2 space-y-1">
                {navTabs.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setShowMobileMenu(false);
                    }}
                    className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === tab
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Leave Request Header */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Leave Request</h1>
            <p className="text-gray-500 mt-1">Manage Requests</p>
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-80 pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-500"
              />
            </div>
            
            <div className="flex overflow-x-auto rounded-lg p-1">
              {statusTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium rounded-md transition-all cursor-pointer whitespace-nowrap ${
                    statusFilter === tab
                      ? "bg-gray-100 text-blue-600 shadow-sm"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
          <div className="bg-white rounded-lg border border-gray-200">

            {error ? (
              <div className="p-8 text-center">
                <p className="text-red-600">{error}</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                        Employee
                      </th>
                      <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase hidden sm:table-cell">
                        Leave Type
                      </th>
                      <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                        Dates
                      </th>
                      <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                        Status
                      </th>
                      <th className="px-3 sm:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {leaveRequests
                      .filter(request => {
                        const matchesSearch = request.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          request.leaveType.toLowerCase().includes(searchQuery.toLowerCase());
                        const matchesStatus = statusFilter === "All Request" || 
                          (statusFilter === "Approve" && request.status === "Approved") ||
                          request.status === statusFilter;
                        return matchesSearch && matchesStatus;
                      })
                      .map((request) => (
                        <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 sm:px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {request.employeeName}
                            </div>
                            <div className="text-xs text-gray-500 sm:hidden">
                              {request.leaveType}
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4 text-sm text-gray-600 hidden sm:table-cell">
                            {request.leaveType}
                          </td>
                          <td className="px-3 sm:px-6 py-4">
                            <div className="text-sm text-gray-600">
                              {new Date(request.startDate).toLocaleDateString()}
                            </div>
                            <div className="text-xs text-gray-500">
                              to {new Date(request.endDate).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-4">
                            <span className={`inline-flex px-2 sm:px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                              {request.status}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-4">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedRequest(request);
                                  setIsModalOpen(true);
                                }}
                                className="group relative inline-flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-500 cursor-pointer"
                              >
                                <Eye className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 group-hover:scale-110 transition-transform duration-200" />
                                <span className="relative hidden sm:inline">View Details</span>
                                <span className="relative sm:hidden">View</span>
                                <div className="absolute inset-0 rounded-lg bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteRequest(request);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="group relative inline-flex items-center px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-red-500 cursor-pointer"
                              >
                                <Trash2 className="w-3 sm:w-4 h-3 sm:h-4 mr-1 sm:mr-2 group-hover:scale-110 transition-transform duration-200" />
                                <span className="relative hidden sm:inline">Delete</span>
                                <span className="relative sm:hidden">Del</span>
                                <div className="absolute inset-0 rounded-lg bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-200"></div>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    {leaveRequests.filter(request => {
                      const matchesSearch = request.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        request.leaveType.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchesStatus = statusFilter === "All Request" || 
                        (statusFilter === "Approve" && request.status === "Approved") ||
                        request.status === statusFilter;
                      return matchesSearch && matchesStatus;
                    }).length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center">
                          <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                          <p className="text-gray-500 font-medium">No leave requests found</p>
                          <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter criteria</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        

      </div>
      
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        request={selectedRequest}
        onStatusUpdate={handleStatusUpdate}
      />
      
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeleteRequest(null);
        }}
        onConfirm={handleDeleteRequest}
        employeeName={deleteRequest?.employeeName || ''}
      />
    </>
  );
}
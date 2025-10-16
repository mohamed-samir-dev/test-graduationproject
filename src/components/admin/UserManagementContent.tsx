"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Filter, ArrowUpDown, Edit, Trash2, Search, AlertTriangle, X } from "lucide-react";
import { getUsers, deleteUser } from "@/lib/services/userService";
import { User } from "@/lib/types";

export default function UserManagementContent() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [sortBy, setSortBy] = useState("id");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; user: User | null }>({ isOpen: false, user: null });

  const handleDeleteClick = (user: User) => {
    setDeleteModal({ isOpen: true, user });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.user) return;
    
    setDeleting(deleteModal.user.id);
    try {
      await deleteUser(deleteModal.user.id);
      const userData = await getUsers();
      setUsers(userData);
      setDeleteModal({ isOpen: false, user: null });
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Error deleting user. Please try again.");
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, user: null });
  };
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const userData = await getUsers();
        setUsers(userData);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    // Exclude admin user (numericId 1)
    if (user.numericId === 1) return false;
    
    // Filter by search term (name or ID)
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const matchesName = user.name.toLowerCase().includes(searchLower);
      const matchesId = user.numericId?.toString().includes(searchTerm);
      if (!matchesName && !matchesId) return false;
    }
    
    // Filter by status
    if (filter === "All") return true;
    return user.status === filter;
  });

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === "name") return a.name.localeCompare(b.name);
    if (sortBy === "id") return (a.numericId || 0) - (b.numericId || 0);
    if (sortBy === "department")
      return (a.Department || a.department || "").localeCompare(
        b.Department || b.department || ""
      );
    return 0;
  });

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "OnLeave":
        return "bg-yellow-100 text-yellow-800";
      case "Inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Manage system users and their permissions
          </p>
        </div>
        <button 
          onClick={() => window.location.href = '/admin/add-employee'}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 transition-colors cursor-pointer w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden xs:inline">Add New Employee</span>
          <span className="xs:hidden">Add Employee</span>
        </button>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 mb-6">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="flex-1 sm:flex-none border border-gray-300 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="OnLeave">On Leave</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-center space-x-2">
            <ArrowUpDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 sm:flex-none border border-gray-300 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="name">Sort by Name</option>
              <option value="id">Sort by ID</option>
              <option value="department">Sort by Department</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Employee Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      src={user.image}
                      alt={user.name}
                      className="w-8 h-8 rounded-full mr-3"
                    />
                    <div className="text-sm font-medium text-gray-900">
                      {user.name}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.numericId || "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.email || "No email"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.Department || user.department || "Not Assigned"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      user.status
                    )}`}
                  >
                    {user.status || "Active"}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => router.push(`/admin/edit-employee?id=${user.id}`)}
                      className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 px-2 py-1 rounded-lg flex items-center space-x-1 transition-all duration-200 cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(user)}
                      disabled={deleting === user.id}
                      className="text-red-600 hover:text-red-900 hover:bg-red-50 px-2 py-1 rounded-lg flex items-center space-x-1 disabled:opacity-50 transition-all duration-200 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{deleting === user.id ? "Deleting..." : "Delete"}</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {sortedUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No users found matching the current filter.
          </div>
        )}
      </div>

      {/* Cards - Mobile */}
      <div className="lg:hidden space-y-4">
        {sortedUsers.map((user) => (
          <div key={user.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <img
                  src={user.image}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h3 className="font-medium text-gray-900">{user.name}</h3>
                  <p className="text-sm text-gray-500">ID: {user.numericId || "N/A"}</p>
                </div>
              </div>
              <span
                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                  user.status
                )}`}
              >
                {user.status || "Active"}
              </span>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Email:</span>
                <span className="text-gray-900">{user.email || "No email"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Department:</span>
                <span className="text-gray-900">{user.Department || user.department || "Not Assigned"}</span>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => router.push(`/admin/edit-employee?id=${user.id}`)}
                className="flex-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 px-3 py-2 rounded-lg flex items-center justify-center space-x-1 transition-all duration-200 cursor-pointer"
              >
                <Edit className="w-4 h-4" />
                <span>Edit</span>
              </button>
              <button 
                onClick={() => handleDeleteClick(user)}
                disabled={deleting === user.id}
                className="flex-1 text-red-600 hover:text-red-900 hover:bg-red-50 px-3 py-2 rounded-lg flex items-center justify-center space-x-1 disabled:opacity-50 transition-all duration-200 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>{deleting === user.id ? "Deleting..." : "Delete"}</span>
              </button>
            </div>
          </div>
        ))}
        
        {sortedUsers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No users found matching the current filter.
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl max-w-md w-full border border-white/30">
            <div className="relative p-4 lg:p-6 pb-3 lg:pb-4">
              <button
                onClick={handleDeleteCancel}
                disabled={deleting === deleteModal.user?.id}
                className="absolute top-3 right-3 lg:top-4 lg:right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
              >
                <X className="w-4 h-4 lg:w-5 lg:h-5" />
              </button>
              
              <div className="text-center">
                <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4 shadow-lg">
                  <div className="w-12 h-12 lg:w-16 lg:h-16 bg-red-500 rounded-full flex items-center justify-center shadow-inner">
                    <Trash2 className="w-6 h-6 lg:w-8 lg:h-8 text-white" />
                  </div>
                </div>
                
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 mb-2">Delete Employee</h2>
                <p className="text-gray-500 text-xs lg:text-sm">This action cannot be undone</p>
              </div>
            </div>

            <div className="px-4 lg:px-6 pb-4 lg:pb-6">
              <div className="bg-gray-50/80 backdrop-blur-sm rounded-xl p-3 lg:p-4 mb-4 lg:mb-6">
                <div className="flex items-center space-x-3">
                  {deleteModal.user?.image && (
                    <img
                      src={deleteModal.user.image}
                      alt={deleteModal.user.name}
                      className="w-10 h-10 lg:w-12 lg:h-12 rounded-full object-cover border-2 border-white shadow-sm flex-shrink-0"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm lg:text-base truncate">{deleteModal.user?.name}</h3>
                    <p className="text-xs lg:text-sm text-gray-500">Employee Account</p>
                  </div>
                </div>
              </div>

              <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-lg p-3 lg:p-4 mb-4 lg:mb-6">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium text-red-800 mb-1 text-sm lg:text-base">Warning</h4>
                    <p className="text-xs lg:text-sm text-red-700">
                      Deleting this employee will permanently remove all data.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  disabled={deleting === deleteModal.user?.id}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm lg:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleting === deleteModal.user?.id}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm lg:text-base"
                >
                  {deleting === deleteModal.user?.id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span className="hidden sm:inline">Deleting...</span>
                      <span className="sm:hidden">Deleting</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Delete Employee</span>
                      <span className="sm:hidden">Delete</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

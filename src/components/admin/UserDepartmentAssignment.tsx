'use client';

import { useState, useEffect } from 'react';
import { Users, Building, ArrowRight, Search } from 'lucide-react';
import { User, Department } from '@/lib/types';
import { getUsers, assignUserToDepartment, removeUserFromDepartment } from '@/lib/services/userService';
import { getCompanySettings } from '@/lib/services/settingsService';

interface UserDepartmentAssignmentProps {
  onAssignmentChange?: () => void;
}

export default function UserDepartmentAssignment({ onAssignmentChange }: UserDepartmentAssignmentProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [userData, settingsData] = await Promise.all([
        getUsers(),
        getCompanySettings()
      ]);
      
      setUsers(userData.filter(user => user.numericId !== 1)); // Exclude admin
      setDepartments(settingsData.departments);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignUser = async () => {
    if (!selectedUser || !selectedDepartment) return;

    try {
      await assignUserToDepartment(selectedUser.id, selectedDepartment);
      await fetchData();
      setSelectedUser(null);
      setSelectedDepartment('');
      onAssignmentChange?.();
    } catch (error) {
      console.error('Error assigning user:', error);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      await removeUserFromDepartment(userId);
      await fetchData();
      onAssignmentChange?.();
    } catch (error) {
      console.error('Error removing user:', error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.department || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getUsersByDepartment = (deptName: string) => {
    return users.filter(user => user.department === deptName || user.Department === deptName);
  };

  const unassignedUsers = users.filter(user => !user.department && !user.Department);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-2">
          <Users className="w-5 h-5 text-blue-600" />
          User Department Assignment
        </h3>
        <p className="text-sm text-gray-600">Assign employees to departments and manage organizational structure</p>
      </div>

      {/* Assignment Form */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
        <h4 className="font-medium text-gray-900 mb-4">Assign User to Department</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select User</label>
            <select
              value={selectedUser?.id || ''}
              onChange={(e) => {
                const user = users.find(u => u.id === e.target.value);
                setSelectedUser(user || null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option value="">Choose a user</option>
              {unassignedUsers.map(user => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.username})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option value="">Choose a department</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAssignUser}
            disabled={!selectedUser || !selectedDepartment}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <ArrowRight className="w-4 h-4" />
            Assign
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search users by name, username, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
        </div>
      </div>

      {/* Department Overview */}
      <div className="space-y-6">
        {/* Unassigned Users */}
        {unassignedUsers.length > 0 && (
          <div className="border border-orange-200 rounded-lg p-4 bg-orange-50">
            <h4 className="font-medium text-orange-900 mb-3 flex items-center gap-2">
              <Users className="w-4 h-4" />
              Unassigned Users ({unassignedUsers.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {unassignedUsers.map(user => (
                <div key={user.id} className="bg-white p-3 rounded border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-600">@{user.username}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Departments with Users */}
        {departments.map(dept => {
          const deptUsers = getUsersByDepartment(dept.name).filter(user =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.username.toLowerCase().includes(searchQuery.toLowerCase())
          );

          if (searchQuery && deptUsers.length === 0) return null;

          return (
            <div key={dept.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium text-gray-900">{dept.name}</h4>
                    <p className="text-sm text-gray-600">Head: {dept.head}</p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {deptUsers.length} employees
                </span>
              </div>

              {deptUsers.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {deptUsers.map(user => (
                    <div key={user.id} className="bg-gray-50 p-3 rounded border">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-600">@{user.username}</p>
                          {user.jobTitle && (
                            <p className="text-xs text-gray-500">{user.jobTitle}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveUser(user.id)}
                          className="text-red-600 hover:bg-red-100 p-1 rounded transition-colors"
                          title="Remove from department"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Users className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-sm">No employees assigned to this department</p>
                </div>
              )}
            </div>
          );
        })}

        {departments.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Building className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No departments created yet</p>
            <p className="text-sm">Create departments first to assign users</p>
          </div>
        )}
      </div>
    </div>
  );
}
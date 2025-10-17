'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Users, MapPin, DollarSign, Building } from 'lucide-react';
import { Department } from '@/lib/types';
import { 
  addDepartment, 
  updateDepartment, 
  deleteDepartment, 
  getDepartmentEmployees,
  updateDepartmentEmployeeCount 
} from '@/lib/services/settingsService';
import { getUsers } from '@/lib/services/userService';

interface DepartmentManagementProps {
  departments: Department[];
  onDepartmentsChange: () => void;
}

export default function DepartmentManagement({ departments, onDepartmentsChange }: DepartmentManagementProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{show: boolean, dept: Department | null}>({show: false, dept: null});
  const [newDepartment, setNewDepartment] = useState({
    name: '',
    head: '',
    headId: '',
    description: '',
    budget: '',
    location: ''
  });

  useEffect(() => {
    fetchUsers();
    updateEmployeeCounts();
  }, [departments]);

  const fetchUsers = async () => {
    try {
      const userData = await getUsers();
      setUsers(userData.filter(user => user.numericId !== 1)); // Exclude admin
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const updateEmployeeCounts = async () => {
    for (const dept of departments) {
      await updateDepartmentEmployeeCount(dept.id);
    }
  };

  const handleAddDepartment = async () => {
    if (!newDepartment.name || !newDepartment.head) return;

    try {
      const selectedHead = users.find(user => user.id === newDepartment.headId);
      await addDepartment({
        name: newDepartment.name,
        head: newDepartment.head,
        headId: newDepartment.headId,
        description: newDepartment.description,
        budget: newDepartment.budget ? parseFloat(newDepartment.budget) : undefined,
        location: newDepartment.location
      });
      
      setNewDepartment({ name: '', head: '', headId: '', description: '', budget: '', location: '' });
      setShowAddForm(false);
      onDepartmentsChange();
    } catch (error) {
      console.error('Error adding department:', error);
    }
  };

  const handleUpdateDepartment = async () => {
    if (!editingDept) return;

    try {
      await updateDepartment(editingDept.id, editingDept);
      setEditingDept(null);
      onDepartmentsChange();
    } catch (error) {
      console.error('Error updating department:', error);
    }
  };

  const handleDeleteClick = (dept: Department) => {
    setDeleteConfirm({show: true, dept});
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.dept) return;
    
    try {
      await deleteDepartment(deleteConfirm.dept.id);
      setSuccessMessage(`Department "${deleteConfirm.dept.name}" has been successfully deleted.`);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 3000);
      setDeleteConfirm({show: false, dept: null});
      onDepartmentsChange();
    } catch (error) {
      console.error('Error deleting department:', error);
    }
  };

  const getDepartmentEmployeeCount = async (deptName: string) => {
    const employees = await getDepartmentEmployees(deptName);
    return employees.length;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            Department Management
          </h3>
          <p className="text-sm text-gray-600 mt-1">Manage organizational departments and structure</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {/* Add Department Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
          <h4 className="font-medium text-gray-900 mb-4">Add New Department</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department Name *</label>
              <input
                type="text"
                value={newDepartment.name}
                onChange={(e) => setNewDepartment(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="e.g., Engineering"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department Head *</label>
              <select
                value={newDepartment.headId}
                onChange={(e) => {
                  const selectedUser = users.find(user => user.id === e.target.value);
                  setNewDepartment(prev => ({ 
                    ...prev, 
                    headId: e.target.value,
                    head: selectedUser ? selectedUser.name : ''
                  }));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
              >
                <option value="">Select department head</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={newDepartment.location}
                onChange={(e) => setNewDepartment(prev => ({ ...prev, location: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="e.g., Building A, Floor 3"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget ($)</label>
              <input
                type="number"
                value={newDepartment.budget}
                onChange={(e) => setNewDepartment(prev => ({ ...prev, budget: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                placeholder="e.g., 100000"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={newDepartment.description}
                onChange={(e) => setNewDepartment(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                rows={3}
                placeholder="Brief description of the department's role and responsibilities"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAddDepartment}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Department
            </button>
          </div>
        </div>
      )}

      {/* Departments List */}
      <div className="space-y-4">
        {departments.length > 0 ? (
          departments.map((dept) => (
            <div key={dept.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="text-lg font-semibold text-gray-900">{dept.name}</h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Active
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Head: {dept.head}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>Employees: {dept.employeeCount || 0}</span>
                    </div>
                    {dept.location && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{dept.location}</span>
                      </div>
                    )}
                    {dept.budget && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="w-4 h-4" />
                        <span>${dept.budget.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  
                  {dept.description && (
                    <p className="text-sm text-gray-600 mt-2">{dept.description}</p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingDept(dept)}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                    title="Edit Department"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteClick(dept)}
                    className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                    title="Delete Department"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            <Building className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>No departments created yet</p>
            <p className="text-sm">Click "Add Department" to get started</p>
          </div>
        )}
      </div>

      {/* Edit Department Modal */}
      {editingDept && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/20 flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/30">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Department</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department Name</label>
                  <input
                    type="text"
                    value={editingDept.name}
                    onChange={(e) => setEditingDept(prev => prev ? { ...prev, name: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department Head</label>
                  <select
                    value={editingDept.headId || ''}
                    onChange={(e) => {
                      const selectedUser = users.find(user => user.id === e.target.value);
                      setEditingDept(prev => prev ? { 
                        ...prev, 
                        headId: e.target.value,
                        head: selectedUser ? selectedUser.name : prev.head
                      } : null);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  >
                    <option value="">Select department head</option>
                    {users.map(user => (
                      <option key={user.id} value={user.id}>{user.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                  <input
                    type="text"
                    value={editingDept.location || ''}
                    onChange={(e) => setEditingDept(prev => prev ? { ...prev, location: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Budget ($)</label>
                  <input
                    type="number"
                    value={editingDept.budget || ''}
                    onChange={(e) => setEditingDept(prev => prev ? { ...prev, budget: parseFloat(e.target.value) || undefined } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editingDept.description || ''}
                    onChange={(e) => setEditingDept(prev => prev ? { ...prev, description: e.target.value } : null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingDept(null)}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateDepartment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 backdrop-blur-md bg-white/20 flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 backdrop-blur-xl rounded-lg shadow-xl max-w-md w-full p-6 border border-white/30">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Department</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete <strong>"{deleteConfirm.dept?.name}"</strong>?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm({show: false, dept: null})}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{successMessage}</span>
        </div>
      )}
    </div>
  );
}
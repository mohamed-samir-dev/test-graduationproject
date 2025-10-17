'use client';

import { useState, useEffect } from 'react';
import { Building } from 'lucide-react';
import { getCompanySettings } from '@/lib/services/settingsService';
import DepartmentManagement from './DepartmentManagement';
import UserDepartmentAssignment from './UserDepartmentAssignment';
import DepartmentAnalytics from './DepartmentAnalytics';

export default function DepartmentsContent() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await getCompanySettings();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg shadow-sm h-48 p-6">
                <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Building className="w-8 h-8 text-blue-600" />
          Department Management
        </h1>
        <p className="text-gray-600">Manage organizational departments, assignments, and analytics</p>
      </div>

      <div className="space-y-6">
        <DepartmentAnalytics />
        
        <DepartmentManagement 
          departments={settings?.departments || []} 
          onDepartmentsChange={fetchSettings}
        />

        <UserDepartmentAssignment 
          onAssignmentChange={fetchSettings}
        />
      </div>
    </div>
  );
}
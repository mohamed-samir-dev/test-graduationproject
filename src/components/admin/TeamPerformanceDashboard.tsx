'use client';

import { useState, useEffect } from 'react';
import { Users, UserCheck, UserX } from 'lucide-react';
import { AttendanceStats, DepartmentStats } from '@/lib/types';
import { getAttendanceStats, getDepartmentStats } from '@/lib/services/attendanceService';
import AttendanceOverview from './AttendanceOverview';

interface MetricCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function MetricCard({ title, value, icon, color }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function TeamPerformanceDashboard() {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('All');
  const [stats, setStats] = useState<AttendanceStats | null>(null);
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [attendanceStats, deptStats] = await Promise.all([
          getAttendanceStats(),
          getDepartmentStats()
        ]);
        setStats(attendanceStats);
        setDepartmentStats(deptStats);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getCurrentStats = () => {
    if (selectedDepartment === 'All') {
      return stats;
    }
    return departmentStats.find(dept => dept.department === selectedDepartment) || null;
  };

  const currentStats = getCurrentStats();

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Team Performance Dashboard</h1>
          <p className="text-gray-600">Monitor team attendance and performance metrics in real-time</p>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Team / Department</h2>
          <div className="flex flex-wrap gap-2">
            {['All', 'IT', 'HR', 'Finance', 'Marketing', 'Sales'].map((dept) => (
              <button
                key={dept}
                onClick={() => setSelectedDepartment(dept)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedDepartment === dept
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Team Attendance Summary</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <MetricCard
            title="Total Team Members"
            value={currentStats?.totalMembers || 0}
            icon={<Users className="w-6 h-6 text-blue-600" />}
            color="bg-blue-100"
          />
          <MetricCard
            title="Present Today"
            value={currentStats?.presentToday || 0}
            icon={<UserCheck className="w-6 h-6 text-green-600" />}
            color="bg-green-100"
          />
          <MetricCard
            title="Absent Today"
            value={currentStats?.absentToday || 0}
            icon={<UserX className="w-6 h-6 text-red-600" />}
            color="bg-red-100"
          />
        </div>

        <AttendanceOverview />
      </div>
    </div>
  );
}
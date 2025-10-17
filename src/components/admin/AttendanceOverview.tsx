'use client';

import { useState, useEffect } from 'react';
import { Users, FileText } from 'lucide-react';
import { DepartmentStats, AbsenceReason } from '@/lib/types';
import { getDepartmentStats, getAbsenceReasons, getAttendanceStats } from '@/lib/services/attendanceService';

interface CircularProgressProps {
  percentage: number;
  total: number;
  present: number;
}

function CircularProgress({ percentage, present }: CircularProgressProps) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="8"
          fill="none"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="#10b981"
          strokeWidth="8"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-gray-900">{present}</span>
        <span className="text-sm text-green-600">Present</span>
      </div>
    </div>
  );
}

export default function AttendanceOverview() {
  const [departmentStats, setDepartmentStats] = useState<DepartmentStats[]>([]);
  const [absenceReasons, setAbsenceReasons] = useState<AbsenceReason[]>([]);
  const [totalStats, setTotalStats] = useState({ present: 0, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptStats, reasons, stats] = await Promise.all([
          getDepartmentStats(),
          getAbsenceReasons(),
          getAttendanceStats()
        ]);
        setDepartmentStats(deptStats);
        setAbsenceReasons(reasons);
        setTotalStats({ present: stats.presentToday, total: stats.totalMembers });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-96 rounded-lg"></div>;
  }

  const presentPercentage = totalStats.total > 0 ? Math.round((totalStats.present / totalStats.total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Department Attendance */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Attendance</h3>
        <div className="space-y-3">
          {departmentStats.map((dept) => (
            <div key={dept.department} className="flex justify-between items-center">
              <span className="text-gray-700">{dept.department}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">{dept.presentToday}/{dept.totalMembers}</span>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full" 
                    style={{ width: `${dept.totalMembers > 0 ? (dept.presentToday / dept.totalMembers) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Attendance Status */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Status</h3>
        <div className="flex justify-center">
          <CircularProgress 
            percentage={presentPercentage}
            total={totalStats.total}
            present={totalStats.present}
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="space-y-3">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Users className="w-5 h-5" />
            Manage Users
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            <FileText className="w-5 h-5" />
            View Leave Requests
          </button>
        </div>
      </div>

      {/* Common Absence Reasons */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Common Absence Reasons</h3>
        <div className="space-y-4">
          {absenceReasons.slice(0, 3).map((reason) => (
            <div key={reason.reason}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-700">{reason.reason}</span>
                <span className="text-sm font-medium text-gray-900">{reason.percentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ width: `${reason.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
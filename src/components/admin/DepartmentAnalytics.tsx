'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Users, TrendingUp, Building, DollarSign } from 'lucide-react';
import { Department } from '@/lib/types';
import { getCompanySettings, getDepartmentEmployees } from '@/lib/services/settingsService';

interface DepartmentStats {
  department: Department;
  employeeCount: number;
  budgetPerEmployee: number;
}

export default function DepartmentAnalytics() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [stats, setStats] = useState<DepartmentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalBudget, setTotalBudget] = useState(0);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const settings = await getCompanySettings();
      setDepartments(settings.departments);

      const departmentStats: DepartmentStats[] = [];
      let totalEmp = 0;
      let totalBud = 0;

      for (const dept of settings.departments) {
        const employees = await getDepartmentEmployees(dept.name);
        const employeeCount = employees.length;
        const budgetPerEmployee = dept.budget && employeeCount > 0 ? dept.budget / employeeCount : 0;

        departmentStats.push({
          department: dept,
          employeeCount,
          budgetPerEmployee
        });

        totalEmp += employeeCount;
        totalBud += dept.budget || 0;
      }

      setStats(departmentStats);
      setTotalEmployees(totalEmp);
      setTotalBudget(totalBud);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const largestDepartment = stats.reduce((prev, current) => 
    (prev.employeeCount > current.employeeCount) ? prev : current, stats[0]
  );

  const highestBudgetDept = stats.reduce((prev, current) => 
    ((prev.department.budget || 0) > (current.department.budget || 0)) ? prev : current, stats[0]
  );

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-2">
          <BarChart3 className="w-5 h-5 text-blue-600" />
          Department Analytics
        </h3>
        <p className="text-sm text-gray-600">Overview of departmental statistics and performance metrics</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3">
            <Building className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Departments</p>
              <p className="text-2xl font-bold text-blue-900">{departments.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-green-600 font-medium">Total Employees</p>
              <p className="text-2xl font-bold text-green-900">{totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center gap-3">
            <DollarSign className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-purple-600 font-medium">Total Budget</p>
              <p className="text-2xl font-bold text-purple-900">
                ${totalBudget.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm text-orange-600 font-medium">Avg. Employees/Dept</p>
              <p className="text-2xl font-bold text-orange-900">
                {departments.length > 0 ? Math.round(totalEmployees / departments.length) : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Department Breakdown */}
      {stats.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-base font-semibold text-gray-900">Department Breakdown</h4>
          
          <div className="space-y-3">
            {stats
              .sort((a, b) => b.employeeCount - a.employeeCount)
              .map((stat, index) => {
                const percentage = totalEmployees > 0 ? (stat.employeeCount / totalEmployees) * 100 : 0;
                
                return (
                  <div key={stat.department.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className={`w-3 h-3 rounded-full ${
                            index === 0 ? 'bg-blue-500' :
                            index === 1 ? 'bg-green-500' :
                            index === 2 ? 'bg-purple-500' : 'bg-gray-400'
                          }`}></div>
                          <h5 className="font-medium text-gray-900">{stat.department.name}</h5>
                          {stat.department === largestDepartment.department && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                              Largest
                            </span>
                          )}
                          {stat.department === highestBudgetDept.department && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                              Highest Budget
                            </span>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">Employees</p>
                            <p className="font-semibold text-gray-900">{stat.employeeCount}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Percentage</p>
                            <p className="font-semibold text-gray-900">{percentage.toFixed(1)}%</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Budget</p>
                            <p className="font-semibold text-gray-900">
                              ${(stat.department.budget || 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-600">Budget/Employee</p>
                            <p className="font-semibold text-gray-900">
                              ${stat.budgetPerEmployee.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="w-full sm:w-32">
                        <div className="bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              index === 0 ? 'bg-blue-500' :
                              index === 1 ? 'bg-green-500' :
                              index === 2 ? 'bg-purple-500' : 'bg-gray-400'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {stats.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No department data available</p>
          <p className="text-sm">Create departments and assign employees to see analytics</p>
        </div>
      )}
    </div>
  );
}
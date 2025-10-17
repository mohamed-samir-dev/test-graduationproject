'use client';

import { useState, useEffect } from 'react';
import { Plus, Save, X, Edit, Trash2 } from 'lucide-react';
import { CompanySettings, Holiday } from '@/lib/types';
import { getCompanySettings, addHoliday, updateHoliday, deleteHoliday } from '@/lib/services/settingsService';


export default function SettingsContent() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [newHoliday, setNewHoliday] = useState({ name: '', date: '', endDate: '' });

  const [editingHoliday, setEditingHoliday] = useState<Holiday | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [expiredHolidays, setExpiredHolidays] = useState<Set<string>>(new Set());
  const [originalWorkingHours, setOriginalWorkingHours] = useState({ startTime: '09:00', endTime: '17:00' });
  const [originalGracePeriod, setOriginalGracePeriod] = useState(15);

  const [workingHours, setWorkingHours] = useState({ startTime: '09:00', endTime: '17:00' });
  const [gracePeriod, setGracePeriod] = useState(15);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getCompanySettings();
        setSettings(data);
        setWorkingHours(data.workingHours);
        setOriginalWorkingHours(data.workingHours);
        setGracePeriod(data.attendanceRules.gracePeriod);
        setOriginalGracePeriod(data.attendanceRules.gracePeriod);
        
        // Check for expired holidays and send notifications
        const now = new Date();
        const newExpiredHolidays = new Set<string>();
        
        for (const holiday of data.holidays) {
          const endDate = new Date(holiday.endDate || holiday.date);
          if (endDate < now && !expiredHolidays.has(holiday.id)) {
            newExpiredHolidays.add(holiday.id);
            
            // Send notification for newly expired holiday
            try {
              const { createHolidayExpiredNotificationForAllEmployees } = await import('@/lib/services/notificationService');
              const message = `⏰ Holiday ended: ${holiday.name} has concluded. Hope you enjoyed it!`;
              await createHolidayExpiredNotificationForAllEmployees(message);
            } catch (error) {
              console.error('Error sending expired holiday notification:', error);
            }
          }
        }
        
        if (newExpiredHolidays.size > 0) {
          setExpiredHolidays(prev => new Set([...prev, ...newExpiredHolidays]));
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [expiredHolidays]);

  const handleAddHoliday = async () => {
    if (newHoliday.name && newHoliday.date) {
      try {
        await addHoliday(newHoliday);
        const updatedSettings = await getCompanySettings();
        setSettings(updatedSettings);
        setNewHoliday({ name: '', date: '', endDate: '' });
      } catch (error) {
        console.error('Error adding holiday:', error);
      }
    }
  };



  const handleEditHoliday = async () => {
    if (editingHoliday) {
      try {
        await updateHoliday(editingHoliday.id, editingHoliday);
        const updatedSettings = await getCompanySettings();
        setSettings(updatedSettings);
        setEditingHoliday(null);
        setIsEditModalOpen(false);
      } catch (error) {
        console.error('Error updating holiday:', error);
      }
    }
  };

  const openEditModal = (holiday: Holiday) => {
    setEditingHoliday(holiday);
    setIsEditModalOpen(true);
  };

  const handleSaveWorkingHours = async () => {
    try {
      const { createWorkingHoursChangeNotificationForAllEmployees } = await import('@/lib/services/notificationService');
      const message = `⏰ Working hours updated: New schedule is ${workingHours.startTime} - ${workingHours.endTime}`;
      await createWorkingHoursChangeNotificationForAllEmployees(message);
      setOriginalWorkingHours(workingHours);
    } catch (error) {
      console.error('Error saving working hours:', error);
    }
  };

  const handleCancelWorkingHours = () => {
    setWorkingHours(originalWorkingHours);
  };

  const hasWorkingHoursChanged = workingHours.startTime !== originalWorkingHours.startTime || workingHours.endTime !== originalWorkingHours.endTime;

  const handleSaveAttendanceRules = async () => {
    try {
      const { createAttendanceRulesChangeNotificationForAllEmployees } = await import('@/lib/services/notificationService');
      const message = `📋 Attendance rules updated: Grace period changed to ${gracePeriod} minutes`;
      await createAttendanceRulesChangeNotificationForAllEmployees(message);
      setOriginalGracePeriod(gracePeriod);
    } catch (error) {
      console.error('Error saving attendance rules:', error);
    }
  };

  const handleCancelAttendanceRules = () => {
    setGracePeriod(originalGracePeriod);
  };

  const hasAttendanceRulesChanged = gracePeriod !== originalGracePeriod;

  const handleDeleteHoliday = async (holidayId: string, holidayName: string) => {
    try {
      await deleteHoliday(holidayId, holidayName);
      const updatedSettings = await getCompanySettings();
      setSettings(updatedSettings);
    } catch (error) {
      console.error('Error deleting holiday:', error);
    }
  };



  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="space-y-6">
            {[1, 2, 3, 4].map(i => (
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
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Company Settings</h1>
      </div>

      <div className="space-y-4 sm:space-y-6">
        {/* Working Hours */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Working Hours</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Time</label>
              <select 
                value={workingHours.startTime}
                onChange={(e) => setWorkingHours(prev => ({ ...prev, startTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              >
                <option value="09:00">9:00 AM</option>
                <option value="08:00">8:00 AM</option>
                <option value="10:00">10:00 AM</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Time</label>
              <select 
                value={workingHours.endTime}
                onChange={(e) => setWorkingHours(prev => ({ ...prev, endTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
              >
                <option value="17:00">5:00 PM</option>
                <option value="18:00">6:00 PM</option>
                <option value="16:00">4:00 PM</option>
              </select>
            </div>
          </div>
          
          {hasWorkingHoursChanged && (
            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleCancelWorkingHours}
                className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveWorkingHours}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save Working Hours
              </button>
            </div>
          )}
        </div>

        {/* Holidays */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Holidays</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Holiday Name</label>
                <input
                  type="text"
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="e.g., New Year's Day"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={newHoliday.date}
                  onChange={(e) => setNewHoliday(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={newHoliday.endDate}
                  onChange={(e) => setNewHoliday(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                />
              </div>
              <button
                onClick={handleAddHoliday}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Holiday
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <h4 className="text-base sm:text-lg font-semibold text-gray-900">Upcoming Holidays</h4>
              {settings?.holidays && settings.holidays.length > 0 && (
                <span className="bg-white text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full border border-gray-300">
                  {settings.holidays.length}
                </span>
              )}
            </div>
            <div className="space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
              {settings?.holidays && settings.holidays.length > 0 ? (
                settings.holidays
                  .sort((a, b) => {
                    const now = new Date();
                    const aExpired = new Date(a.endDate || a.date) < now;
                    const bExpired = new Date(b.endDate || b.date) < now;
                    
                    // Active holidays first, then expired
                    if (aExpired && !bExpired) return 1;
                    if (!aExpired && bExpired) return -1;
                    
                    // Within same category, sort by date
                    return new Date(a.date).getTime() - new Date(b.date).getTime();
                  })
                  .map((holiday) => (
                  <div key={holiday.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-3 px-3 sm:px-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors gap-2">
                    <div className="flex-1">
                      <span className={`text-gray-900 font-medium text-sm sm:text-base ${
                        new Date(holiday.endDate || holiday.date) < new Date() 
                          ? 'line-through text-gray-400' 
                          : ''
                      }`}>
                        {holiday.name}
                      </span>
                      <div className={`text-gray-500 text-xs sm:text-sm ${
                        new Date(holiday.endDate || holiday.date) < new Date() 
                          ? 'line-through text-gray-400' 
                          : ''
                      }`}>
                        {new Date(holiday.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {holiday.endDate && ` - ${new Date(holiday.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                      </div>
                    </div>
                    <div className="flex space-x-2 self-end sm:self-center">
                      <button
                        onClick={() => openEditModal(holiday)}
                        className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition-colors"
                        title="Edit Holiday"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteHoliday(holiday.id, holiday.name)}
                        className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete Holiday"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  ))
              ) : (
                <div className="text-gray-500 text-sm text-center py-8">No holidays added yet</div>
              )}
            </div>
          </div>
        </div>



        {/* Attendance Rules */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Attendance Rules</h3>
          <div className="w-full sm:max-w-xs">
            <label className="block text-sm font-medium text-gray-700 mb-2">Grace Period (minutes)</label>
            <select 
              value={gracePeriod}
              onChange={(e) => setGracePeriod(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
            >
              <option value={15}>15</option>
              <option value={10}>10</option>
              <option value={30}>30</option>
            </select>
          </div>
          
          {hasAttendanceRulesChanged && (
            <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={handleCancelAttendanceRules}
                className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAttendanceRules}
                className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Save Attendance Rules
              </button>
            </div>
          )}
        </div>
      </div>



      {/* Edit Holiday Modal */}
      {isEditModalOpen && editingHoliday && (
        <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all border border-gray-200">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-black">Edit Holiday</h3>
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingHoliday(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Holiday Name
                  </label>
                  <input
                    type="text"
                    value={editingHoliday.name}
                    onChange={(e) => setEditingHoliday({...editingHoliday, name: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black bg-white"
                    placeholder="Enter holiday name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={editingHoliday.date}
                    onChange={(e) => setEditingHoliday({...editingHoliday, date: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black bg-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    End Date (Optional)
                  </label>
                  <input
                    type="date"
                    value={editingHoliday.endDate || ''}
                    onChange={(e) => setEditingHoliday({...editingHoliday, endDate: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-black bg-white"
                  />
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-6 sm:mt-8">
                <button
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setEditingHoliday(null);
                  }}
                  className="w-full sm:flex-1 px-4 py-3 text-black bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditHoliday}
                  className="w-full sm:flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
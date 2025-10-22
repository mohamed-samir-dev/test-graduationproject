interface ProfileSidebarProps {
  onUpdatePicture: () => void;
  onChangePassword: () => void;
}

export default function ProfileSidebar({
  onUpdatePicture,
  onChangePassword,
}: ProfileSidebarProps) {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
          Quick Actions
        </h3>
        <div className="space-y-2 sm:space-y-3">
          <button 
            onClick={onUpdatePicture}
            className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm sm:text-base"
          >
            Update Profile Picture
          </button>
          <button 
            onClick={onChangePassword}
            className="w-full text-left px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors text-sm sm:text-base"
          >
            Change Password
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-3 sm:mb-4">
          Account Status
        </h3>
        <div className="space-y-2 sm:space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-gray-600">Account Type</span>
            <span className="text-xs sm:text-sm font-medium text-green-600">
              Employee
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-gray-600">Status</span>
            <span className="text-xs sm:text-sm font-medium text-green-600">
              Active
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm text-gray-600">Last Login</span>
            <span className="text-xs sm:text-sm text-gray-900">Today</span>
          </div>
        </div>
      </div>
    </div>
  );
}
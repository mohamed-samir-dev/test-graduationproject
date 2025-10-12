"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getUsers } from "@/lib/services/userService";
import { User } from "@/lib/types";
import { LoadingSpinner, SearchInput } from "@/components/ui";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUsers();
        setUsers(data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredUsers = users.filter((user: User) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-600 font-medium">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2 sm:mb-4">Our Team</h1>
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg max-w-2xl mx-auto px-4">Meet our amazing team members who make everything possible</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-sm sm:max-w-md mx-auto mb-6 sm:mb-8 px-4 sm:px-0">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search users..."
          />
        </div>

        {/* Users Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 sm:gap-6">
          {filteredUsers.map((user, index) => (
            <div 
              key={user.id} 
              className="group bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-white/20 hover:scale-105"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-center">
                <div className="relative mb-3 sm:mb-4">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                  <Image
                    src={user.image}
                    alt={user.name}
                    width={80}
                    height={80}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full mx-auto relative z-10 border-3 border-white shadow-lg group-hover:border-blue-200 transition-all duration-300"
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-green-400 rounded-full border-2 border-white z-20"></div>
                </div>
                <h2 className="font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors duration-300 text-sm sm:text-base truncate">{user.name}</h2>
                <p className="text-gray-500 text-xs sm:text-sm mb-2 sm:mb-3 truncate">@{user.username}</p>
                <div className="flex justify-center space-x-1 sm:space-x-2">
                  <button className="p-1.5 sm:p-2 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors duration-200">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </button>
                  <button className="p-1.5 sm:p-2 rounded-full bg-purple-100 text-purple-600 hover:bg-purple-200 transition-colors duration-200">
                    <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-8 sm:py-12 px-4">
            <svg className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-2">No users found</h3>
            <p className="text-gray-500 text-sm sm:text-base">Try adjusting your search terms</p>
          </div>
        )}
      </div>
    </div>
  );
}
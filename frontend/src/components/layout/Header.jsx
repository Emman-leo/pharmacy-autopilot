// Header Component
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Header = ({ user, onMenuClick }) => {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white shadow">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Menu button and title */}
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="mr-4 text-gray-500 hover:text-gray-700 lg:hidden"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-xl font-semibold text-gray-800">
            Pharmacy Management System
          </h1>
        </div>

        {/* Right side - User info and logout */}
        <div className="flex items-center">
          <div className="mr-4 text-sm text-gray-600">
            <span className="font-medium">{user?.full_name}</span>
            <span className="mx-2">•</span>
            <span className="capitalize">{user?.role}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
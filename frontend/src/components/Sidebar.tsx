// Sidebar.js

import React from 'react';

export default function Sidebar({ sidebarOpen, setSidebarOpen }) {
  return (
    <aside
      className={`bg-white w-64 min-h-screen flex flex-col transition-all duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 z-50 lg:relative lg:translate-x-0`}
    >
      <div className="p-4 border-b">
        <h2 className="text-2xl font-semibold">Finance Tracker</h2>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-3">
          <li>
            <a href="#" className="block px-4 py-2 rounded-md hover:bg-gray-100">
              Dashboard
            </a>
          </li>
          <li>
            <a href="#" className="block px-4 py-2 rounded-md hover:bg-gray-100">
              Transactions
            </a>
          </li>
          <li>
            <a href="#" className="block px-4 py-2 rounded-md hover:bg-gray-100">
              Budgets
            </a>
          </li>
          <li>
            <a href="#" className="block px-4 py-2 rounded-md hover:bg-gray-100">
              Reports
            </a>
          </li>
          <li>
            <a href="#" className="block px-4 py-2 rounded-md hover:bg-gray-100">
              Settings
            </a>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
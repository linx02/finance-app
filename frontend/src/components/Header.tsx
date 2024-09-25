// Header.js

import React from 'react';
import { Button } from '@/components/ui/button';
import { Mail, Menu } from 'lucide-react';

export default function Header({ setSidebarOpen }) {
  return (
    <header className="bg-white shadow-sm z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen((prev) => !prev)}>
          <Menu className="h-6 w-6" />
        </Button>
        <h1 className="text-2xl font-semibold text-gray-900">Finance Dashboard</h1>
        <Button variant="ghost" size="icon">
          <Mail className="h-6 w-6" />
        </Button>
      </div>
    </header>
  );
}
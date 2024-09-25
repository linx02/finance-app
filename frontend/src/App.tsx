// Dashboard.js

import React from 'react';
import Sidebar from '@/components/Sidebar';
import { Toaster } from "@/components/ui/toaster"
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ControlPanel from '@/components/ControlPanel';
import InvoicesSection from '@/components/InvoicesSection';
import PotentialBillsSection from '@/components/PotentialBillsSection';
import TransactionsSection from '@/components/TransactionsSection';
import { useEffect, useState } from 'react';

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const emails = [
    { id: 1, sender: 'Netflix', subject: 'Your monthly subscription', amount: 14.99 },
    { id: 2, sender: 'Amazon', subject: 'Invoice for your recent purchase', amount: 79.99 },
    { id: 3, sender: 'Gym Membership', subject: 'Monthly fee due', amount: 49.99 },
  ];

  const transactions = [
    { id: 1, name: 'Grocery Shopping', category: 'Food', amount: -85.32, date: '2023-07-15' },
    { id: 2, name: 'Salary Deposit', category: 'Income', amount: 3200.0, date: '2023-07-01' },
    { id: 3, name: 'Electric Bill', category: 'Utilities', amount: -124.56, date: '2023-06-28' },
    { id: 4, name: 'Online Purchase', category: 'Shopping', amount: -59.99, date: '2023-06-25' },
  ];

  return (
    <div className="flex overflow-hidden bg-white">
      {/* <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} /> */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* <Header setSidebarOpen={setSidebarOpen} /> */}
        <main className="flex-1 overflow-y-auto p-4">
          <div className=" space-y-6">
            <HeroSection />
            <ControlPanel />
            <InvoicesSection />
            <PotentialBillsSection emails={emails} />
            <TransactionsSection />
          </div>
        </main>
        <Toaster />
      </div>
    </div>
  );
}
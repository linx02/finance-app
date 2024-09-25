// HeroSection.js

import React from 'react';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { getStatistics } from '../api';

interface PieChartData {
  name: string;
  value: number;
  color: string;
}

export default function HeroSection() {

  const [incomeData, setIncomeData] = useState<PieChartData[]>([]);

  useEffect(() => {
    getStatistics().then((result) => {
      result.total_invoices_amount = result.total_invoices_amount || 0;
      result.total_expenses = result.total_expenses || 0;
      result.total_income = result.total_income || 0;
      result.balance.balances[0].balanceAmount.amount = parseFloat(result.balance.balances[0].balanceAmount.amount) || 0;
      const pieChartData = [
        { name: 'Balance', value: result.balance.balances[0].balanceAmount.amount, color: '#22c55e' },
        { name: 'To be paid', value: result.total_invoices_amount + result.total_expenses, color: '#ff474c' },
        { name: 'P / L', value: result.balance.balances[0].balanceAmount.amount + result.total_income - result.total_invoices_amount - result.total_expenses, color: '#000000' },
      ];
      console.log(pieChartData);
      setIncomeData(pieChartData);
    });
  }, []);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ResponsiveContainer width="100%" height={300} className='flex'>
              <PieChart>
                <Pie
                  data={incomeData.slice(0, 2)}
                  cx="50%"
                  cy="50%"
                  innerRadius={100}
                  outerRadius={140}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {incomeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col justify-between py-8">
            {incomeData.map((item, index) => (
              <div key={index}>
                <p className="text-sm font-medium text-gray-500">{item.name}</p>
                <p className={`mt-1 text-3xl font-semibold ${item.value > 0 && item.name !== 'To be paid' ? 'text-green-500' : 'text-red-500'}`}>{item.value.toLocaleString()}kr</p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
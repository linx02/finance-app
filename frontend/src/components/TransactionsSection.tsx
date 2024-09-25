// TransactionsSection.js

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState, useEffect } from 'react';
import { getTransactions } from '@/api';

export default function TransactionsSection() {

  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    getTransactions('2024-08-01', '2024-09-01')
      .then((data) => {
        setTransactions(data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  const incomeTransactions = transactions.filter((t) => t.amount > 0);
  const expenseTransactions = transactions.filter((t) => t.amount < 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
        <CardDescription>Your recent financial activities</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>
          <TabsContent value="all">
            <TransactionList transactions={transactions} />
          </TabsContent>
          <TabsContent value="income">
            <TransactionList transactions={incomeTransactions} />
          </TabsContent>
          <TabsContent value="expenses">
            <TransactionList transactions={expenseTransactions} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function TransactionList({ transactions }) {
  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="flex items-center justify-between">
          <div>
            <p className="font-medium">{transaction.description}</p>
            <p className="text-sm text-gray-500">
              {transaction.additional_info} • {transaction.date}
            </p>
          </div>
          <p className={`font-medium ${parseFloat(transaction.amount) > 0 ? 'text-green-600' : 'text-red-600'}`}>
            {transaction.amount}kr
          </p>
        </div>
      ))}
    </div>
  );
}
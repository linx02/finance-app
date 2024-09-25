// InvoicesSection.js

import React from 'react';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Toggle } from '@/components/ui/toggle';
import { Button } from '@/components/ui/button';
import { getAllInvoices, getAllExpenses } from '../api';
import EditInvoiceModal from './EditInvoiceModal';
import EditExpenseModal from './EditExpenseModal';
import { useToast } from '@/hooks/use-toast';
import { getInvoice } from '../api';
import { Eye } from 'lucide-react';
import PayDialog from './PayDialog';

export default function InvoicesSection() {

  const { toast } = useToast();

  const [invoices, setInvoices] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [showPaid, setShowPaid] = useState(false);

  function base64ToBlob(base64Data: string, contentType: string) {
    const byteCharacters = atob(base64Data);
    const byteArrays = [];
  
    for (let offset = 0; offset < byteCharacters.length; offset += 512) {
      const slice = byteCharacters.slice(offset, offset + 512);
  
      const byteNumbers = new Array(slice.length);
      for (let i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
  
      const byteArray = new Uint8Array(byteNumbers);
  
      byteArrays.push(byteArray);
    }
  
    const blob = new Blob(byteArrays, { type: contentType });
    return blob;
  }
  
    const handleViewPDF = (id?: number) => {
      if (!id) {
        toast({
          title: 'Error',
          description: 'No PDF data available.',
          variant: 'destructive',
        });
        return;
      }

      getInvoice(id).then((data) => {
        const base64Data = data.pdf_data;
        const contentType = 'application/pdf';
        const blob = base64ToBlob(base64Data, contentType);
        const blobUrl = URL.createObjectURL(blob);
        window.open(blobUrl, '_blank');
        setTimeout(() => {
          URL.revokeObjectURL(blobUrl);
        }, 1000 * 60);
      });
    };

  useEffect(() => {
    getAllInvoices().then((result) => {
      result.sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime());
      setInvoices(result);
    });

    getAllExpenses().then((result) => {
      result.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setExpenses(result);
    });
  }, []);

  const dueDateColor = (due_date: string) => {
    const now = new Date();
    const due = new Date(due_date);
    if (due < now) {
      return 'text-red-500';
    }
    if ((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 3) {
      return 'text-yellow-500';
    }
    return 'text-gray-500';
  }

  const refresh = () => {
    window.location.reload();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoices</CardTitle>
        <div className='flex justify-between items-center'>
        <CardDescription>Upcoming invoices</CardDescription>
        <Toggle onClick={() => setShowPaid(!showPaid)}>Show already paid</Toggle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invoices.map((invoice) => (
            !invoice.status || showPaid ?
            <div key={invoice.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{invoice.issuer}</p>
                <p className={`text-sm ${dueDateColor(invoice.due_date)}`}>Due: {invoice.due_date}</p>
              </div>
              <div className="flex items-center space-x-2">
                {invoice.needs_completion && <p className="font-medium mr-4 text-red-500 flex items-center"><svg fill="#dd524c" className='mr-2' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="18" height="18"><path d="M256 512A256 256 0 1 0 256 0a256 256 0 1 0 0 512zm0-384c13.3 0 24 10.7 24 24l0 112c0 13.3-10.7 24-24 24s-24-10.7-24-24l0-112c0-13.3 10.7-24 24-24zM224 352a32 32 0 1 1 64 0 32 32 0 1 1 -64 0z"/></svg> Needs completion</p>}
                <p className="font-medium mr-4">{invoice.amount.toFixed(2)}kr</p>
                <Button onClick={() => handleViewPDF(invoice.id)}><Eye /></Button>
                <PayDialog id={invoice.id} refresh={refresh} />
                <EditInvoiceModal id={invoice.id} refresh={refresh} />
              </div>
            </div>
            : null
          ))}
        </div>
      </CardContent>
      <div className='h-[1px] bg-neutral-200' />
      <CardHeader>
        <CardTitle>Expenses</CardTitle>
        <CardDescription>Upcoming expenses</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expenses.map((expense) => (
            <div key={expense.id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{expense.description}</p>
                <p className="text-sm text-gray-500">Due: {expense.date}</p>
              </div>
              <div className="flex items-center">
                <p className="font-medium mr-4">{expense.amount.toFixed(2)}kr</p>
                <EditExpenseModal id={expense.id} refresh={refresh} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
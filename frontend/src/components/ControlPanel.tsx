// ControlPanel.tsx

import React, { useState } from 'react';
import { FilePlus, HandCoins, CreditCard } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { uploadInvoice } from '../api';
import AddExpenseModal from './AddExpenseModal'; // Import the AddExpenseModal component
import AddIncomeModal from './AddIncomeModal';   // Import the new AddIncomeModal component
import { useToast } from "@/hooks/use-toast";

export default function ControlPanel() {
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const allowedExtensions = ['pdf', 'PDF'];

    if (e.target.files) {
      const extension = e.target.files[0].name.split('.').pop();
      if (extension && !allowedExtensions.includes(extension)) {
        toast({
          title: 'Error',
          description: 'Invalid file type. Only PDF files are allowed.',
          variant: 'destructive',
        });
        return;
      }
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (file) {
      console.log('Uploading file...');

      const formData = new FormData();
      formData.append('invoice', file);

      try {
        const result = await uploadInvoice(formData);
        toast({
          title: 'Success',
          description: result.message,
        });
      } catch (error) {
        console.error(error);
        toast({
          title: 'Error',
          description: 'An error occurred during file upload',
          variant: 'destructive',
        });
      }

      window.location.reload();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Control Panel</CardTitle>
        <CardDescription>Manage your finances</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-6">
          <div>
            <Label htmlFor="upload-invoice">Upload Invoice</Label>
            <div className="mt-1 flex">
              <Input id="upload-invoice" type="file" className="sr-only" onChange={handleFileChange} />
              <label
                htmlFor="upload-invoice"
                className="cursor-pointer flex items-center justify-center w-full px-4 py-2 border-l border-t border-b border-gray-300 rounded-l-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 truncate ..."
              >
                <FilePlus className="w-5 h-5 mr-2" />
                {file?.name ? file.name : 'Choose file'}
              </label>
              <Button className="px-4 py-2 border border-gray-300 rounded-l-sm shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50" onClick={handleUpload}>Upload</Button>
            </div>
          </div>
          <div>
            <Label htmlFor="add-expense">Add Expense</Label>
            <div className="mt-1 flex space-x-2">
              <AddExpenseModal />
              <AddExpenseModal recurring={true} />
            </div>
          </div>
          <div>
            <Label htmlFor="add-income">Add Income</Label>
            <div className="mt-1 flex space-x-2">
              <AddIncomeModal />
              <AddIncomeModal recurring={true} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
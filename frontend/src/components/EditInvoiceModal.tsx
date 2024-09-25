// EditInvoiceModal.tsx

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { getInvoice, updateInvoice, deleteInvoice } from '../api';

interface InvoiceData {
  id: number;
  amount: number | '';
  bankgiro: string;
  created_at: string;
  due_date: Date | undefined;
  filename: string;
  issuer: string;
  needs_completion: boolean;
  ocr: string;
  pdf_data: string;
  plusgiro: string;
  status: boolean; // false = unpaid, true = paid
}

interface EditInvoiceModalProps {
  id: number;
  refresh: () => void;
}

export default function EditInvoiceModal({ id, refresh }: EditInvoiceModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getInvoice(id)
        .then((data) => {
          setInvoiceData({
            ...data,
            amount: data.amount || '',
            due_date: data.due_date ? new Date(data.due_date) : undefined,
          });
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
          toast({
            title: 'Error',
            description: 'Failed to fetch invoice data.',
            variant: 'destructive',
          });
          setLoading(false);
        });
    }
  }, [isOpen, id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInvoiceData((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleDateChange = (date: Date | undefined) => {
    setInvoiceData((prev) => (prev ? { ...prev, due_date: date } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!invoiceData) return;

    try {
      await updateInvoice({
        ...invoiceData,
        due_date: invoiceData.due_date ? invoiceData.due_date.toISOString().split('T')[0] : null,
      });
      toast({
        title: 'Success',
        description: 'Invoice updated successfully.',
      });
      setIsOpen(false);
      refresh(); // Refresh the invoice list
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'An error occurred while updating the invoice.',
        variant: 'destructive',
      });
    }

  };

  const handleDelete = async () => {
    if (!invoiceData) return;

    try {
      await deleteInvoice(invoiceData.id);
      toast({
        title: 'Success',
        description: 'Invoice deleted successfully.',
      });
      setIsOpen(false);
      setIsConfirmDeleteOpen(false);
      // Optionally, trigger a refresh of the invoice list in the parent component
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'An error occurred while deleting the invoice.',
        variant: 'destructive',
      });
    }

    refresh(); // Refresh the invoice list
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <Edit className="w-5 h-5 mr-2" />
            Edit
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px] bg-white">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
            <DialogDescription>Update the invoice details below.</DialogDescription>
          </DialogHeader>
          {loading ? (
            <div className="p-4">Loading...</div>
          ) : invoiceData ? (
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                {/* Issuer */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="issuer" className="text-right">
                    Issuer
                  </Label>
                  <Input
                    id="issuer"
                    name="issuer"
                    value={invoiceData.issuer}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                {/* Amount */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="amount" className="text-right">
                    Amount
                  </Label>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    value={invoiceData.amount}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                {/* Due Date */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="due_date" className="text-right">
                    Due Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="due_date"
                        variant="outline"
                        className={`col-span-3 justify-start text-left font-normal ${
                          !invoiceData.due_date && 'text-muted-foreground'
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {invoiceData.due_date ? (
                          format(invoiceData.due_date, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white">
                      <Calendar
                        mode="single"
                        selected={invoiceData.due_date}
                        onSelect={handleDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {/* Bankgiro */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="bankgiro" className="text-right">
                    Bankgiro
                  </Label>
                  <Input
                    id="bankgiro"
                    name="bankgiro"
                    value={invoiceData.bankgiro}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                {/* Plusgiro */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="plusgiro" className="text-right">
                    Plusgiro
                  </Label>
                  <Input
                    id="plusgiro"
                    name="plusgiro"
                    value={invoiceData.plusgiro}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                {/* OCR */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ocr" className="text-right">
                    OCR
                  </Label>
                  <Input
                    id="ocr"
                    name="ocr"
                    value={invoiceData.ocr}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <div className="flex space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                  <Button type="button" variant="destructive" className='text-red-500' onClick={() => setIsConfirmDeleteOpen(true)}>
                    Delete
                  </Button>
                </div>
              </DialogFooter>
            </form>
          ) : (
            <div className="p-4 text-center">No data available.</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for Deletion */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent className='bg-white'>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this invoice? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" className='text-red-500' onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
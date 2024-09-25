// PayDialog.tsx

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Copy, CreditCard, Check } from 'lucide-react';
import { getInvoice, updateInvoice } from '../api'; // Import updateInvoice function

interface InvoiceData {
  id: number;
  amount: number | '';
  bankgiro: string;
  plusgiro: string;
  ocr: string;
  status: boolean; // false = unpaid, true = paid
}

interface PayDialogProps {
  id: number;
  refresh: () => void;
}

export default function PayDialog({ id, refresh }: PayDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getInvoice(id)
        .then((data) => {
          setInvoiceData({
            id: data.id,
            amount: data.amount || '',
            bankgiro: data.bankgiro || '',
            plusgiro: data.plusgiro || '',
            ocr: data.ocr || '',
            status: data.status,
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

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast({
          title: 'Copied',
          description: `${label} copied to clipboard.`,
        });
      },
      (err) => {
        console.error(err);
        toast({
          title: 'Error',
          description: `Failed to copy ${label}.`,
          variant: 'destructive',
        });
      }
    );
  };

  const handleMarkAsPaid = async () => {
    if (!invoiceData) return;

    setUpdatingStatus(true);
    try {
      await updateInvoice({
        ...invoiceData,
        status: true, // Mark as paid
      });
      toast({
        title: 'Success',
        description: 'Invoice marked as paid.',
      });
      setInvoiceData((prev) => (prev ? { ...prev, status: true } : prev));
      setUpdatingStatus(false);
      setIsOpen(false); // Close the dialog after marking as paid
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'An error occurred while updating the invoice.',
        variant: 'destructive',
      });
      setUpdatingStatus(false);
    }

    refresh(); // Refresh the invoice list
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
          <CreditCard className="w-5 h-5 mr-2" />
          Pay
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] bg-white">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
        </DialogHeader>
        {loading ? (
          <div className="p-4">Loading...</div>
        ) : invoiceData ? (
          <div className="p-4 space-y-4">
            {/* Bankgiro */}
            {invoiceData.bankgiro && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Bankgiro</p>
                  <p className="text-sm text-gray-500">{invoiceData.bankgiro}</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(invoiceData.bankgiro, 'Bankgiro')}
                  aria-label="Copy Bankgiro"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
            {/* Plusgiro */}
            {invoiceData.plusgiro && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Plusgiro</p>
                  <p className="text-sm text-gray-500">{invoiceData.plusgiro}</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(invoiceData.plusgiro, 'Plusgiro')}
                  aria-label="Copy Plusgiro"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
            {/* OCR */}
            {invoiceData.ocr && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">OCR</p>
                  <p className="text-sm text-gray-500">{invoiceData.ocr}</p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopy(invoiceData.ocr, 'OCR')}
                  aria-label="Copy OCR"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            )}
            {/* Amount */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Amount</p>
                <p className="text-sm text-gray-500">{invoiceData.amount}</p>
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(invoiceData.amount.toString(), 'Amount')}
                aria-label="Copy Amount"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center">No data available.</div>
        )}
        <DialogFooter>
          <Button
            variant="default"
            onClick={handleMarkAsPaid}
            disabled={invoiceData?.status || updatingStatus}
          >
            <Check className="w-4 h-4 mr-2" />
            {invoiceData?.status ? 'Already Paid' : 'I have paid'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
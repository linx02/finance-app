// EditExpenseModal.tsx

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
import { getExpense, updateExpense, deleteExpense } from '../api';

interface ExpenseData {
  id: number;
  category: string;
  description: string;
  amount: number | '';
  date: Date | undefined;
  created_at: string;
}

interface EditExpenseModalProps {
  id: number;
  refresh: () => void;
}

export default function EditExpenseModal({ id, refresh }: EditExpenseModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expenseData, setExpenseData] = useState<ExpenseData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getExpense(id)
        .then((data) => {
          setExpenseData({
            ...data,
            amount: data.amount || '',
            date: data.date ? new Date(data.date) : undefined,
          });
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
          toast({
            title: 'Error',
            description: 'Failed to fetch expense data.',
            variant: 'destructive',
          });
          setLoading(false);
        });
    }
  }, [isOpen, id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setExpenseData((prev) => (prev ? { ...prev, [name]: value } : prev));
  };

  const handleDateChange = (date: Date | undefined) => {
    setExpenseData((prev) => (prev ? { ...prev, date } : prev));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseData) return;

    try {
      await updateExpense({
        ...expenseData,
        date: expenseData.date ? expenseData.date.toISOString().split('T')[0] : null,
      });
      toast({
        title: 'Success',
        description: 'Expense updated successfully.',
      });
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'An error occurred while updating the expense.',
        variant: 'destructive',
      });
    }

    // Refresh the expense list in the parent component
    refresh();
  };

  const handleDelete = async () => {
    if (!expenseData) return;

    try {
      await deleteExpense(expenseData.id);
      toast({
        title: 'Success',
        description: 'Expense deleted successfully.',
      });
      setIsOpen(false);
      setIsConfirmDeleteOpen(false);
      // Optionally, trigger a refresh of the expense list in the parent component
      refresh();
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'An error occurred while deleting the expense.',
        variant: 'destructive',
      });
    }
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
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>Update the expense details below.</DialogDescription>
          </DialogHeader>
          {loading ? (
            <div className="p-4">Loading...</div>
          ) : expenseData ? (
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                {/* Category */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Input
                    id="category"
                    name="category"
                    value={expenseData.category}
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
                    value={expenseData.amount}
                    onChange={handleInputChange}
                    className="col-span-3"
                  />
                </div>
                {/* Date */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Date
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="date"
                        variant="outline"
                        className={`col-span-3 justify-start text-left font-normal ${
                          !expenseData.date && 'text-muted-foreground'
                        }`}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {expenseData.date ? (
                          format(expenseData.date, 'PPP')
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white">
                      <Calendar
                        mode="single"
                        selected={expenseData.date}
                        onSelect={handleDateChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                {/* Description */}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <textarea
                    id="description"
                    name="description"
                    value={expenseData.description}
                    onChange={handleInputChange}
                    className="col-span-3 border border-gray-300 rounded-md p-2"
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter>
                <div className="flex space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                  <Button
                    variant="destructive"
                    className="text-red-500"
                    onClick={() => setIsConfirmDeleteOpen(true)}
                    type="button"
                  >
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
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" className="text-red-500" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useUserPreferences } from "@/lib/store";
import { Calendar, Edit2, Trash, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

interface RecurringTransaction {
  id: string;
  user_id: string;
  type: "income" | "expense";
  category_id: string;
  amount: number;
  description: string;
  frequency: "daily" | "weekly" | "biweekly" | "monthly" | "quarterly" | "annually";
  start_date: string;
  end_date?: string;
  last_generated?: string;
  created_at: string;
  active: boolean;
}

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense' | 'both';
}

interface RecurringTransactionsProps {
  recurringTransactions: RecurringTransaction[];
  categories: Category[];
  onEdit: (recurring: RecurringTransaction) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

export function RecurringTransactions({
  recurringTransactions,
  categories,
  onEdit,
  onDelete,
  onRefresh
}: RecurringTransactionsProps) {
  const userPrefs = useUserPreferences();
  const [showUpcoming, setShowUpcoming] = useState(false);
  const [upcomingTransactions, setUpcomingTransactions] = useState<{id: string, transactions: {date: string, amount: number, description: string}[]}[]>([]);

  const generateUpcomingTransactions = (recurringList: RecurringTransaction[]) => {
    const upcoming: {id: string, transactions: {date: string, amount: number, description: string}[]}[] = [];

    recurringList.forEach(recurring => {
      if (!recurring.active) return;

      const transactions: {date: string, amount: number, description: string}[] = [];
      const today = new Date();
      let nextDate = new Date(recurring.last_generated || recurring.start_date);

      // Generate next 5 upcoming transactions
      for (let i = 0; i < 5; i++) {
        nextDate = calculateNextRecurringDate(nextDate, recurring.frequency);

        // Skip if end date is defined and we've passed it, or if date is in the past
        if (
          (recurring.end_date && new Date(nextDate) > new Date(recurring.end_date)) ||
          new Date(nextDate) < today
        ) {
          continue;
        }

        transactions.push({
          date: nextDate.toISOString().split('T')[0],
          amount: recurring.amount,
          description: recurring.description
        });
      }

      if (transactions.length > 0) {
        upcoming.push({
          id: recurring.id,
          transactions
        });
      }
    });

    setUpcomingTransactions(upcoming);
  };

  const calculateNextRecurringDate = (date: Date, frequency: string): Date => {
    const newDate = new Date(date);

    switch (frequency) {
      case 'daily':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'weekly':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'biweekly':
        newDate.setDate(newDate.getDate() + 14);
        break;
      case 'monthly':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
      case 'quarterly':
        newDate.setMonth(newDate.getMonth() + 3);
        break;
      case 'annually':
        newDate.setFullYear(newDate.getFullYear() + 1);
        break;
    }

    return newDate;
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this recurring transaction?")) return;

    try {
      onDelete(id);
      toast.success("Recurring transaction deleted");
    } catch (error) {
      console.error("Error deleting recurring transaction:", error);
      toast.error("Failed to delete recurring transaction");
    }
  };

  const toggleUpcomingPreview = () => {
    setShowUpcoming(!showUpcoming);
    if (!showUpcoming && recurringTransactions.length > 0) {
      generateUpcomingTransactions(recurringTransactions);
    }
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Uncategorized';
  };

  const getFrequencyLabel = (frequency: string) => {
    const labels = {
      daily: 'Daily',
      weekly: 'Weekly',
      biweekly: 'Bi-weekly',
      monthly: 'Monthly',
      quarterly: 'Quarterly',
      annually: 'Annually'
    };
    return labels[frequency as keyof typeof labels] || frequency;
  };

  if (recurringTransactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recurring Transactions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No recurring transactions found. Create one to automate your regular income or expenses.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Recurring Transactions ({recurringTransactions.length})
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleUpcomingPreview}
            className="flex items-center gap-2"
          >
            {showUpcoming ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showUpcoming ? 'Hide' : 'Show'} Upcoming
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {recurringTransactions.map((recurring) => (
          <div key={recurring.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Badge variant={recurring.type === 'income' ? 'default' : 'secondary'}>
                  {recurring.type === 'income' ? 'Income' : 'Expense'}
                </Badge>
                <span className="font-medium">{recurring.description}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(recurring)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(recurring.id)}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Amount:</span>
                <div className={`font-medium ${recurring.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(recurring.amount, userPrefs.currency)}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Category:</span>
                <div>{getCategoryName(recurring.category_id)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Frequency:</span>
                <div>{getFrequencyLabel(recurring.frequency)}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Next Due:</span>
                <div>
                  {recurring.last_generated
                    ? formatDate(calculateNextRecurringDate(new Date(recurring.last_generated), recurring.frequency).toISOString().split('T')[0])
                    : formatDate(recurring.start_date)
                  }
                </div>
              </div>
            </div>

            {recurring.end_date && (
              <div className="mt-2 text-sm">
                <span className="text-muted-foreground">Ends:</span>{' '}
                {formatDate(recurring.end_date)}
              </div>
            )}

            {!recurring.active && (
              <Badge variant="outline" className="mt-2">
                Inactive
              </Badge>
            )}

            {showUpcoming && upcomingTransactions.find(u => u.id === recurring.id) && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium mb-2">Upcoming Transactions:</h4>
                <div className="space-y-1">
                  {upcomingTransactions
                    .find(u => u.id === recurring.id)
                    ?.transactions.slice(0, 3)
                    .map((transaction, index) => (
                      <div key={`${recurring.id}-${transaction.date}`} className="flex justify-between text-sm text-muted-foreground">
                        <span>{formatDate(transaction.date)}</span>
                        <span>{formatCurrency(transaction.amount, userPrefs.currency)}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
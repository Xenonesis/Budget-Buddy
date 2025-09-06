import React from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Edit2, Trash, PlusCircle } from 'lucide-react';
import { Currency } from '@/components/ui/currency';
import { formatDate } from '@/lib/utils';

interface Transaction {
  id: string;
  user_id: string;
  type: "income" | "expense";
  category_id: string;
  category_name?: string;
  amount: number;
  description: string;
  date: string;
  created_at: string;
  recurring_id?: string;
}

interface TransactionTableProps {
  transactions: Transaction[];
  loading: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onAddTransaction: () => void;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  onSort: (field: string) => void;
}

const TransactionSkeleton: React.FC = () => (
  <div className="border-b p-3 bg-muted/50">
    <div className="flex justify-between">
      <div className="skeleton-loader h-6 w-20"></div>
      <div className="skeleton-loader h-6 w-20"></div>
      <div className="skeleton-loader h-6 w-20"></div>
      <div className="skeleton-loader h-6 w-20"></div>
      <div className="skeleton-loader h-6 w-20"></div>
    </div>
  </div>
);

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  loading,
  onEdit,
  onDelete,
  onAddTransaction,
  sortField,
  sortDirection,
  onSort,
}) => {
  if (loading) {
    return (
      <div className="overflow-x-auto">
        <div className="border-b p-3 bg-muted/50">
          <div className="flex justify-between">
            <div className="skeleton-loader h-6 w-20"></div>
            <div className="skeleton-loader h-6 w-20"></div>
            <div className="skeleton-loader h-6 w-20"></div>
            <div className="skeleton-loader h-6 w-20"></div>
            <div className="skeleton-loader h-6 w-20"></div>
          </div>
        </div>
        {Array.from({ length: 5 }, (_, index) => (
          <div key={`transaction-skeleton-${index}`} className="border-b p-3 flex justify-between items-center">
            <div className="skeleton-loader h-5 w-24"></div>
            <div className="skeleton-loader h-6 w-32 rounded-full"></div>
            <div className="skeleton-loader h-5 w-40"></div>
            <div className="skeleton-loader h-5 w-20"></div>
            <div className="flex gap-2">
              <div className="skeleton-loader h-8 w-8 rounded-md"></div>
              <div className="skeleton-loader h-8 w-8 rounded-md"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-primary/10 p-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <h3 className="text-lg font-medium">No transactions found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Try a different search term or add your first transaction.
        </p>
        <Button
          onClick={onAddTransaction}
          className="mt-4 min-h-[44px]"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Transaction
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th
              className="px-4 py-3 text-left text-sm font-medium cursor-pointer"
              onClick={() => onSort('date')}
            >
              <div className="flex items-center">
                Date
                {sortField === 'date' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
            <th
              className="px-4 py-3 text-left text-sm font-medium cursor-pointer"
              onClick={() => onSort('category')}
            >
              <div className="flex items-center">
                Category
                {sortField === 'category' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-medium cursor-pointer"
              onClick={() => onSort('description')}
            >
              <div className="flex items-center">
                Description
                {sortField === 'description' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th
              className="px-4 py-3 text-right text-sm font-medium cursor-pointer"
              onClick={() => onSort('amount')}
            >
              <div className="flex items-center justify-end">
                Amount
                {sortField === 'amount' && (
                  <span className="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map(transaction => (
            <tr key={transaction.id} className="border-b hover:bg-muted/50">
              <td className="px-4 py-3 text-sm">{formatDate(transaction.date)}</td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    transaction.type === "income"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                  }`}
                >
                  {transaction.type}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                {transaction.category_name || "Uncategorized"}
              </td>
              <td className="px-4 py-3 text-sm max-w-[250px] truncate">
                {transaction.description}
              </td>
              <td
                className={`px-4 py-3 text-right text-sm font-medium ${
                  transaction.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                }`}
              >
                <Currency value={transaction.amount} />
              </td>
              <td className="px-4 py-3 text-right space-x-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(transaction)}
                        aria-label={`Edit transaction: ${transaction.description}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Edit transaction</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(transaction.id)}
                        aria-label={`Delete transaction: ${transaction.description}`}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete transaction</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
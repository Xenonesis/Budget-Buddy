import React, { useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Edit2, Trash, PlusCircle } from 'lucide-react';
import { Currency } from '@/components/ui/currency';
import { formatDate } from '@/lib/utils';
// Temporarily disable virtualization to fix build
// import { FixedSizeList as VirtualizedList } from 'react-window';
// import AutoSizer from 'react-virtualized-auto-sizer';

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

interface TransactionCardViewProps {
  transactions: Transaction[];
  loading: boolean;
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onAddTransaction: () => void;
}

const TransactionSkeleton: React.FC = () => (
  <div className="p-4 sm:hidden">
    <div className="rounded-lg border bg-card p-4 shadow-sm mb-3">
      <div className="flex items-center justify-between mb-2">
        <div className="skeleton-loader h-4 w-24"></div>
        <div className="skeleton-loader h-6 w-16 rounded-full"></div>
      </div>
      <div className="mb-1">
        <div className="skeleton-loader h-5 w-40 mb-1"></div>
        <div className="skeleton-loader h-4 w-32"></div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <div className="skeleton-loader h-6 w-20"></div>
        <div className="flex space-x-1">
          <div className="skeleton-loader h-8 w-8 rounded-md"></div>
          <div className="skeleton-loader h-8 w-8 rounded-md"></div>
        </div>
      </div>
    </div>
  </div>
);

export const TransactionCardView: React.FC<TransactionCardViewProps> = ({
  transactions,
  loading,
  onEdit,
  onDelete,
  onAddTransaction,
}) => {
  const CardRenderer = useCallback((props: { index: number, style: React.CSSProperties }) => {
    const { index, style } = props;
    const transaction = transactions[index];
    if (!transaction) return null;

    return (
      <div style={style} className="px-4">
        <div className="rounded-lg border bg-card p-4 shadow-sm mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">
              {formatDate(transaction.date)}
            </span>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                transaction.type === "income"
                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
              }`}
            >
              {transaction.type}
            </span>
          </div>

          <div className="mb-1">
            <div className="font-medium">{transaction.description}</div>
            <div className="text-sm text-muted-foreground">
              {transaction.category_name || "Uncategorized"}
            </div>
          </div>

          <div className="flex items-center justify-between mt-2">
            <div
              className={`text-lg font-bold ${
                transaction.type === "income" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              }`}
            >
              <Currency value={transaction.amount} />
            </div>

            <div className="flex space-x-1">
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
            </div>
          </div>
        </div>
      </div>
    );
  }, [transactions, onEdit, onDelete]);

  if (loading) {
    return <TransactionSkeleton />;
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
    <div style={{ height: '75vh', width: '100%' }} className="overflow-y-auto">
      {/* Temporarily disabled virtualization */}
      <div className="space-y-2 p-4">
        {transactions.map((transaction, index) => (
          <CardRenderer
            key={transaction.id}
            index={index}
            style={{}}
          />
        ))}
      </div>
    </div>
  );
};
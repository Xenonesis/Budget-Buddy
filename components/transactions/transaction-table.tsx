import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  Edit2, 
  Trash, 
  PlusCircle,
  TrendingUp,
  TrendingDown,
  ArrowUpDown,
  Calendar,
  DollarSign,
  FileText,
  Sparkles
} from 'lucide-react';
import { Currency } from '@/components/ui/currency';
import { formatDate } from '@/lib/utils';
import styles from '../../app/dashboard/transactions/transactions.module.css';

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
  <div className="animate-pulse">
    {Array.from({ length: 6 }, (_, index) => (
      <div key={`skeleton-${index}`} className="border-b border-border/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            <div className="h-4 bg-gradient-to-r from-muted/60 via-muted to-muted/60 rounded-lg w-20 shine-effect" />
            <div className="h-6 bg-gradient-to-r from-muted/60 via-muted to-muted/60 rounded-full w-16 shine-effect" />
            <div className="h-4 bg-gradient-to-r from-muted/60 via-muted to-muted/60 rounded-lg w-24 shine-effect" />
            <div className="h-4 bg-gradient-to-r from-muted/60 via-muted to-muted/60 rounded-lg w-32 shine-effect" />
          </div>
          <div className="flex items-center space-x-3">
            <div className="h-4 bg-gradient-to-r from-muted/60 via-muted to-muted/60 rounded-lg w-20 shine-effect" />
            <div className="flex space-x-2">
              <div className="h-8 w-8 bg-gradient-to-r from-muted/60 via-muted to-muted/60 rounded-lg shine-effect" />
              <div className="h-8 w-8 bg-gradient-to-r from-muted/60 via-muted to-muted/60 rounded-lg shine-effect" />
            </div>
          </div>
        </div>
      </div>
    ))}
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
  const getSortIcon = (field: string) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-muted-foreground/50" />;
    return sortDirection === 'asc' ? (
      <TrendingUp className="w-3 h-3 text-primary" />
    ) : (
      <TrendingDown className="w-3 h-3 text-primary" />
    );
  };

  if (loading) {
    return (
      <div className={styles.tableContainer}>
        <div className="bg-gradient-to-r from-muted/30 to-muted/10 p-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="w-5 h-5 text-primary animate-pulse" />
            </div>
            <h3 className="font-semibold text-foreground">Loading your transactions...</h3>
          </div>
        </div>
        <TransactionSkeleton />
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-gradient-to-br from-card via-card/95 to-muted/20 rounded-2xl border border-border/50 shadow-lg backdrop-blur-sm overflow-hidden">
        <div className="bg-gradient-to-r from-muted/30 to-muted/10 p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Transaction History</h3>
              <p className="text-sm text-muted-foreground">Your financial activity will appear here</p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="mb-6 p-6 bg-gradient-to-br from-primary/5 to-primary/10 rounded-full">
            <div className="p-4 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full">
              <DollarSign className="w-12 h-12 text-primary" />
            </div>
          </div>
          
          <h3 className="text-2xl font-bold text-foreground mb-3">No transactions yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md leading-relaxed">
            Start tracking your finances by adding your first transaction. 
            Whether it&apos;s income or an expense, every journey begins with a single step! 💰
          </p>
          
          <Button
            onClick={onAddTransaction}
            size="lg"
            className="min-h-[48px] px-8 rounded-xl font-semibold bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <PlusCircle className="mr-3 h-5 w-5" />
            Add Your First Transaction
          </Button>
          
          <div className="mt-8 grid grid-cols-3 gap-4 text-center max-w-md">
            <div className="p-3 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-xl border border-green-200/50">
              <TrendingUp className="w-6 h-6 text-green-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-green-700 dark:text-green-300">Track Income</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 rounded-xl border border-red-200/50">
              <TrendingDown className="w-6 h-6 text-red-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-red-700 dark:text-red-300">Monitor Expenses</p>
            </div>
            <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-xl border border-blue-200/50">
              <Calendar className="w-6 h-6 text-blue-600 mx-auto mb-2" />
              <p className="text-xs font-medium text-blue-700 dark:text-blue-300">View Insights</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.tableContainer}>
      <table className={styles.transactionsTable}>
        <thead>
          <tr>
            <th 
              className={styles.sortableHeader} 
              onClick={() => onSort('date')}
              role="columnheader"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSort('date')}
            >
              <div className="flex items-center gap-2 font-semibold">
                <Calendar className="w-4 h-4 text-primary" />
                Date
                {getSortIcon('date')}
              </div>
            </th>
            
            <th className="px-4 py-3 text-left font-semibold text-sm uppercase tracking-wide">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-500 to-red-500" />
                Type
              </div>
            </th>
            
            <th 
              className={styles.sortableHeader}
              onClick={() => onSort('category_name')}
              role="columnheader"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSort('category_name')}
            >
              <div className="flex items-center gap-2 font-semibold">
                Category
                {getSortIcon('category_name')}
              </div>
            </th>
            
            <th 
              className={styles.sortableHeader}
              onClick={() => onSort('description')}
              role="columnheader"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSort('description')}
            >
              <div className="flex items-center gap-2 font-semibold">
                Description
                {getSortIcon('description')}
              </div>
            </th>
            
            <th 
              className={styles.sortableHeader}
              onClick={() => onSort('amount')}
              role="columnheader"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onSort('amount')}
            >
              <div className="flex items-center justify-end gap-2 font-semibold">
                <DollarSign className="w-4 h-4 text-primary" />
                Amount
                {getSortIcon('amount')}
              </div>
            </th>
            
            <th className="px-4 py-3 text-right font-semibold text-sm uppercase tracking-wide">
              Actions
            </th>
          </tr>
        </thead>
        
        <tbody>
          {transactions.map((transaction, index) => (
            <tr 
              key={transaction.id} 
              className={`${styles.transactionRow} group relative`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <td className={styles.dateColumn}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-8 bg-gradient-to-b from-primary/60 to-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  <span className="font-medium">{formatDate(transaction.date)}</span>
                </div>
              </td>
              
              <td className={styles.typeColumn}>
                <Badge 
                  variant="secondary" 
                  className={`${styles.typeTag} ${
                    transaction.type === "income" ? styles.incomeTag : styles.expenseTag
                  } transition-all duration-200 group-hover:scale-105`}
                >
                  {transaction.type === "income" ? (
                    <>
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Income
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-3 h-3 mr-1" />
                      Expense
                    </>
                  )}
                </Badge>
              </td>
              
              <td className={styles.categoryColumn}>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-primary/60" />
                  <span className="truncate">{transaction.category_name || "Uncategorized"}</span>
                </div>
              </td>
              
              <td className={styles.descriptionColumn}>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="truncate block max-w-[200px] lg:max-w-[300px] cursor-help">
                        {transaction.description}
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="start">
                      <p className="max-w-xs">{transaction.description}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </td>
              
              <td className={`${styles.amountColumn} ${
                transaction.type === "income" ? styles.incomeText : styles.expenseText
              }`}>
                <div className="flex items-center justify-end gap-2">
                  <div className={`w-1 h-6 rounded-full ${
                    transaction.type === "income" ? 'bg-green-500' : 'bg-red-500'
                  } opacity-0 group-hover:opacity-100 transition-opacity duration-200`} />
                  <span className="font-bold">
                    <Currency value={transaction.amount} />
                  </span>
                </div>
              </td>
              
              <td className={styles.actionsColumn}>
                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEdit(transaction)}
                          className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-700 dark:hover:bg-blue-900/30 dark:hover:text-blue-300 transition-all duration-200 rounded-lg"
                          aria-label={`Edit transaction: ${transaction.description}`}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>✏️ Edit transaction</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onDelete(transaction.id)}
                          className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/30 dark:hover:text-red-300 transition-all duration-200 rounded-lg"
                          aria-label={`Delete transaction: ${transaction.description}`}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>🗑️ Delete transaction</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                
                {/* Always visible actions for mobile */}
                <div className="flex items-center justify-end gap-1 sm:hidden">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(transaction)}
                    className="h-8 w-8 p-0 text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900/30"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(transaction.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:bg-red-100 dark:text-red-400 dark:hover:bg-red-900/30"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
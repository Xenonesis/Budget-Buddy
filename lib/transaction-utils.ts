import { formatCurrency } from '@/lib/utils';

export interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category_name?: string;
  description: string;
  amount: number;
}

export interface DateRange {
  start: string;
  end: string;
}

export interface TransactionFilters {
  type: string;
  searchTerm: string;
  dateRange: DateRange;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
}

/**
 * Filter transactions based on type, search term, and date range
 */
export const filterTransactions = (
  transactions: Transaction[],
  filters: TransactionFilters
): Transaction[] => {
  return transactions
    .filter(transaction => filterByType(transaction, filters.type))
    .filter(transaction => filterBySearchTerm(transaction, filters.searchTerm))
    .filter(transaction => filterByDateRange(transaction, filters.dateRange));
};

/**
 * Filter transaction by type
 */
const filterByType = (transaction: Transaction, type: string): boolean => {
  return type === 'all' || transaction.type === type;
};

/**
 * Filter transaction by search term
 */
const filterBySearchTerm = (transaction: Transaction, searchTerm: string): boolean => {
  if (!searchTerm) return true;

  const searchLower = searchTerm.toLowerCase();
  const matchesDescription = transaction.description.toLowerCase().includes(searchLower);
  const matchesCategory = transaction.category_name?.toLowerCase().includes(searchLower) ?? false;

  return matchesDescription || matchesCategory;
};

/**
 * Filter transaction by date range
 */
const filterByDateRange = (transaction: Transaction, dateRange: DateRange): boolean => {
  if (!dateRange.start && !dateRange.end) return true;

  const transactionDate = new Date(transaction.date);

  if (dateRange.start) {
    const startDate = new Date(dateRange.start);
    if (transactionDate < startDate) return false;
  }

  if (dateRange.end) {
    const endDate = new Date(dateRange.end);
    if (transactionDate > endDate) return false;
  }

  return true;
};

/**
 * Sort transactions by field and direction
 */
export const sortTransactions = (
  transactions: Transaction[],
  sortField: string,
  sortDirection: 'asc' | 'desc'
): Transaction[] => {
  return [...transactions].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case 'date':
        aValue = new Date(a.date);
        bValue = new Date(b.date);
        break;
      case 'category':
        aValue = a.category_name || '';
        bValue = b.category_name || '';
        break;
      case 'description':
        aValue = a.description;
        bValue = b.description;
        break;
      case 'amount':
        aValue = a.amount;
        bValue = b.amount;
        break;
      default:
        return 0;
    }

    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

/**
 * Paginate transactions
 */
export const paginateTransactions = (
  transactions: Transaction[],
  currentPage: number,
  itemsPerPage: number
): Transaction[] => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  return transactions.slice(startIndex, startIndex + itemsPerPage);
};

/**
 * Calculate transaction summary
 */
export const calculateTransactionSummary = (transactions: Transaction[]): TransactionSummary => {
  const summary = transactions.reduce(
    (acc, transaction) => {
      if (transaction.type === 'income') {
        acc.totalIncome += transaction.amount;
      } else {
        acc.totalExpense += transaction.amount;
      }
      return acc;
    },
    { totalIncome: 0, totalExpense: 0 }
  );

  return {
    ...summary,
    balance: summary.totalIncome - summary.totalExpense,
  };
};

/**
 * Format currency for display
 */
export const formatTransactionAmount = (amount: number, type: 'income' | 'expense'): string => {
  return formatCurrency(amount);
};

/**
 * Get paginated transactions with filtering and sorting applied
 */
export const getProcessedTransactions = (
  transactions: Transaction[],
  filters: TransactionFilters,
  sortField: string,
  sortDirection: 'asc' | 'desc',
  currentPage: number,
  itemsPerPage: number
) => {
  const filtered = filterTransactions(transactions, filters);
  const sorted = sortTransactions(filtered, sortField, sortDirection);
  const paginated = paginateTransactions(sorted, currentPage, itemsPerPage);

  return {
    transactions: paginated,
    totalItems: filtered.length,
    totalPages: Math.ceil(filtered.length / itemsPerPage),
  };
};
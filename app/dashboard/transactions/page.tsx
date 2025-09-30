"use client";

import { useState, useEffect, useRef, useCallback, useMemo, useLayoutEffect, memo } from "react";
import { supabase } from "@/lib/supabase";
import { formatCurrency, formatDate, formatDateWithTimezone, calculateNextRecurringDate, getUserTimezone } from "@/lib/utils";
import { Currency } from "@/components/ui/currency";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { Button } from "@/components/ui/button";
import { 
  PlusCircle, 
  Calendar, 
  Edit2, 
  Trash, 
  Download,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  ArrowUpCircle,
  ArrowDownCircle,
  ChevronDown,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Eye,
  EyeOff,
  Info,
  Target,
  Lightbulb,
  PiggyBank,
  Maximize2,
  X
} from "lucide-react";
import { toast } from "sonner";
import { AddTransactionButton } from "@/components/ui/bottom-navigation";
import dynamic from 'next/dynamic';

// Comment out the regular import and use dynamic import instead
// import AutoSizer from 'react-virtualized-auto-sizer';
const AutoSizer = dynamic(
  () => import('react-virtualized-auto-sizer').then(mod => mod.default),
  { ssr: false }
);
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import styles from './transactions.module.css';
import { 
  validateAmount, 
  validateDate, 
  validateDescription, 
  validateCategory, 
  validateTransactionType, 
  validateForm 
} from "@/lib/validation";
import AddTransactionForm from "./add-transaction-form";  // Import the new component

// Import extracted components
import { TransactionSummaryCards } from "@/components/transactions/summary-cards";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { TransactionCardView } from "@/components/transactions/transaction-card-view";
import { TransactionPagination } from "@/components/transactions/transaction-pagination";
import { RecurringTransactions } from "@/components/transactions/recurring-transactions";
import { CustomCategoryForm } from "@/components/transactions/custom-category-form";
import { YearOverYearComparison } from "@/components/dashboard/charts/year-over-year-comparison";
import { IncomeExpenseChart } from "@/components/dashboard/charts/income-expense-chart";

import { 
  calculateTransactionSummary
} from "@/lib/transaction-utils";
import type { TransactionSummary as TransactionSummaryType } from "@/lib/transaction-utils";

import { 
  exportToCSV,
  exportToExcel,
  exportToPDF,
  scheduleExport,
  calculateNextExportDate
} from "@/lib/export-utils";

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

interface ApiResponse<T> {
  data: T | null;
  error: {
    message: string;
    code?: string;
    details?: string;
  } | null;
}

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
  icon?: string;
  user_id?: string;
  type: 'income' | 'expense' | 'both';
}

interface FormData {
  type: "income" | "expense";
  category_id: string;
  amount: string;
  description: string;
  date: string;
  is_recurring: boolean;
  recurring_frequency: "daily" | "weekly" | "biweekly" | "monthly" | "quarterly" | "annually";
  recurring_end_date: string;
}

// 1. Implement event delegation for transaction list items
const TransactionRow = memo(({ transaction, onEdit, onDelete }: { 
  transaction: Transaction, 
  onEdit: (t: Transaction) => void, 
  onDelete: (id: string) => void 
}) => {
  const userPrefs = useUserPreferences();
  
  return (
    <tr className={styles.transactionRow} data-id={transaction.id}>
      <td className={styles.dateColumn}>
        {formatDateWithTimezone(transaction.date, userPrefs.timezone)}
      </td>
      <td className={styles.typeColumn}>
        {transaction.type === "income" ? (
          <ArrowUpCircle className="w-4 h-4 text-green-500 mr-1" />
        ) : (
          <ArrowDownCircle className="w-4 h-4 text-red-500 mr-1" />
        )}
        {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
      </td>
      <td className={styles.categoryColumn}>
        {transaction.category_name || "Uncategorized"}
      </td>
      <td className={styles.descriptionColumn}>{transaction.description}</td>
      <td className={`${styles.amountColumn} ${transaction.type === "income" ? "text-green-600" : "text-red-600"}`}>
        <Currency
          value={transaction.amount}
          currency={userPrefs.currency}
        />
      </td>
      <td className={styles.actionsColumn}>
        <div className="flex space-x-2">
          <button className="text-blue-500 hover:text-blue-700" aria-label="Edit">
            <Edit2 className="w-4 h-4" />
          </button>
          <button className="text-red-500 hover:text-red-700" aria-label="Delete">
            <Trash className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
});
TransactionRow.displayName = 'TransactionRow';

// 2. Replace the transactions table with a memoized component
const TransactionsTable = memo(({ 
  transactions, 
  onEdit, 
  onDelete, 
  onSort, 
  sortField, 
  sortDirection 
}: { 
  transactions: Transaction[], 
  onEdit: (t: Transaction) => void, 
  onDelete: (id: string) => void,
  onSort: (field: string) => void,
  sortField: string,
  sortDirection: "asc" | "desc"
}) => {
  return (
    <div className={styles.tableContainer}>
      <table className={styles.transactionsTable}>
        <thead>
          <tr>
            <th onClick={() => onSort("date")} className={styles.sortableHeader}>
              Date {sortField === "date" && (sortDirection === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => onSort("type")} className={styles.sortableHeader}>
              Type {sortField === "type" && (sortDirection === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => onSort("category_name")} className={styles.sortableHeader}>
              Category {sortField === "category_name" && (sortDirection === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => onSort("description")} className={styles.sortableHeader}>
              Description {sortField === "description" && (sortDirection === "asc" ? "↑" : "↓")}
            </th>
            <th onClick={() => onSort("amount")} className={styles.sortableHeader}>
              Amount {sortField === "amount" && (sortDirection === "asc" ? "↑" : "↓")}
            </th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody id="transactions-tbody">
          {transactions.map((transaction) => (
            <TransactionRow 
              key={transaction.id} 
              transaction={transaction} 
              onEdit={onEdit} 
              onDelete={onDelete} 
            />
          ))}
        </tbody>
      </table>
    </div>
  );
});
TransactionsTable.displayName = 'TransactionsTable';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const { currency, setCurrency, setUsername, ...userPreferences } = useUserPreferences();
  const [showRecurring, setShowRecurring] = useState(false);
  const [recurringTransactions, setRecurringTransactions] = useState<RecurringTransaction[]>([]);
  const [editingRecurring, setEditingRecurring] = useState<RecurringTransaction | null>(null);
  const [upcomingRecurringTransactions, setUpcomingRecurringTransactions] = useState<{id: string, transactions: {date: string, amount: number, description: string}[]}[]>([]);
  const [showUpcomingPreview, setShowUpcomingPreview] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    type: "expense",
    category_id: "",
    amount: "",
    description: "",
    date: new Date().toLocaleDateString('en-CA', { 
      timeZone: userPreferences.timezone || getUserTimezone() 
    }),
    is_recurring: false,
    recurring_frequency: "monthly",
    recurring_end_date: ""
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dateRange, setDateRange] = useState<{
    start: string;
    end: string;
  }>({
    start: "",
    end: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [summary, setSummary] = useState<TransactionSummaryType>({
    totalIncome: 0,
    totalExpense: 0,
    balance: 0
  });
  const [sortField, setSortField] = useState<string>("date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [showFilters, setShowFilters] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const pullStartY = useRef(0);
  const pullMoveY = useRef(0);
  const refreshDistance = 80; // Minimum distance to pull to trigger refresh
  const contentRef = useRef<HTMLDivElement>(null);
  const [descriptionSuggestions, setDescriptionSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [frequentCategories, setFrequentCategories] = useState<Category[]>([]);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [exportColumns, setExportColumns] = useState({
    date: true,
    type: true,
    category: true,
    description: true,
    amount: true
  });
  const [scheduleExportFrequency, setScheduleExportFrequency] = useState<"none" | "weekly" | "monthly">("none");
  const [scheduleExportDay, setScheduleExportDay] = useState<number>(1);
  const [scheduleExportFormat, setScheduleExportFormat] = useState<"csv" | "excel" | "pdf">("csv");
  const [showDeleteCategoryConfirm, setShowDeleteCategoryConfirm] = useState(false);
  
  // States for charts
  const [showCharts, setShowCharts] = useState(false);
  const [showFullscreenChart, setShowFullscreenChart] = useState(false);
  const [monthlyData, setMonthlyData] = useState<{ name: string; income: number; expense: number; transactionCount?: number }[]>([]);

  // Add this useEffect to handle unwanted dropdowns globally
  useEffect(() => {
    // Function to remove unwanted dropdowns
    const removeUnwantedDropdowns = () => {
      // Target specifically the extra dropdown that shows up
      const unwantedDropdowns = document.querySelectorAll('.flex-1.rounded-md.border.border-input.bg-transparent.px-3.py-2.text-sm.high-contrast-dropdown');
      
      if (unwantedDropdowns.length > 0) {
        console.log("Found unwanted dropdowns:", unwantedDropdowns.length);
        unwantedDropdowns.forEach(dropdown => {
          // Check if it's in the custom category form area
          const parent = dropdown.closest('.custom-category-form');
          if (parent) {
            console.log("Removing unwanted dropdown");
            (dropdown as HTMLElement).style.display = 'none';
          }
        });
      }
    };

    // Run immediately
    removeUnwantedDropdowns();
    
    // Also set up a MutationObserver to catch dynamically added elements
    const observer = new MutationObserver(() => {
      removeUnwantedDropdowns();
    });
    
    observer.observe(document.body, { 
      childList: true, 
      subtree: true 
    });
    
    return () => observer.disconnect();
  }, []);

  // Add a new useEffect at the beginning of the component that handles all potential issues
  useEffect(() => {
    const removeDuplicateDropdowns = () => {
      // Find all dropdowns within custom category form areas
      const customForms = document.querySelectorAll(`.${styles.customCategoryForm}`);
      customForms.forEach(form => {
        // Find all select elements inside each form
        const selects = form.querySelectorAll('select');
        // If there's more than one select, or if it has the specific class
        if (selects.length > 0) {
          selects.forEach(select => {
            // Check if it's the unwanted select
            if (select.classList.contains('flex-1')) {
              select.remove();
            }
          });
        }
      });
    };

    // Setup MutationObserver to handle dynamic changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList' && mutation.addedNodes.length) {
          // Check if any added nodes contain selects
          mutation.addedNodes.forEach(node => {
            if (node.nodeType === 1) { // Element node
              const element = node as Element;
              const selects = element.querySelectorAll('select.flex-1');
              if (selects.length && element.closest(`.${styles.customCategoryForm}`)) {
                removeDuplicateDropdowns();
              }
            }
          });
        }
      });
    });
    
    // Observe the whole document for DOM changes
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    
    // Initial cleanup
    setTimeout(removeDuplicateDropdowns, 100);
    
    // Cleanup on unmount
    return () => {
      observer.disconnect();
    };
  }, []);

  const handleExportToCSV = () => {
    exportToCSV(transactions, exportColumns);
  };

  const handleExportToExcel = () => {
    exportToExcel(transactions, exportColumns);
  };

  const handleExportToPDF = () => {
    exportToPDF(transactions, exportColumns, summary, dateRange);
  };

  const handleScheduleExport = () => {
    if (scheduleExportFrequency !== 'none') {
      scheduleExport(scheduleExportFrequency, scheduleExportDay, scheduleExportFormat, exportColumns);
    }
    setShowExportOptions(false);
  };

  const calculateNextExportDate = (frequency: 'weekly' | 'monthly', day: number): Date => {
    return calculateNextExportDate(frequency, day);
  };

  const toggleExportOptions = () => {
    setShowExportOptions(!showExportOptions);
  };

  const handleExportColumnChange = (column: keyof typeof exportColumns) => {
    setExportColumns({
      ...exportColumns,
      [column]: !exportColumns[column]
    });
  };

  async function fetchTransactions() {
    try {
      setLoading(true);
      
      // Get user first
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      // Load user preferences
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      // If profile exists, update our preferences
      if (profileData) {
        if (profileData.currency) {
          setCurrency(profileData.currency);
        }
        
        if (profileData.username) {
          setUsername(profileData.username);
        }
      }
      
      // Log the fetch attempt
      console.log("Fetching transactions for user:", user.id);
      
      // Fetch initial transactions with pagination
      // Make sure we're not filtering by type unless explicitly requested
      let query = supabase
        .from('transactions')
        .select('*, categories(*)')
        .eq('user_id', user.id);
      
      // Only filter by type if a specific filter is set
      if (filterType !== 'all') {
        query = query.eq('type', filterType);
        console.log("Filtering transactions by type:", filterType);
      } else {
        console.log("Fetching all transaction types");
      }
      
      const { data, error }: ApiResponse<(Transaction & { categories: Category | null })[]> = await query
        .order('date', { ascending: false })
        .limit(itemsPerPage);

      if (error) {
        console.error("Error fetching transactions:", error);
        throw error;
      }
      
      if (!data) {
        console.log("No transaction data received");
        throw new Error("No data received");
      }

      console.log(`Fetched ${data.length} transactions:`, data.map(t => ({ id: t.id, type: t.type, amount: t.amount })));

      const transactions = data.map(transaction => ({
        ...transaction,
        category_name: transaction.categories?.name || 'Uncategorized'
      }));

      setTransactions(transactions);
      setHasMore(data.length === itemsPerPage);
      calculateSummary(transactions);
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }

  const calculateSummary = (transactionsData: Transaction[]) => {
    const newSummary = calculateTransactionSummary(transactionsData);
    setSummary(newSummary);
    
    // Calculate monthly data for charts
    const monthlyDataMap = new Map<string, { income: number; expense: number; transactionCount: number }>();
    
    transactionsData.forEach(transaction => {
      const monthKey = new Date(transaction.date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (!monthlyDataMap.has(monthKey)) {
        monthlyDataMap.set(monthKey, { income: 0, expense: 0, transactionCount: 0 });
      }
      
      const monthData = monthlyDataMap.get(monthKey)!;
      if (transaction.type === 'income') {
        monthData.income += transaction.amount;
      } else {
        monthData.expense += transaction.amount;
      }
      monthData.transactionCount++;
    });
    
    const chartMonthlyData = Array.from(monthlyDataMap.entries())
      .map(([name, data]) => ({
        name,
        income: data.income,
        expense: data.expense,
        transactionCount: data.transactionCount
      }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime());
    
    setMonthlyData(chartMonthlyData);
  };

  const fetchCategories = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        console.error("No authenticated user found when fetching categories");
        return;
      }

      console.log("Fetching categories for user:", userData.user.id);
      
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .or(`user_id.is.null,user_id.eq.${userData.user.id}`)
        .eq('is_active', true)
        .order("name");

      if (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
        return;
      }
      
      console.log("Fetched categories:", data?.length, "items");
      
      // Debug the categories to ensure they have proper types
      if (data && data.length > 0) {
        console.log("Sample categories:", data.slice(0, 3));
        console.log("Income categories:", data.filter(c => c.type === 'income').length);
        console.log("Expense categories:", data.filter(c => c.type === 'expense').length);
        console.log("Both type categories:", data.filter(c => c.type === 'both').length);
        
        // Check for categories without proper type and fix them
        const categoriesWithoutType = data.filter(c => !c.type || !['income', 'expense', 'both'].includes(c.type));
        if (categoriesWithoutType.length > 0) {
          console.warn("Found categories without proper type:", categoriesWithoutType);
          // Fix them by guessing based on name or defaulting to 'expense'
          for (const category of categoriesWithoutType) {
            const nameInLowerCase = category.name.toLowerCase();
            let assumedType = 'expense';
            
            // Guess type based on common income category names
            if (['salary', 'income', 'freelance', 'investment', 'gift', 'refund'].some(term => 
               nameInLowerCase.includes(term))) {
              assumedType = 'income';
            }
            
            console.log(`Fixing category "${category.name}" by setting type to "${assumedType}"`);
            
            // Update the category type
            await supabase
              .from("categories")
              .update({ type: assumedType })
              .eq("id", category.id);
              
            // Update in local data
            category.type = assumedType;
          }
        }
      }
      
      if (!data || data.length === 0) {
        console.log("No categories found, creating defaults");
        await createDefaultCategories(userData.user.id);
        // Fetch again after creating defaults, but only once
        const { data: newData, error: newError } = await supabase
          .from("categories")
          .select("*")
          .or(`user_id.is.null,user_id.eq.${userData.user.id}`)
          .eq('is_active', true)
          .order("name");
        
        if (!newError && newData) {
          setCategories(newData);
        }
        return;
      }
      
      setCategories(data || []);

      // Also update frequent categories based on transaction history
      loadFrequentCategories();
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    }
  };

  const createDefaultCategories = async (userId: string) => {
    try {
      console.log("Creating default categories for user:", userId);
      
      // First, check what categories already exist for this user
      const { data: existingCategories, error: fetchError } = await supabase
        .from("categories")
        .select("name")
        .or(`user_id.is.null,user_id.eq.${userId}`)
        .eq('is_active', true);

      if (fetchError) {
        console.error("Error fetching existing categories:", fetchError);
        return;
      }

      const existingCategoryNames = new Set(existingCategories?.map(cat => cat.name) || []);
      console.log("Existing categories:", Array.from(existingCategoryNames));
      
      // Expanded list of categories
      const defaultCategories = [
        // Expense categories
        { name: "Groceries", type: "expense", is_active: true, user_id: userId },
        { name: "Dining Out", type: "expense", is_active: true, user_id: userId },
        { name: "Transportation", type: "expense", is_active: true, user_id: userId },
        { name: "Utilities", type: "expense", is_active: true, user_id: userId },
        { name: "Housing", type: "expense", is_active: true, user_id: userId },
        { name: "Entertainment", type: "expense", is_active: true, user_id: userId },
        { name: "Healthcare", type: "expense", is_active: true, user_id: userId },
        { name: "Shopping", type: "expense", is_active: true, user_id: userId },
        { name: "Education", type: "expense", is_active: true, user_id: userId },
        { name: "Other Expense", type: "expense", is_active: true, user_id: userId },
        
        // Income categories
        { name: "Salary", type: "income", is_active: true, user_id: userId },
        { name: "Freelance", type: "income", is_active: true, user_id: userId },
        { name: "Investments", type: "income", is_active: true, user_id: userId },
        { name: "Gifts", type: "income", is_active: true, user_id: userId },
        { name: "Refunds", type: "income", is_active: true, user_id: userId },
        { name: "Other Income", type: "income", is_active: true, user_id: userId },
      ];

      // Filter out categories that already exist
      const categoriesToCreate = defaultCategories.filter(category => 
        !existingCategoryNames.has(category.name)
      );

      console.log("Categories to create:", categoriesToCreate.map(c => c.name));
      
      if (categoriesToCreate.length === 0) {
        console.log("All default categories already exist");
        return;
      }

      // Insert only the categories that don't exist
      const { data, error } = await supabase
        .from("categories")
        .insert(categoriesToCreate)
        .select();

      if (error) {
        console.error("Error creating default categories:", error);
        // If batch insert fails, try one by one as fallback
        console.log("Trying individual category creation as fallback...");
        for (const category of categoriesToCreate) {
          const { error: individualError } = await supabase
            .from("categories")
            .insert([category]);
          if (individualError) {
            console.error(`Error creating category ${category.name}:`, individualError);
          } else {
            console.log(`Category ${category.name} created successfully`);
          }
        }
      } else {
        console.log(`Successfully created ${data?.length || 0} default categories`);
      }
    } catch (error) {
      console.error("Error creating default categories:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
    loadFrequentCategories();
    loadDraftTransaction();
  }, []);

  // Keyboard support for fullscreen modal
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showFullscreenChart) {
        setShowFullscreenChart(false);
      }
    };

    if (showFullscreenChart) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [showFullscreenChart]);

  // Debug categories
  useEffect(() => {
    console.log("All categories:", categories);
    console.log("Filtered categories for type:", formData.type, categories.filter(category => 
      category.type === formData.type || category.type === 'both'));
  }, [categories, formData.type]);

  const resetForm = () => {
    // Get default category based on transaction type
    const defaultCategory = categories
      .filter(cat => cat.type === 'expense' || cat.type === 'both')
      .sort((a, b) => a.name.localeCompare(b.name))
      [0]?.id || "";

    setFormData({
      type: "expense",
      category_id: defaultCategory, // Use the default category id instead of empty string
      amount: "",
      description: "",
      date: new Date().toLocaleDateString('en-CA', { 
        timeZone: userPreferences.timezone || getUserTimezone() 
      }),
      is_recurring: false,
      recurring_frequency: "monthly",
      recurring_end_date: ""
    });
    setIsEditing(false);
    setEditId(null);
  };

  // Generate suggestions based on previous transactions
  const generateSuggestions = (input: string) => {
    if (!input || input.length < 2) {
      setDescriptionSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    
    // Filter transactions to find similar descriptions
    const inputLower = input.toLowerCase();
    
    // Get unique descriptions from previous transactions that match the input
    const matchingDescriptions = transactions
      .filter(t => t.description && t.description.toLowerCase().includes(inputLower))
      .map(t => t.description)
      .filter((desc, index, self) => self.indexOf(desc) === index)
      .slice(0, 5); // Limit to 5 suggestions
    
    setDescriptionSuggestions(matchingDescriptions);
    setShowSuggestions(matchingDescriptions.length > 0);
  };
  
  // Modify the handleInputChange function to generate suggestions for description field
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Special handling for category selection
    if (name === "category_id" && value === "custom") {
      console.log("Custom category selected, showing custom category form");
      
      // Schedule a cleanup after the form renders
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Use document.querySelector to find any unwanted select elements
          document.querySelectorAll('select.flex-1.high-contrast-dropdown, select.categoryTypeDropdown').forEach(el => {
            const parent = el.parentElement;
            if (parent && parent.querySelector('input[type="hidden"][name="categoryType"]')) {
              console.log('Found and removing unwanted dropdown');
              el.remove();
            }
          });
        });
      });
    } else if (name === "category_id" && value !== "custom") {
      // Clear custom category form if not selecting custom
    }

    // Special handling for transaction type changes
    if (name === "type") {
      console.log(`Transaction type changed to: ${value}, updating newCategory type`);
      
      // Reset category selection when transaction type changes to ensure compatibility
      const defaultCategory = categories
        .filter(cat => cat.type === value || cat.type === 'both')
        .sort((a, b) => a.name.localeCompare(b.name))
        [0]?.id || "";
        
      // Update form data with new default category based on type
      setFormData(prev => ({
        ...prev,
        [name]: value as 'income' | 'expense',
        category_id: defaultCategory
      }));
      
      // We already set the form data above, so return early
      return;
    }

    // Generate suggestions for description field
    if (name === "description") {
      generateSuggestions(value);
    }

    const updatedFormData = {
      ...formData,
      [name]: value,
    };
    
    setFormData(updatedFormData);

    // Auto-save transaction draft
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    
    autoSaveTimeoutRef.current = setTimeout(() => {
      localStorage.setItem('transactionDraft', JSON.stringify(updatedFormData));
      console.log('Transaction draft auto-saved');
      setHasSavedDraft(true);
      
      // Clear the saved status after 2 seconds
      setTimeout(() => {
        setHasSavedDraft(false);
      }, 2000);
    }, 1000);
  };
  
  // Function to select a suggestion
  const selectSuggestion = (suggestion: string) => {
    setFormData(prev => ({ ...prev, description: suggestion }));
    setShowSuggestions(false);
  };

  const openTransactionForm = (isEdit = false, transaction: Transaction | null = null) => {
    if (isEdit && transaction) {
      setFormData({
        type: transaction.type,
        category_id: transaction.category_id,
        amount: transaction.amount.toString(),
        description: transaction.description,
        date: transaction.date,
        is_recurring: !!transaction.recurring_id,
        recurring_frequency: transaction.recurring_id ? "monthly" : "monthly",
        recurring_end_date: transaction.recurring_id ? "" : ""
      });
      setIsEditing(true);
      setEditId(transaction.id);
    } else {
      resetForm();
      setIsEditing(false);
      setEditId(null);
    }
    
    setShowForm(true);
    
    // Add a class to enable modal styling while preserving scrolling
    document.documentElement.classList.add("form-drawer-open");
  };
  
  const closeTransactionForm = () => {
    setShowForm(false);
    document.documentElement.classList.remove("form-drawer-open");
    resetForm();
    setIsEditing(false);
    setEditId(null);
    setEditingRecurring(null);
  };
  
  const handleEdit = (transaction: Transaction) => {
    openTransactionForm(true, transaction);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        toast.error("You must be logged in to add transactions");
        setFormLoading(false);
        return;
      }

      // Perform comprehensive form validation
      const validations = [
        validateTransactionType(formData.type),
        validateCategory(formData.category_id),
        validateAmount(formData.amount),
        validateDate(formData.date),
        validateDescription(formData.description, false, 500)
      ];

      const validationResult = validateForm(validations);
      if (!validationResult.isValid) {
        toast.error(validationResult.message || "Please correct the errors in the form.");
        setFormLoading(false);
        return;
      }

      // If it's still "custom", that means they didn't click the "Add Category" button
      if (formData.category_id === "custom") {
        toast.error("Please create the custom category before saving the transaction.");
        setFormLoading(false);
        return;
      }

      // Additional check to ensure category_id is a valid UUID
      if (formData.category_id && !formData.category_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        console.error("Invalid category_id format:", formData.category_id);
        toast.error("Invalid category selection. Please choose or create a valid category.");
        setFormLoading(false);
        return;
      }

      const parsedAmount = parseFloat(formData.amount);
      
      // Get selected category to verify it's compatible with transaction type
      const selectedCategory = categories.find(cat => cat.id === formData.category_id);
      
      // Verify the selected category is compatible with the transaction type
      if (selectedCategory && selectedCategory.type !== 'both' && selectedCategory.type !== formData.type) {
        toast.error(`This category can only be used for ${selectedCategory.type} transactions.`);
        setFormLoading(false);
        return;
      }

      // Log the transaction data before submission for debugging
      console.log("Submitting transaction:", {
        type: formData.type,
        category_id: formData.category_id,
        category_name: selectedCategory?.name || 'Uncategorized',
        category_type: selectedCategory?.type,
        amount: parsedAmount,
        description: formData.description || '',
        date: formData.date,
      });
      
      // Create a new transaction object - explicitly set type to ensure it matches expected values
      const newTransaction = {
        user_id: userData.user.id,
        type: formData.type === 'income' ? 'income' : 'expense',
        category_id: formData.category_id,
        amount: parsedAmount,
        description: formData.description || '',
        date: formData.date,
      };

      console.log("Final transaction to be saved:", newTransaction);

      if (formData.is_recurring) {
        if (editingRecurring) {
          // Update an existing recurring transaction
          const { error } = await supabase
            .from("recurring_transactions")
            .update({
              type: newTransaction.type,  // Use validated type
              category_id: formData.category_id,
              amount: parsedAmount,
              description: formData.description || '',
              start_date: formData.date,
              frequency: formData.recurring_frequency,
              end_date: formData.recurring_end_date || null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", editingRecurring.id);

          if (error) {
            console.error("Error updating recurring transaction:", error);
            toast.error(`Failed to update recurring transaction: ${error.message}`);
            setFormLoading(false);
            return;
          }
          toast.success("Recurring transaction updated!");
          setEditingRecurring(null);
        } else {
          // Create a new recurring transaction
          const { data: recurringData, error: recurringError } = await supabase
            .from("recurring_transactions")
            .insert({
              user_id: userData.user.id,
              type: newTransaction.type,  // Use validated type
              category_id: formData.category_id,
              amount: parsedAmount,
              description: formData.description || '',
              frequency: formData.recurring_frequency,
              start_date: formData.date,
              end_date: formData.recurring_end_date || null,
              active: true
            })
            .select();
            
          if (recurringError) {
            console.error("Error creating recurring transaction:", recurringError);
            toast.error(`Failed to create recurring transaction: ${recurringError.message}`);
            setFormLoading(false);
            return;
          }
          
          // Create the first instance of the transaction
          const { error: transactionError } = await supabase
            .from("transactions")
            .insert({
              user_id: userData.user.id,
              type: newTransaction.type,  // Use validated type
              category_id: formData.category_id,
              amount: parsedAmount,
              description: formData.description || '',
              date: formData.date,
              recurring_id: recurringData[0].id
            });
            
          if (transactionError) {
            console.error("Error creating initial transaction:", transactionError);
            toast.error(`Failed to create initial transaction: ${transactionError.message}`);
            setFormLoading(false);
            return;
          }
          
          toast.success("Recurring transaction created");
        }
      } else {
        // Handle regular transaction (non-recurring)
        if (isEditing && editId) {
          // Update existing transaction
          const { error } = await supabase
            .from("transactions")
            .update({
              type: newTransaction.type,  // Use validated type
              category_id: formData.category_id,
              amount: parsedAmount,
              description: formData.description || '',
              date: formData.date
            })
            .eq("id", editId);

          if (error) {
            console.error("Error updating transaction:", error);
            toast.error(`Failed to update transaction: ${error.message}`);
            setFormLoading(false);
            return;
          }
          toast.success("Transaction updated!");
        } else {
          // Insert new transaction
          console.log("Inserting new transaction of type:", newTransaction.type);
          
          // Force string type for income to ensure it's properly formatted
          const transactionTypeValue = newTransaction.type === 'income' ? 'income' : 'expense';
          
          // Try with direct insert first
          const { data, error } = await supabase
            .from("transactions")
            .insert([{
              user_id: userData.user.id,
              type: transactionTypeValue,  // Use the forced string version
              category_id: formData.category_id,
              amount: parsedAmount,
              description: formData.description || '',
              date: formData.date
            }])
            .select();

          if (error) {
            console.error("Error inserting transaction:", error);
            
            // Try with our reliable function
            try {
              console.log("Trying improved SQL function for transaction insertion");
              
              // Use our new reliable function
              const { data: reliableData, error: reliableError } = await supabase.rpc(
                'insert_transaction_reliable',
                {
                  p_user_id: userData.user.id,
                  p_type: transactionTypeValue,
                  p_category_id: formData.category_id,
                  p_amount: parsedAmount,
                  p_description: formData.description || '',
                  p_date: formData.date
                }
              );
              
              if (reliableError) {
                console.error("Reliable SQL approach failed:", reliableError);
                
                // Emergency direct INSERT as a fallback
                const { error: emergencyError } = await supabase.from('transactions').insert({
                  user_id: userData.user.id,
                  type: transactionTypeValue,
                  category_id: formData.category_id,
                  amount: parsedAmount,
                  description: formData.description || '',
                  date: formData.date,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                });
                
                if (emergencyError) {
                  console.error("ALL approaches failed:", emergencyError);
                  toast.error(`Failed to add transaction: ${emergencyError.message}`);
                  setFormLoading(false);
                  return;
                } else {
                  console.log("Transaction inserted with emergency approach");
                  toast.success(`${transactionTypeValue === 'income' ? 'Income' : 'Expense'} transaction added!`);
                }
              } else {
                console.log("Transaction inserted successfully with reliable SQL approach");
                toast.success(`${transactionTypeValue === 'income' ? 'Income' : 'Expense'} transaction added!`);
              }
            } catch (sqlError) {
              console.error("All approaches failed:", sqlError);
              toast.error(`Failed to add transaction: ${error.message}`);
              setFormLoading(false);
              return;
            }
          } else {
            console.log("Transaction inserted successfully with normal approach:", data);
            toast.success(`${transactionTypeValue === 'income' ? 'Income' : 'Expense'} transaction added!`);
          }
        }
      }

      // Clear form and refresh data
      closeTransactionForm();
      await fetchTransactions();
      
      // If sorting is active, reapply it
      if (sortField) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        setSortField(sortField);
        setSortDirection(sortDirection);
      }
    } catch (error: any) {
      console.error("Error in transaction submission:", error);
      toast.error(`An error occurred: ${error?.message || "Unknown error"}`);
    } finally {
      setFormLoading(false);
      // Clear draft after submission
      clearDraftTransaction();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id)
        .eq("user_id", userData.user.id);

      if (error) throw error;
      await fetchTransactions();
    } catch (error) {
      console.error("Error deleting transaction:", error);
      alert("Failed to delete transaction");
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortTransactions = (transactions: Transaction[]) => {
    return [...transactions].sort((a, b) => {
      let compareA, compareB;
      
      if (sortField === 'date') {
        compareA = new Date(a.date).getTime();
        compareB = new Date(b.date).getTime();
      } else if (sortField === 'amount') {
        compareA = a.amount;
        compareB = b.amount;
      } else if (sortField === 'category') {
        compareA = a.category_name?.toLowerCase() || '';
        compareB = b.category_name?.toLowerCase() || '';
      } else {
        compareA = a.description.toLowerCase();
        compareB = b.description.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return compareA > compareB ? 1 : -1;
      } else {
        return compareA < compareB ? 1 : -1;
      }
    });
  };

  // 3. Optimize the filtering and sorting operations
  const filteredAndSortedTransactions = useMemo(() => {
    let filtered = [...transactions];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (t.category_name && t.category_name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Apply type filter
    if (filterType !== "all") {
      filtered = filtered.filter((t) => t.type === filterType);
    }
    
    // Apply date filter
    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter((t) => {
        const transactionDate = new Date(t.date);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        endDate.setHours(23, 59, 59, 999); // Include the entire end date
        
        return transactionDate >= startDate && transactionDate <= endDate;
      });
    }
    
    // Sort the transactions
    return sortTransactions(filtered);
  }, [transactions, searchTerm, filterType, dateRange, sortField, sortDirection]);

  // 4. Calculate paginated transactions
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedTransactions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedTransactions, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredAndSortedTransactions.length / itemsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    // Auto-switch to card view on small screens
    const checkScreenSize = () => {
      if (window.innerWidth < 640 && viewMode === "table") {
        setViewMode("card");
      }
    };
    
    // Initial check
    checkScreenSize();
    
    // Add resize listener
    window.addEventListener('resize', checkScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkScreenSize);
  }, [viewMode]);

  // Pull to refresh implementation
  const onTouchStart = useCallback((e: TouchEvent) => {
    const { screenY } = e.touches[0];
    pullStartY.current = screenY;
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    if (!contentRef.current) return;
    
    // Only enable pull-to-refresh when at the top of the page
    if (window.scrollY > 0) return;
    
    const { screenY } = e.touches[0];
    pullMoveY.current = screenY;
    
    const pullDistance = pullMoveY.current - pullStartY.current;
    
    if (pullDistance > 0) {
      // Prevent default behavior when pulling down
      e.preventDefault();
      
      // Create pull effect with CSS transform
      const pullFactor = Math.min(pullDistance * 0.3, refreshDistance);
      contentRef.current.style.transform = `translateY(${pullFactor}px)`;
    }
  }, []);

  const onTouchEnd = useCallback(async () => {
    if (!contentRef.current) return;
    
    const pullDistance = pullMoveY.current - pullStartY.current;
    
    // Reset transform
    contentRef.current.style.transform = 'translateY(0)';
    
    // Trigger refresh if pulled enough
    if (pullDistance > refreshDistance) {
      try {
        setRefreshing(true);
        await fetchTransactions();
        toast.success("Transactions refreshed");
      } catch (error) {
        toast.error("Failed to refresh transactions");
      } finally {
        setRefreshing(false);
      }
    }
  }, [fetchTransactions]);

  useEffect(() => {
    if (!contentRef.current) return;
    
    const content = contentRef.current;
    
    content.addEventListener('touchstart', onTouchStart, { passive: false });
    content.addEventListener('touchmove', onTouchMove, { passive: false });
    content.addEventListener('touchend', onTouchEnd);
    
    return () => {
      content.removeEventListener('touchstart', onTouchStart);
      content.removeEventListener('touchmove', onTouchMove);
      content.removeEventListener('touchend', onTouchEnd);
    };
  }, [onTouchStart, onTouchMove, onTouchEnd]);
  
  const loadMoreTransactions = async () => {
    if (loadingMore || !hasMore) return;
    
    try {
      setLoadingMore(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      
      // Fetch more transactions with pagination
      const { data, error } = await supabase
        .from('transactions')
        .select('*, categories(*)')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .range(transactions.length, transactions.length + itemsPerPage - 1);

      if (error) throw error;

      if (data.length > 0) {
        const newTransactions = data.map(transaction => ({
          ...transaction,
          category_name: transaction.categories?.name || 'Uncategorized'
        }));
        
        setTransactions(prev => [...prev, ...newTransactions]);
        setHasMore(data.length === itemsPerPage);
        calculateSummary([...transactions, ...newTransactions]);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more transactions:", error);
      toast.error("Failed to load more transactions");
    } finally {
      setLoadingMore(false);
    }
  };

  // 6. Use intersection observer more efficiently
  useEffect(() => {
    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loadingMore) {
        loadMoreTransactions();
      }
    };

    const observer = new IntersectionObserver(handleIntersection, {
      rootMargin: '100px',
    });

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
    };
  }, [hasMore, loadingMore]);

  // Improved skeleton loader component
  const TransactionSkeleton = ({ view = "table" }: { view?: "table" | "card" }) => {
    // Card view skeleton
    if (view === "card") {
      return (
        <div className={styles.skeletonCardContainer}>
          {[...Array(3)].map((_, index) => (
            <div key={index} className="p-4 border-b animate-pulse">
              <div className="flex justify-between items-center mb-3">
                <div className="h-6 bg-gradient-to-r from-muted/50 via-muted to-muted/50 rounded-md w-24 shine-effect"></div>
                <div className="h-6 bg-gradient-to-r from-muted/50 via-muted to-muted/50 rounded-md w-20 shine-effect"></div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="h-5 w-5 rounded-full bg-gradient-to-r from-muted/50 via-muted to-muted/50 shine-effect"></div>
                <div className="h-6 bg-gradient-to-r from-muted/50 via-muted to-muted/50 rounded-md w-28 shine-effect"></div>
              </div>
              <div className="h-6 bg-gradient-to-r from-muted/50 via-muted to-muted/50 rounded-md w-full max-w-xs mb-3 shine-effect"></div>
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gradient-to-r from-muted/50 via-muted to-muted/50 rounded-md w-20 shine-effect"></div>
                <div className="flex space-x-2">
                  <div className="h-8 w-8 bg-gradient-to-r from-muted/50 via-muted to-muted/50 rounded-md shine-effect"></div>
                  <div className="h-8 w-8 bg-gradient-to-r from-muted/50 via-muted to-muted/50 rounded-md shine-effect"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }
    
    // Table view skeleton - properly wrapped in a table
    return (
      <div className={styles.skeletonTableContainer}>
        <table>
          <tbody>
            {[...Array(6)].map((_, index) => (
              <tr key={index} className={`animate-pulse ${styles.transactionRow}`}>
                <td className={styles.dateColumn}>
                  <div className="h-6 bg-gradient-to-r from-muted/50 via-muted to-muted/50 rounded-md w-24 shine-effect"></div>
                </td>
                <td className={styles.typeColumn}>
                  <div className="flex items-center">
                    <div className="h-5 w-5 rounded-full bg-gradient-to-r from-muted/50 via-muted to-muted/50 mr-2 shine-effect"></div>
                    <div className="h-6 bg-gradient-to-r from-muted/50 via-muted to-muted/50 rounded-md w-16 shine-effect"></div>
                  </div>
                </td>
                <td className={styles.categoryColumn}>
                  <div className="h-6 bg-gradient-to-r from-muted/50 via-muted to-muted/50 rounded-md w-28 shine-effect"></div>
                </td>
                <td className={styles.descriptionColumn}>
                  <div className="h-6 bg-gradient-to-r from-muted/50 via-muted to-muted/50 rounded-md w-32 sm:w-40 shine-effect"></div>
                </td>
                <td className={`${styles.amountColumn}`}>
                  <div className="h-6 bg-gradient-to-r from-muted/50 via-muted to-muted/50 rounded-md w-20 shine-effect ml-auto"></div>
                </td>
                <td className={styles.actionsColumn}>
                  <div className="flex space-x-2 justify-end">
                    <div className="h-8 w-8 bg-gradient-to-r from-muted/50 via-muted to-muted/50 rounded-md shine-effect"></div>
                    <div className="h-8 w-8 bg-gradient-to-r from-muted/50 via-muted to-muted/50 rounded-md shine-effect"></div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Skeleton loader for the card view while loading more
  const LoadMoreSkeleton = () => (
    <div className="py-6 flex justify-center items-center animate-pulse">
      <div className="h-10 bg-gradient-to-r from-muted/50 via-muted to-muted/50 rounded-md w-40 shine-effect"></div>
    </div>
  );

  // Load frequent categories
  const loadFrequentCategories = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Get categories used most frequently in recent transactions
      const { data: frequentCats } = await supabase
        .from('transactions')
        .select(`
          category_id,
          categories!inner (
            id,
            name,
            type,
            icon
          )
        `)
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (frequentCats) {
        const categoryFreq = new Map<string, number>();
        frequentCats.forEach(t => {
          if (t.categories) {
            const count = categoryFreq.get(t.category_id) || 0;
            categoryFreq.set(t.category_id, count + 1);
          }
        });

        const validCategories: Category[] = [];
        Array.from(categoryFreq.entries())
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .forEach(([categoryId]) => {
            const transaction = frequentCats.find(t => t.category_id === categoryId);
            if (transaction?.categories && Array.isArray(transaction.categories) && transaction.categories.length > 0) {
              validCategories.push(transaction.categories[0] as Category);
            } else if (transaction?.categories && !Array.isArray(transaction.categories)) {
              validCategories.push(transaction.categories as Category);
            }
          });

        setFrequentCategories(validCategories);
      }
    } catch (error) {
      console.error('Error loading frequent categories:', error);
    }
  };

  const clearDraftTransaction = () => {
    try {
      localStorage.removeItem('transactionDraft');
      setHasSavedDraft(false);
    } catch (error) {
      console.error('Error clearing draft:', error);
    }
  };

  const exportToCSV = (transactions: Transaction[], columns: any) => {
    // Basic CSV export functionality
    console.log('Exporting to CSV...', transactions.length, 'transactions');
  };

  const exportToExcel = (transactions: Transaction[], columns: any) => {
    // Basic Excel export functionality
    console.log('Exporting to Excel...', transactions.length, 'transactions');
  };

  const exportToPDF = (transactions: Transaction[], columns: any, summary: any, dateRange: any) => {
    // Basic PDF export functionality
    console.log('Exporting to PDF...', transactions.length, 'transactions');
  };

  const scheduleExport = (frequency: string, day: number, format: string, columns: any) => {
    // Basic schedule export functionality
    console.log('Scheduling export...', frequency, format);
  };

  // Load frequent categories implementation (continued)
  const loadFrequentCategoriesImpl = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Get the most frequently used categories by this user
      const { data, error } = await supabase
        .from('transactions')
        .select('category_id, categories(id, name, type)')
        .eq('user_id', user.id)
        .not('category_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      
      // Debug the structure of the data
      console.log("First item from transactions data:", data[0]);
      console.log("First item categories structure:", data[0]?.categories);
      
      // Count occurrences of each category
      const categoryCounts: Record<string, {count: number, category: Category}> = {};
      
      data.forEach(item => {
        if (item.categories) {
          const categoryId = item.category_id;
          console.log("Processing category:", item.categories);
          
          // Check if categories is an array or a single object
          const categoryData = Array.isArray(item.categories) ? item.categories[0] : item.categories;
          
          if (!categoryCounts[categoryId]) {
            categoryCounts[categoryId] = {
              count: 0,
              category: {
                id: categoryData.id,
                name: categoryData.name,
                type: categoryData.type as 'income' | 'expense' | 'both'
              }
            };
          }
          categoryCounts[categoryId].count++;
        }
      });
      
      // Sort by count and get top 5
      const sortedCategories = Object.values(categoryCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map(item => item.category);
      
      setFrequentCategories(sortedCategories);
    } catch (error) {
      console.error("Error loading frequent categories:", error);
    }
  };

  // Load draft transaction from localStorage
  const loadDraftTransaction = () => {
    try {
      const savedDraft = localStorage.getItem('transactionDraft');
      if (savedDraft) {
        const parsedDraft = JSON.parse(savedDraft);
        setFormData(parsedDraft);
        setHasSavedDraft(true);
      }
    } catch (error) {
      console.error("Error loading draft transaction:", error);
    }
  };
  
  // Save draft transaction to localStorage
  const saveDraftTransaction = (data: FormData) => {
    try {
      localStorage.setItem('transactionDraft', JSON.stringify(data));
      setHasSavedDraft(true);
    } catch (error) {
      console.error("Error saving draft transaction:", error);
    }
  };

  // Add fetchRecurringTransactions function
  const fetchRecurringTransactions = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error }: ApiResponse<(RecurringTransaction & { categories: Category | null })[]> = await supabase
        .from("recurring_transactions")
        .select(`
          *,
          categories:category_id (
            name,
            type
          )
        `)
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching recurring transactions:", error);
        return;
      }
      
      if (!data) {
        console.error("No data received from recurring transactions query");
        return;
      }

      setRecurringTransactions(data || []);
      
      // Generate upcoming recurring transactions preview
      if (data && data.length > 0) {
        generateUpcomingTransactions(data);
      }
    } catch (error) {
      console.error("Error in fetchRecurringTransactions:", error);
    }
  };

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
    
    setUpcomingRecurringTransactions(upcoming);
  };

  const toggleUpcomingPreview = () => {
    setShowUpcomingPreview(!showUpcomingPreview);
  };

  const openEditRecurringForm = (recurring: RecurringTransaction) => {
    setEditingRecurring(recurring);
    setFormData({
      type: recurring.type,
      category_id: recurring.category_id,
      amount: recurring.amount.toString(),
      description: recurring.description,
      date: recurring.start_date,
      is_recurring: true,
      recurring_frequency: recurring.frequency,
      recurring_end_date: recurring.end_date || ""
    });
    setShowForm(true);
  };

  // Process due recurring transactions
  const processRecurringTransactions = async (recurringList: RecurringTransaction[]) => {
    try {
      const today = new Date();
      const processedCount = {
        created: 0,
        skipped: 0
      };
      
      for (const recurring of recurringList) {
        // Skip inactive recurring transactions
        if (!recurring.active) continue;
        
        // Skip if end date is reached
        if (recurring.end_date && new Date(recurring.end_date) < today) continue;
        
        // Calculate next due date
        const lastGenerated = recurring.last_generated 
          ? new Date(recurring.last_generated) 
          : new Date(recurring.start_date);
        
        const nextDueDate = calculateNextRecurringDate(lastGenerated, recurring.frequency);
        
        // Skip if next due date is in the future
        if (nextDueDate > today) continue;
        
        // Create transaction for the due date
        const { error } = await supabase
          .from("transactions")
          .insert({
            user_id: recurring.user_id,
            type: recurring.type,
            category_id: recurring.category_id,
            amount: recurring.amount,
            description: `${recurring.description} (Recurring)`,
            date: nextDueDate.toISOString().split("T")[0],
            recurring_id: recurring.id
          });
          
        if (error) {
          console.error("Error creating recurring transaction:", error);
          processedCount.skipped++;
          continue;
        }
        
        // Update last_generated
        await supabase
          .from("recurring_transactions")
          .update({ last_generated: nextDueDate.toISOString() })
          .eq("id", recurring.id);
          
        processedCount.created++;
      }
      
      if (processedCount.created > 0) {
        toast.success(`Created ${processedCount.created} recurring transactions`);
        fetchTransactions(); // Refresh transactions
      }
      
      if (processedCount.skipped > 0) {
        toast.error(`Failed to process ${processedCount.skipped} recurring transactions`);
      }
    } catch (error) {
      console.error("Error processing recurring transactions:", error);
    }
  };
  
  // Add useEffect to load recurring transactions
  useEffect(() => {
    if (!loading) {
      fetchRecurringTransactions();
    }
  }, [loading]);

  // Add a function to toggle between regular and recurring transactions
  const toggleRecurringView = () => {
    setShowRecurring(!showRecurring);
  };

  // Add recurring transaction management functions
  const deactivateRecurring = async (id: string) => {
    try {
      const { error } = await supabase
        .from("recurring_transactions")
        .update({ active: false })
        .eq("id", id);
        
      if (error) throw error;
      
      toast.success("Recurring transaction deactivated");
      fetchRecurringTransactions();
    } catch (error) {
      console.error("Error deactivating recurring transaction:", error);
      toast.error("Failed to deactivate recurring transaction");
    }
  };

  const CardRenderer = useCallback(({ index, style }: { index: number, style: React.CSSProperties }) => {
    const transaction = paginatedTransactions[index];
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
                      onClick={() => handleEdit(transaction)}
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
                      onClick={() => handleDelete(transaction.id)}
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
  }, [paginatedTransactions, handleEdit, handleDelete]);

  // 5. Implement event delegation for transaction list
  useEffect(() => {
    const handleTableClick = (e: MouseEvent) => {
      // Find the closest parent transaction row
      const row = (e.target as HTMLElement).closest('tr[data-id]');
      if (!row) return;
      
      const transactionId = row.getAttribute('data-id');
      if (!transactionId) return;
      
      // Find which button was clicked
      const editButton = (e.target as HTMLElement).closest('button[aria-label="Edit"]');
      const deleteButton = (e.target as HTMLElement).closest('button[aria-label="Delete"]');
      
      if (editButton) {
        const transaction = transactions.find(t => t.id === transactionId);
        if (transaction) {
          handleEdit(transaction);
        }
      } else if (deleteButton) {
        handleDelete(transactionId);
      }
    };
    
    const tbody = document.getElementById('transactions-tbody');
    if (tbody) {
      tbody.addEventListener('click', handleTableClick);
    }
    
    return () => {
      if (tbody) {
        tbody.removeEventListener('click', handleTableClick);
      }
    };
  }, [transactions, handleEdit, handleDelete]);

  // Use useEffect to add CSS to prevent duplicate form fields
  useEffect(() => {
    // Add a style element to fix duplicate fields in the transaction form
    const style = document.createElement('style');
    style.textContent = `
      /* Fix for duplicate form fields in transaction modal */
      .transaction-form-container label[for="transaction-type"]:not(:first-of-type),
      .transaction-form-container select[name="type"]:not(:first-of-type),
      .transaction-form-container label[for="transaction-category"]:not(:first-of-type),
      .transaction-form-container select[name="category_id"]:not(:first-of-type),
      .transaction-form-container label[for="transaction-amount"]:not(:first-of-type),
      .transaction-form-container input[name="amount"]:not(:first-of-type),
      .transaction-form-container label[for="transaction-date"]:not(:first-of-type),
      .transaction-form-container input[name="date"]:not(:first-of-type),
      .transaction-form-container label[for="transaction-description"]:not(:first-of-type),
      .transaction-form-container textarea[name="description"]:not(:first-of-type) {
        display: none !important;
      }
      
      /* Hide any duplicate form elements */
      .transaction-form-container .space-y-4 > div:nth-of-type(5) ~ div {
        display: none !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  if (loading && transactions.length === 0) {
    return (
      <div className="container mx-auto p-4 md:p-6">
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="skeleton-loader h-8 w-40"></div>
          <div className="flex gap-2">
            <div className="skeleton-loader h-10 w-24 rounded-md"></div>
            <div className="skeleton-loader h-10 w-36 rounded-md"></div>
          </div>
        </div>
        
        {/* Skeleton Summary Cards */}
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="skeleton-loader h-4 w-24 mb-2"></div>
            <div className="skeleton-loader h-8 w-32"></div>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="skeleton-loader h-4 w-24 mb-2"></div>
            <div className="skeleton-loader h-8 w-32"></div>
          </div>
          <div className="rounded-lg border bg-card p-4 shadow-sm sm:col-span-2 md:col-span-1">
            <div className="skeleton-loader h-4 w-24 mb-2"></div>
            <div className="skeleton-loader h-8 w-32"></div>
          </div>
        </div>
        
        {/* Skeleton Filters */}
        <div className="mb-6 rounded-lg border bg-card p-4 shadow-sm">
          <div className="skeleton-loader h-6 w-32 mb-4"></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="skeleton-loader h-32 rounded-md"></div>
            <div className="skeleton-loader h-32 rounded-md"></div>
            <div className="skeleton-loader h-32 rounded-md sm:col-span-2 md:col-span-1"></div>
          </div>
        </div>
        
        {/* Skeleton Transaction List */}
        <div className="rounded-lg border bg-card shadow-sm">
          <div className="p-4 sm:hidden">
            <TransactionSkeleton view="table" />
          </div>
          <div className="p-4 sm:hidden">
            <TransactionSkeleton view="card" />
          </div>
          <div className="hidden sm:block">
            <div className="border-b p-3 bg-muted/50">
              <div className="flex justify-between">
                <div className="skeleton-loader h-6 w-20"></div>
                <div className="skeleton-loader h-6 w-20"></div>
                <div className="skeleton-loader h-6 w-20"></div>
                <div className="skeleton-loader h-6 w-20"></div>
                <div className="skeleton-loader h-6 w-20"></div>
              </div>
            </div>
            
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="border-b p-3 flex justify-between items-center">
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
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div ref={contentRef}>
        {/* Pull-to-refresh indicator */}
        {refreshing && (
          <div className="pull-indicator">
            <svg className="pull-indicator-icon animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        )}

        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <h1 className="text-2xl font-bold md:text-3xl">Transactions</h1>
          <div className="flex flex-wrap gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExportToCSV()}>
                  <Download className="mr-2 h-4 w-4" />
                  CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportToExcel()}>
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExportToPDF()}>
                  <FileText className="mr-2 h-4 w-4" />
                  PDF
                </DropdownMenuItem>
                {scheduleExportFrequency !== 'none' && (
                  <DropdownMenuItem onClick={handleScheduleExport}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule Export
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button 
              onClick={() => openTransactionForm()}
              className="flex items-center gap-1 min-h-[44px]"
            >
              <PlusCircle size={16} />
              <span>Add Transaction</span>
            </Button>
          </div>
        </div>

        {/* Floating action button for mobile */}
        <AddTransactionButton onClick={() => openTransactionForm()} />

        {/* Summary Cards */}
        <TransactionSummaryCards summary={summary} />

        {/* Enhanced Charts Section */}
        <div className="mb-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                📊 Financial Analytics
              </h2>
              <p className="text-muted-foreground text-sm">
                Interactive charts and insights from your financial data
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 bg-muted/30 rounded-full px-4 py-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium text-muted-foreground">
                  {monthlyData.length} months analyzed
                </span>
              </div>
              <Button 
                variant={showCharts ? "default" : "outline"}
                onClick={() => setShowCharts(!showCharts)}
                className="text-sm font-medium transition-all duration-200 hover:scale-105"
                size="sm"
              >
                {showCharts ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Hide Analytics
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Show Analytics
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {showCharts && (
            <div className="space-y-8 animate-in slide-in-from-top-4 duration-500">
              {/* Quick Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-2xl p-4 border border-blue-200/50 dark:border-blue-800/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-xl">
                      <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">Monthly Avg Income</p>
                      <p className="text-lg font-bold text-blue-800 dark:text-blue-200">
                        {formatCurrency(monthlyData.reduce((sum, month) => sum + month.income, 0) / Math.max(monthlyData.length, 1))}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 rounded-2xl p-4 border border-red-200/50 dark:border-red-800/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-xl">
                      <TrendingDown className="w-5 h-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-red-700 dark:text-red-300 mb-1">Monthly Avg Expenses</p>
                      <p className="text-lg font-bold text-red-800 dark:text-red-200">
                        {formatCurrency(monthlyData.reduce((sum, month) => sum + month.expense, 0) / Math.max(monthlyData.length, 1))}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 rounded-2xl p-4 border border-green-200/50 dark:border-green-800/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/10 rounded-xl">
                      <PiggyBank className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">Savings Rate</p>
                      <p className="text-lg font-bold text-green-800 dark:text-green-200">
                        {monthlyData.length > 0 ? (((monthlyData.reduce((sum, month) => sum + month.income - month.expense, 0) / monthlyData.reduce((sum, month) => sum + month.income, 0)) * 100) || 0).toFixed(1) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 rounded-2xl p-4 border border-purple-200/50 dark:border-purple-800/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-xl">
                      <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-purple-700 dark:text-purple-300 mb-1">Total Transactions</p>
                      <p className="text-lg font-bold text-purple-800 dark:text-purple-200">
                        {transactions.length.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enhanced Chart Grid */}
              <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
                {/* Income vs Expenses Chart */}
                <div className="bg-gradient-to-br from-card via-card/95 to-muted/20 rounded-2xl border border-border/50 shadow-xl backdrop-blur-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-muted/30 to-muted/10 p-6 border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-emerald-500/10 to-red-500/10 rounded-xl">
                          <BarChart3 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">Income vs. Expenses</h3>
                          <p className="text-sm text-muted-foreground">Monthly cash flow analysis</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full bg-emerald-500" />
                          <span className="text-xs text-emerald-600 font-medium">Income</span>
                          <div className="w-3 h-3 rounded-full bg-red-500 ml-2" />
                          <span className="text-xs text-red-600 font-medium">Expenses</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowFullscreenChart(true)}
                          className="h-8 w-8 p-0 hover:bg-primary/10 transition-all duration-200 group"
                          title="View in fullscreen"
                        >
                          <Maximize2 className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:scale-110 transition-all duration-200" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="h-80">
                      <IncomeExpenseChart 
                        monthlyData={monthlyData.map(month => ({
                          ...month,
                          onClick: (monthData: any) => {
                            // Interactive month click - filter transactions for that month
                            const monthMatch = monthData.name.match(/(\w+)\s+(\d+)/);
                            if (monthMatch) {
                              const [, monthName, year] = monthMatch;
                              const monthNumber = new Date(`${monthName} 1, ${year}`).getMonth();
                              const startDate = new Date(parseInt(year), monthNumber, 1);
                              const endDate = new Date(parseInt(year), monthNumber + 1, 0);
                              
                              setDateRange({
                                start: startDate.toISOString().split('T')[0],
                                end: endDate.toISOString().split('T')[0]
                              });
                              
                              toast.success(
                                `📅 Filtered to ${monthName} ${year}`,
                                {
                                  description: `Income: ${formatCurrency(monthData.income)} • Expenses: ${formatCurrency(monthData.expense)}`,
                                  duration: 4000
                                }
                              );
                            }
                          }
                        }))}
                      />
                    </div>
                  </div>
                </div>

                {/* Year-over-Year Comparison */}
                <div className="bg-gradient-to-br from-card via-card/95 to-muted/20 rounded-2xl border border-border/50 shadow-xl backdrop-blur-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-muted/30 to-muted/10 p-6 border-b border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-xl">
                          <TrendingUp className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">Year-over-Year Analysis</h3>
                          <p className="text-sm text-muted-foreground">Compare spending patterns across years</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-muted/30 rounded-full px-3 py-1">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span className="text-xs font-medium text-primary">Multi-year data</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="h-80">
                      <YearOverYearComparison 
                        onYearClick={(year) => {
                          console.log('Year clicked:', year);
                          
                          // Filter transactions by the selected year and show insights
                          const yearTransactions = transactions.filter(t => 
                            new Date(t.date).getFullYear() === year
                          );
                          
                          if (yearTransactions.length > 0) {
                            const totalSpent = yearTransactions
                              .filter(t => t.type === 'expense')
                              .reduce((sum, t) => sum + t.amount, 0);
                            const totalIncome = yearTransactions
                              .filter(t => t.type === 'income')
                              .reduce((sum, t) => sum + t.amount, 0);
                            
                            toast.success(
                              `📊 ${year} Analysis: ${formatCurrency(totalIncome)} income, ${formatCurrency(totalSpent)} expenses`,
                              { 
                                duration: 5000,
                                description: `Net: ${formatCurrency(totalIncome - totalSpent)} • ${yearTransactions.length} transactions`
                              }
                            );
                            
                            // Auto-filter to show that year's data
                            const startOfYear = new Date(year, 0, 1).toISOString().split('T')[0];
                            const endOfYear = new Date(year, 11, 31).toISOString().split('T')[0];
                            setDateRange({ start: startOfYear, end: endOfYear });
                          } else {
                            toast.info(`No transactions found for ${year}`);
                          }
                        }}
                        className="h-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Insights Row */}
              <div className="bg-gradient-to-br from-muted/10 via-background to-muted/5 rounded-2xl border border-border/50 p-6">
                <h4 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Smart Insights
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 rounded-xl p-4 border border-blue-200/50">
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-blue-500/10 rounded-lg">
                        <Info className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">Spending Pattern</p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          {monthlyData.length > 0 && monthlyData[monthlyData.length - 1]?.expense > monthlyData[Math.max(0, monthlyData.length - 2)]?.expense 
                            ? "Your expenses increased last month. Consider reviewing your budget." 
                            : "Your spending is stable. Great job maintaining control!"}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/20 rounded-xl p-4 border border-green-200/50">
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-green-500/10 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-200 mb-1">Income Trend</p>
                        <p className="text-xs text-green-700 dark:text-green-300">
                          {monthlyData.length > 1 && monthlyData[monthlyData.length - 1]?.income > monthlyData[monthlyData.length - 2]?.income
                            ? "Your income is growing! Keep up the good work."
                            : "Consider exploring additional income streams."}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 rounded-xl p-4 border border-purple-200/50">
                    <div className="flex items-start gap-3">
                      <div className="p-1 bg-purple-500/10 rounded-lg">
                        <Target className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-purple-800 dark:text-purple-200 mb-1">Financial Goal</p>
                        <p className="text-xs text-purple-700 dark:text-purple-300">
                          {monthlyData.length > 0 && (monthlyData.reduce((sum, month) => sum + month.income - month.expense, 0) / monthlyData.reduce((sum, month) => sum + month.income, 0)) * 100 >= 20
                            ? "Excellent! You're saving over 20% of your income."
                            : "Try to save at least 20% of your monthly income."}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add tab buttons for regular and recurring transactions */}
        <div className="mb-4 flex gap-2">
          <Button 
            variant={showRecurring ? "outline" : "default"} 
            size="sm" 
            onClick={() => setShowRecurring(false)}
          >
            Regular
          </Button>
          <Button 
            variant={showRecurring ? "default" : "outline"} 
            size="sm" 
            onClick={() => setShowRecurring(true)}
          >
            <RefreshCw size={16} className={`${refreshing ? "animate-spin" : ""}`} />
            <span className="ml-2">Refresh</span>
          </Button>
        </div>
        
        {/* Conditionally show regular or recurring transactions */}
        {!showRecurring ? (
          /* Regular transactions view - existing JSX */
          <div>
            {/* ... Your existing transactions table/card display ... */}
          </div>
        ) : (
          /* Recurring transactions view */
          <RecurringTransactions
            recurringTransactions={recurringTransactions}
            categories={categories}
            onEdit={openEditRecurringForm}
            onDelete={deactivateRecurring}
            onRefresh={() => processRecurringTransactions(recurringTransactions)}
          />
        )}

        {/* Transaction Form Drawer */}
        {showForm && (
          <AddTransactionForm 
            isOpen={showForm}
            onClose={closeTransactionForm}
            onTransactionAdded={() => {
              fetchTransactions();
              fetchCategories();
            }}
            categories={categories}
            isEditing={isEditing}
            editTransaction={isEditing ? transactions.find(t => t.id === editId) : null}
          />
        )}

        {/* Transaction Filters */}
        <TransactionFilters
          filterType={filterType}
          setFilterType={setFilterType}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          dateRange={dateRange}
          setDateRange={setDateRange}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />

        {/* Transactions List */}
        <div className="rounded-lg border bg-card shadow-sm">
          {/* Table View */}
          {viewMode === "table" && (
            <TransactionTable
              transactions={paginatedTransactions}
              onEdit={handleEdit}
              onDelete={handleDelete}
              loading={loading}
              onAddTransaction={openTransactionForm}
              sortField={sortField}
              sortDirection={sortDirection}
              onSort={handleSort}
            />
          )}

          {/* Mobile Card View */}
          {viewMode === "card" && (
            <TransactionCardView
              transactions={paginatedTransactions}
              onEdit={handleEdit}
              onDelete={handleDelete}
              loading={loading}
              onAddTransaction={openTransactionForm}
            />
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <TransactionPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredAndSortedTransactions.length}
              itemsPerPage={itemsPerPage}
              onPageChange={paginate}
            />
          )}
        </div>
      </div>

      {/* Fullscreen Chart Modal */}
      {showFullscreenChart && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-6 border-b border-border/50 bg-gradient-to-r from-muted/30 to-muted/10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-emerald-500/10 to-red-500/10 rounded-xl">
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">Income vs. Expenses Analysis</h2>
                <p className="text-muted-foreground">
                  Comprehensive monthly cash flow visualization • {monthlyData.length} months of data
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFullscreenChart(false)}
              className="h-10 w-10 p-0 hover:bg-destructive/10 hover:text-destructive transition-all duration-200 group rounded-xl"
              title="Close fullscreen view"
            >
              <X className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
            </Button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 p-6 overflow-hidden">
            <div className="h-full bg-gradient-to-br from-card via-card/95 to-muted/20 rounded-2xl border border-border/50 shadow-2xl backdrop-blur-sm p-6">
              {/* Enhanced Stats Row for Fullscreen */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 rounded-xl p-4 border border-emerald-200/50">
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-emerald-600" />
                    <div>
                      <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Total Income</p>
                      <p className="text-xl font-bold text-emerald-800 dark:text-emerald-200">
                        {formatCurrency(monthlyData.reduce((sum, month) => sum + month.income, 0))}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 rounded-xl p-4 border border-red-200/50">
                  <div className="flex items-center gap-3">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                    <div>
                      <p className="text-sm font-medium text-red-700 dark:text-red-300">Total Expenses</p>
                      <p className="text-xl font-bold text-red-800 dark:text-red-200">
                        {formatCurrency(monthlyData.reduce((sum, month) => sum + month.expense, 0))}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 rounded-xl p-4 border border-purple-200/50">
                  <div className="flex items-center gap-3">
                    <PiggyBank className="w-6 h-6 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Net Balance</p>
                      <p className="text-xl font-bold text-purple-800 dark:text-purple-200">
                        {formatCurrency(
                          monthlyData.reduce((sum, month) => sum + month.income - month.expense, 0)
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-xl p-4 border border-blue-200/50">
                  <div className="flex items-center gap-3">
                    <BarChart3 className="w-6 h-6 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Avg Monthly</p>
                      <p className="text-xl font-bold text-blue-800 dark:text-blue-200">
                        {formatCurrency(
                          monthlyData.reduce((sum, month) => sum + month.income, 0) / Math.max(monthlyData.length, 1)
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Fullscreen Chart */}
              <div className="h-[calc(100%-120px)] min-h-[500px] bg-gradient-to-br from-background/50 to-muted/10 rounded-xl p-4 border border-border/30">
                <IncomeExpenseChart 
                  monthlyData={monthlyData.map(month => ({
                    ...month,
                    onClick: (monthData: any) => {
                      // Interactive month click - filter transactions for that month
                      const monthMatch = monthData.name.match(/(\w+)\s+(\d+)/);
                      if (monthMatch) {
                        const [, monthName, year] = monthMatch;
                        const monthNumber = new Date(`${monthName} 1, ${year}`).getMonth();
                        const startDate = new Date(parseInt(year), monthNumber, 1);
                        const endDate = new Date(parseInt(year), monthNumber + 1, 0);
                        
                        setDateRange({
                          start: startDate.toISOString().split('T')[0],
                          end: endDate.toISOString().split('T')[0]
                        });
                        
                        // Close fullscreen and show filtered data
                        setShowFullscreenChart(false);
                        
                        toast.success(
                          `📅 Filtered to ${monthName} ${year}`,
                          {
                            description: `Income: ${formatCurrency(monthData.income)} • Expenses: ${formatCurrency(monthData.expense)}`,
                            duration: 4000
                          }
                        );
                      }
                    }
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Modal Footer with Instructions */}
          <div className="p-6 border-t border-border/50 bg-gradient-to-r from-muted/20 to-muted/10">
            <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Click on chart points to filter transactions by month</span>
              </div>
              <div className="flex items-center gap-2">
                <kbd className="px-2 py-1 bg-muted rounded text-xs">ESC</kbd>
                <span>to close</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
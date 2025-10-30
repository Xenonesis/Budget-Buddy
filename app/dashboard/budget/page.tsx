"use client";

import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ValidatedInput } from "@/components/ui/validated-input";
import { validateAmount } from "@/lib/validation";
import { Plus, AlertTriangle, CheckCircle, X, DollarSign, Calendar, ChevronDown, BarChart3, Info } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { SortableBudgetList } from './components/SortableBudgetList';
import { BudgetFilters } from './components/BudgetFilters';
import { Budget, CategorySpending, Category, BudgetFilter } from './types';
import { Logo } from "@/components/ui/logo";

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    category_id: "",
    amount: "",
    period: "monthly",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    action: () => Promise<void>;
  } | null>(null);
  const [existingBudgetToUpdate, setExistingBudgetToUpdate] = useState<Budget | null>(null);
  
  // Filtering and sorting state
  const [searchTerm, setSearchTerm] = useState('');
  const [budgetFilter, setBudgetFilter] = useState<BudgetFilter>('all');
  const [sortBy, setSortBy] = useState<'name' | 'amount' | 'spent' | 'percentage'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [periodFilter, setPeriodFilter] = useState<'all' | 'monthly' | 'weekly' | 'yearly'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Computed values
  const hasExpenseCategories = categories.some(c => c.type !== "income");
  
  // Filtering and sorting logic
  const filteredAndSortedData = useMemo(() => {
    let filteredBudgets = budgets;
    let filteredSpending = categorySpending;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filteredBudgets = budgets.filter(budget => 
        budget.category_name?.toLowerCase().includes(searchLower)
      );
      filteredSpending = categorySpending.filter(spending => 
        spending.category_name.toLowerCase().includes(searchLower)
      );
    }

    // Apply budget status filter
    if (budgetFilter !== 'all') {
      const relevantCategoryIds = new Set();
      
      if (budgetFilter === 'over-budget') {
        filteredSpending = filteredSpending.filter(spending => spending.percentage > 100);
      } else if (budgetFilter === 'under-budget') {
        filteredSpending = filteredSpending.filter(spending => spending.percentage <= 100);
      }
      
      filteredSpending.forEach(spending => relevantCategoryIds.add(spending.category_id));
      filteredBudgets = filteredBudgets.filter(budget => relevantCategoryIds.has(budget.category_id));
    }

    // Apply period filter
    if (periodFilter !== 'all') {
      filteredBudgets = filteredBudgets.filter(budget => budget.period === periodFilter);
    }

    // Apply sorting
    filteredSpending.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.category_name.toLowerCase();
          bValue = b.category_name.toLowerCase();
          break;
        case 'amount':
          aValue = a.budget;
          bValue = b.budget;
          break;
        case 'spent':
          aValue = a.spent;
          bValue = b.spent;
          break;
        case 'percentage':
          aValue = a.percentage;
          bValue = b.percentage;
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'string') {
        const comparison = aValue.localeCompare(bValue as string);
        return sortOrder === 'asc' ? comparison : -comparison;
      } else {
        const comparison = (aValue as number) - (bValue as number);
        return sortOrder === 'asc' ? comparison : -comparison;
      }
    });

    return { budgets: filteredBudgets, spending: filteredSpending };
  }, [budgets, categorySpending, searchTerm, budgetFilter, periodFilter, sortBy, sortOrder]);
  
  useEffect(() => {
    fetchBudgets();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .or(`user_id.is.null,user_id.eq.${userData.user.id}`)
        .eq('is_active', true)
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories", {
        description: "Please check your connection and try again",
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      });
    }
  };

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Fetch budgets with proper category join and validation
      const { data: budgetData, error: budgetError } = await supabase
        .from("budgets")
        .select(`
          *,
          categories!inner(
            id,
            name,
            type,
            is_active
          )
        `)
        .eq("user_id", userData.user.id)
        .eq("categories.is_active", true);

      if (budgetError) throw budgetError;
      
      // Map budgets to include category name and ensure proper structure
      let mappedBudgets = budgetData?.map(budget => ({
        id: budget.id,
        user_id: budget.user_id,
        category_id: budget.category_id,
        category_name: budget.categories?.name || 'Unknown Category',
        amount: Number(budget.amount), // Ensure it's a number
        period: budget.period,
        created_at: budget.created_at,
        order: budget.order || 0
      })) || [];
      
      // Sort budgets by order
      mappedBudgets.sort((a, b) => (a.order || 0) - (b.order || 0));
      setBudgets(mappedBudgets);

      // Fetch transactions for spending calculation with proper date filtering
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      const { data: transactionData, error: transactionError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userData.user.id)
        .eq("type", "expense");

      if (transactionError) throw transactionError;

      // Calculate spending by category_id with proper period filtering
      const categoriesSpent: { [key: string]: { monthly: number, weekly: number, yearly: number } } = {};
      
      (transactionData || []).forEach((transaction) => {
        const transactionDate = new Date(transaction.date);
        const categoryId = transaction.category_id;
        
        if (!categoriesSpent[categoryId]) {
          categoriesSpent[categoryId] = { monthly: 0, weekly: 0, yearly: 0 };
        }
        
        const amount = Number(transaction.amount);
        
        // Monthly spending (current month)
        if (transactionDate >= startOfMonth) {
          categoriesSpent[categoryId].monthly += amount;
        }
        
        // Weekly spending (current week)  
        if (transactionDate >= startOfWeek) {
          categoriesSpent[categoryId].weekly += amount;
        }
        
        // Yearly spending (current year)
        if (transactionDate >= startOfYear) {
          categoriesSpent[categoryId].yearly += amount;
        }
      });

      // Create spending data with proper period-based calculations
      const spending: CategorySpending[] = mappedBudgets.map((budget) => {
        const categorySpending = categoriesSpent[budget.category_id] || { monthly: 0, weekly: 0, yearly: 0 };
        
        // Get the appropriate spending amount based on budget period
        let spent = 0;
        switch (budget.period) {
          case 'weekly':
            spent = categorySpending.weekly;
            break;
          case 'monthly':
            spent = categorySpending.monthly;
            break;
          case 'yearly':
            spent = categorySpending.yearly;
            break;
          default:
            spent = categorySpending.monthly;
        }
        
        const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
        
        return {
          category_id: budget.category_id,
          category_name: budget.category_name,
          spent: spent,
          budget: budget.amount,
          percentage: percentage,
        };
      });

      // Sort by percentage (highest first)
      spending.sort((a, b) => b.percentage - a.percentage);
      setCategorySpending(spending);
      
    } catch (error) {
      console.error("Error fetching budgets:", error);
      toast.error("Failed to load budget data", {
        description: "Please check your connection and try again",
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
    
    // Clear form error when user makes changes
    if (formError) {
      setFormError(null);
    }
  };

  const resetForm = () => {
    setFormData({
      category_id: "",
      amount: "",
      period: "monthly",
    });
    setIsEditing(false);
    setEditId(null);
    setFormError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);
    
    try {
      // Validate required fields
      if (!formData.category_id || !formData.amount) {
        setFormError("Please fill all required fields");
        setFormLoading(false);
        return;
      }
      
      // Validate amount is a number and > 0
      const budgetAmount = parseFloat(formData.amount);
      if (isNaN(budgetAmount) || budgetAmount <= 0) {
        setFormError("Please enter a valid amount greater than zero");
        setFormLoading(false);
        return;
      }
      
      // Validate category exists and is active
      const { data: categoryCheck } = await supabase
        .from("categories")
        .select("id, name, is_active")
        .eq("id", formData.category_id)
        .eq("is_active", true)
        .single();
      
      if (!categoryCheck) {
        setFormError("Selected category is not valid or has been deleted");
        setFormLoading(false);
        return;
      }
      
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("You must be logged in to manage budgets", {
          icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
        });
        setFormLoading(false);
        return;
      }

      if (isEditing && editId) {
        // Update existing budget
        const { error } = await supabase
          .from("budgets")
          .update({
            category_id: formData.category_id,
            amount: budgetAmount,
            period: formData.period as "monthly" | "weekly" | "yearly",
          })
          .eq("id", editId)
          .eq("user_id", user.id);

        if (error) {
          console.error("Error updating budget:", error);
          setFormError(`Failed to update budget: ${error.message}`);
          return;
        }
        
        toast.success("Budget updated successfully", {
          description: "Your budget changes have been saved",
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
        });
      } else {
        // Check if budget for this category already exists
        const existingBudget = budgets.find(
          (b) => b.category_id === formData.category_id
        );

        if (existingBudget) {
          // Show confirmation modal instead of window.confirm
          setExistingBudgetToUpdate(existingBudget);
          setConfirmAction({
            title: "Update Existing Budget",
            message: "A budget for this category already exists. Do you want to update it?",
            action: async () => {
              try {
                if (!existingBudgetToUpdate) return;
                
                const { error } = await supabase
                  .from("budgets")
                  .update({
                    amount: budgetAmount,
                    period: formData.period as "monthly" | "weekly" | "yearly",
                  })
                  .eq("id", existingBudgetToUpdate.id)
                  .eq("user_id", user.id);

                if (error) {
                  console.error("Error updating existing budget:", error);
                  setFormError(`Failed to update budget: ${error.message}`);
                  return;
                }
                
                toast.success("Budget updated successfully", {
                  description: `Updated budget for ${categories.find(c => c.id === existingBudgetToUpdate.category_id)?.name || 'category'}`,
                  icon: <CheckCircle className="h-5 w-5 text-green-500" />,
                });
                
                // Refresh budgets and reset form
                await fetchBudgets();
                resetForm();
                setShowForm(false);
              } catch (error: any) {
                console.error("Error updating budget:", error);
                toast.error("Failed to update budget", {
                  description: error?.message || "An unexpected error occurred",
                  icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
                });
              } finally {
                setFormLoading(false);
                setShowConfirmModal(false);
              }
            }
          });
          setShowConfirmModal(true);
          setFormLoading(false);
          return;
        } else {
          // Create new budget
          const { error } = await supabase.from("budgets").insert([
            {
              user_id: user.id,
              category_id: formData.category_id,
              amount: budgetAmount,
              period: formData.period,
            },
          ]);

          if (error) {
            console.error("Error creating new budget:", error);
            setFormError(`Failed to save budget: ${error.message}`);
            return;
          }
          
          toast.success("Budget created successfully", {
            description: `New budget for ${categories.find(c => c.id === formData.category_id)?.name || 'category'} has been created`,
            icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          });
        }
      }

      // Refresh budgets and reset form
      await fetchBudgets();
      resetForm();
      setShowForm(false);
    } catch (error: any) {
      console.error("Error saving budget:", error);
      setFormError(`${error?.message || "Unknown error"}`);
      toast.error("Failed to save budget", {
        description: error?.message || "An unexpected error occurred",
        icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (budget: Budget) => {
    setFormData({
      category_id: budget.category_id,
      amount: budget.amount.toString(),
      period: budget.period,
    });
    setIsEditing(true);
    setEditId(budget.id);
    setShowForm(true);
    setFormError(null);
  };

  const handleDelete = async (id: string) => {
    const budgetToDelete = budgets.find(b => b.id === id);
    setConfirmAction({
      title: "Delete Budget",
      message: `Are you sure you want to delete the budget for ${budgetToDelete?.category_name || 'this category'}?`,
      action: async () => {
        try {
          const { data: userData } = await supabase.auth.getUser();
          if (!userData.user) return;

          const { error } = await supabase
            .from("budgets")
            .delete()
            .eq("id", id)
            .eq("user_id", userData.user.id);

          if (error) throw error;
          await fetchBudgets();
          toast.success("Budget deleted successfully", {
            description: "The budget has been removed from your account",
            icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          });
        } catch (error) {
          console.error("Error deleting budget:", error);
          toast.error("Failed to delete budget", {
            description: "An error occurred while trying to delete the budget",
            icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
          });
        } finally {
          setShowConfirmModal(false);
        }
      }
    });
    setShowConfirmModal(true);
  };



  const getBudgetStatusMessage = () => {
    const overBudgetCount = categorySpending.filter(cat => cat.percentage > 100).length;
    if (overBudgetCount === 0) {
      return "All categories are within budget";
    } else if (overBudgetCount === 1) {
      return "1 category is over budget";
    } else {
      return `${overBudgetCount} categories are over budget`;
    }
  };

  const handleReorderBudgets = async (reorderedBudgets: Budget[]) => {
    try {
      setBudgets(reorderedBudgets);
      
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;
      
      const updates = reorderedBudgets.map((budget, index) => ({
        id: budget.id,
        order: index,
      }));
      
      const { error } = await supabase
        .from("budgets")
        .upsert(updates, { onConflict: 'id' });
      
      if (error) {
        console.error("Error updating budget order:", error);
        toast.error("Failed to save order");
      }
    } catch (error) {
      console.error("Error handling budget reorder:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-sm text-muted-foreground">Loading your budget data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-6 lg:px-8 lg:py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 pb-6 border-b">
        <div className="flex items-center gap-4">
          <Logo size="lg" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Budget Planner
            </h1>
            <p className="text-muted-foreground mt-1">
              Set budgets and track your spending by category
            </p>
          </div>
        </div>
        
        {/* Mobile Add Budget Button */}
        <div className="md:hidden">
          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            size="lg"
            className="w-full h-12 gap-2"
          >
            <Plus className="h-5 w-5" />
            Add New Budget
          </Button>
        </div>
        
        {/* Desktop button */}
        <div className="hidden md:block">
          <Button 
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
            className="flex items-center gap-2"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? "Cancel" : "New Budget"}
          </Button>
        </div>
      </div>



      {/* Show form errors in a more visible way */}
      <AnimatePresence>
        {formError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-md bg-red-50 dark:bg-red-900/20 p-3 sm:p-4 mb-4 sm:mb-6 border border-red-200 dark:border-red-800"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-500" aria-hidden="true" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                  {formError}
                </h3>
              </div>
              <div className="ml-auto pl-3">
                <div className="-mx-1.5 -my-1.5">
                  <button
                    type="button"
                    onClick={() => setFormError(null)}
                    className="inline-flex rounded-md p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <span className="sr-only">Dismiss</span>
                    <X className="h-5 w-5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Total Budget Card */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Budget</h3>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(budgets.reduce((sum, budget) => sum + budget.amount, 0))}
              </p>
              <div className="mt-2 text-xs text-muted-foreground">
                {budgets.length} budget{budgets.length !== 1 ? 's' : ''} set
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>

        {/* Total Spent Card */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Spent</h3>
              <p className="text-2xl font-bold text-red-500">
                {formatCurrency(categorySpending.reduce((sum, cat) => sum + cat.spent, 0))}
              </p>
              <div className="mt-2 text-xs text-muted-foreground">
                Across {categorySpending.length} categor{categorySpending.length !== 1 ? 'ies' : 'y'}
              </div>
            </div>
            <div className="h-10 w-10 rounded-lg bg-red-500/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-red-500" />
            </div>
          </div>
        </div>

        {/* Budget Status Card */}
        <div className="rounded-lg border bg-card p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
              <p className={`text-lg font-bold ${
                categorySpending.some(cat => cat.percentage > 100) 
                  ? 'text-red-500' 
                  : 'text-emerald-500'
              }`}>
                {getBudgetStatusMessage()}
              </p>
              <div className="mt-2 text-xs text-muted-foreground">
                {categorySpending.some(cat => cat.percentage > 90 && cat.percentage <= 100) 
                  ? `${categorySpending.filter(cat => cat.percentage > 90 && cat.percentage <= 100).length} approaching limit` 
                  : 'Your budgets are healthy'}
              </div>
            </div>
            <div className={`h-10 w-10 rounded-lg ${
              categorySpending.some(cat => cat.percentage > 100) 
                ? 'bg-red-500/10' 
                : 'bg-emerald-500/10'
            } flex items-center justify-center`}>
              {categorySpending.some(cat => cat.percentage > 100) ? (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              ) : (
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Budget Filters */}
      {budgets.length > 0 && (
        <div className="mb-6">
          <BudgetFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filter={budgetFilter}
            onFilterChange={setBudgetFilter}
            sortBy={sortBy}
            onSortChange={setSortBy}
            sortOrder={sortOrder}
            onSortOrderChange={setSortOrder}
            periodFilter={periodFilter}
            onPeriodFilterChange={setPeriodFilter}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            totalBudgets={budgets.length}
            filteredCount={filteredAndSortedData.budgets.length}
          />
        </div>
      )}

      {/* Budget form */}
      {showForm && (
        <div className="mb-6">
          <form onSubmit={handleSubmit} className="rounded-lg border bg-card p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold">
                  {isEditing ? "Edit Budget" : "Create New Budget"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {isEditing ? "Update your budget settings" : "Set a new budget for a category"}
                </p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
            </div>
              
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <label htmlFor="category_id" className="block text-sm font-medium">
                  Category
                </label>
                <div className="relative">
                  <select
                    id="category_id"
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    disabled={formLoading || !hasExpenseCategories}
                  >
                    <option value="">Select a category</option>
                    {categories
                      .filter(c => c.type !== "income")
                      .map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
                {!hasExpenseCategories && (
                  <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    No expense categories available. Please create a category first.
                  </p>
                )}
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Budget Amount
                </label>
                <ValidatedInput
                  id="amount"
                  name="amount"
                  type="text"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="0.00"
                  prefix="$"
                  disabled={formLoading}
                  validationFn={validateAmount}
                  className="rounded-lg border border-input bg-background px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="period" className="block text-sm font-medium">
                  Budget Period
                </label>
                <div className="relative">
                  <select
                    id="period"
                    name="period"
                    value={formData.period}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-input bg-background px-3 py-2 appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    disabled={formLoading}
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>
              
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-3 mt-6 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowForm(false);
                  resetForm();
                }}
                disabled={formLoading}
                className="w-full mt-3 sm:mt-0 sm:w-auto"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={formLoading}
                className="w-full sm:w-auto flex items-center justify-center"
              >
                {formLoading ? (
                  <>
                    <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-background border-t-transparent"></div>
                    {isEditing ? "Updating..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    {isEditing ? "Update Budget" : "Save Budget"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Budget Progress */}
      <div className="rounded-lg border bg-card shadow-sm overflow-hidden mb-8">
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Budget Progress</h2>
              <p className="text-muted-foreground text-sm mt-1">
                Track your spending against category budgets
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
          </div>
        </div>
        
        {filteredAndSortedData.spending.length > 0 ? (
          <SortableBudgetList
            budgets={filteredAndSortedData.budgets}
            categorySpending={filteredAndSortedData.spending}
            onReorder={handleReorderBudgets}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : budgets.length > 0 ? (
          <div className="p-8 text-center">
            <div className="rounded-full bg-muted h-12 w-12 flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No budgets match your filters</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or filters to see more results
            </p>
            <Button 
              onClick={() => {
                setSearchTerm('');
                setBudgetFilter('all');
                setPeriodFilter('all');
              }} 
              variant="outline"
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <div className="p-8 text-center">
            <div className="rounded-full bg-muted h-12 w-12 flex items-center justify-center mx-auto mb-4">
              <DollarSign className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No budgets set yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by creating your first budget to track your spending
            </p>
            {!showForm && (
              <Button 
                onClick={() => setShowForm(true)} 
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" /> Add Your First Budget
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Confirmation modal */}
      {showConfirmModal && confirmAction && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className="bg-card rounded-lg shadow-lg max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start mb-4">
              <div className="bg-primary/10 rounded-full p-2 mr-3">
                <Info className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-medium mb-1">{confirmAction.title}</h3>
                <p className="text-muted-foreground">{confirmAction.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={() => confirmAction.action()}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      )}


      {/* Mobile sticky add button */}
      {!showForm && (
        <div className="fixed bottom-6 right-6 md:hidden">
          <Button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            size="lg"
            className="h-14 w-14 rounded-full shadow-lg"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
} 
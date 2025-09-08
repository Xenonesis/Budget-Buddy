"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  Search, 
  X, 
  SortAsc, 
  SortDesc, 
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { BudgetFilter } from '../types';

interface BudgetFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filter: BudgetFilter;
  onFilterChange: (filter: BudgetFilter) => void;
  sortBy: 'name' | 'amount' | 'spent' | 'percentage';
  onSortChange: (sort: 'name' | 'amount' | 'spent' | 'percentage') => void;
  sortOrder: 'asc' | 'desc';
  onSortOrderChange: (order: 'asc' | 'desc') => void;
  periodFilter: 'all' | 'monthly' | 'weekly' | 'yearly';
  onPeriodFilterChange: (period: 'all' | 'monthly' | 'weekly' | 'yearly') => void;
  showFilters: boolean;
  onToggleFilters: () => void;
  totalBudgets: number;
  filteredCount: number;
}

export function BudgetFilters({
  searchTerm,
  onSearchChange,
  filter,
  onFilterChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  periodFilter,
  onPeriodFilterChange,
  showFilters,
  onToggleFilters,
  totalBudgets,
  filteredCount
}: BudgetFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const filterOptions = [
    { value: 'all' as const, label: 'All Budgets', icon: DollarSign, color: 'bg-blue-500/10 text-blue-600' },
    { value: 'over-budget' as const, label: 'Over Budget', icon: AlertTriangle, color: 'bg-red-500/10 text-red-600' },
    { value: 'under-budget' as const, label: 'Under Budget', icon: CheckCircle, color: 'bg-green-500/10 text-green-600' },
  ];

  const sortOptions = [
    { value: 'name' as const, label: 'Category Name' },
    { value: 'amount' as const, label: 'Budget Amount' },
    { value: 'spent' as const, label: 'Amount Spent' },
    { value: 'percentage' as const, label: 'Usage Percentage' },
  ];

  const periodOptions = [
    { value: 'all' as const, label: 'All Periods' },
    { value: 'monthly' as const, label: 'Monthly' },
    { value: 'weekly' as const, label: 'Weekly' },
    { value: 'yearly' as const, label: 'Yearly' },
  ];

  const activeFiltersCount = [
    searchTerm.length > 0,
    filter !== 'all',
    periodFilter !== 'all',
    sortBy !== 'name' || sortOrder !== 'asc'
  ].filter(Boolean).length;

  const clearAllFilters = () => {
    onSearchChange('');
    onFilterChange('all');
    onPeriodFilterChange('all');
    onSortChange('name');
    onSortOrderChange('asc');
  };

  return (
    <div className="space-y-4">
      {/* Main Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search budgets by category..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-11 bg-background/50 border-border/50 focus:bg-background focus:border-primary/50 transition-all duration-200"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted"
              onClick={() => onSearchChange('')}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex gap-2">
          {filterOptions.map((option) => {
            const Icon = option.icon;
            const isActive = filter === option.value;
            return (
              <Button
                key={option.value}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={`h-11 px-3 transition-all duration-200 ${
                  isActive 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'hover:bg-muted border-border/50'
                }`}
                onClick={() => onFilterChange(option.value)}
              >
                <Icon className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">{option.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Advanced Filters Toggle */}
        <Button
          variant="outline"
          size="sm"
          className="h-11 px-3 border-border/50 hover:bg-muted transition-all duration-200"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Filter className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Filters</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 text-xs">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Advanced Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm text-foreground">Advanced Filters</h3>
                {activeFiltersCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllFilters}
                    className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear All
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Period Filter */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Period
                  </label>
                  <select
                    value={periodFilter}
                    onChange={(e) => onPeriodFilterChange(e.target.value as any)}
                    className="w-full h-9 px-3 rounded-md border border-border/50 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                  >
                    {periodOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => onSortChange(e.target.value as any)}
                    className="w-full h-9 px-3 rounded-md border border-border/50 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort Order */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    Order
                  </label>
                  <div className="flex rounded-md border border-border/50 overflow-hidden">
                    <Button
                      variant={sortOrder === 'asc' ? 'default' : 'ghost'}
                      size="sm"
                      className="flex-1 h-9 rounded-none border-0"
                      onClick={() => onSortOrderChange('asc')}
                    >
                      <SortAsc className="h-3 w-3 mr-1" />
                      Asc
                    </Button>
                    <Button
                      variant={sortOrder === 'desc' ? 'default' : 'ghost'}
                      size="sm"
                      className="flex-1 h-9 rounded-none border-0 border-l border-border/50"
                      onClick={() => onSortOrderChange('desc')}
                    >
                      <SortDesc className="h-3 w-3 mr-1" />
                      Desc
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Summary */}
      {(searchTerm || filter !== 'all' || periodFilter !== 'all') && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between text-sm text-muted-foreground bg-muted/30 rounded-lg px-3 py-2"
        >
          <span>
            Showing {filteredCount} of {totalBudgets} budget{totalBudgets !== 1 ? 's' : ''}
          </span>
          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="h-7 px-2 text-xs hover:text-foreground"
            >
              Clear filters
            </Button>
          )}
        </motion.div>
      )}
    </div>
  );
}
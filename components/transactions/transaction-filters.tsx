import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Filter,
  List,
  LayoutGrid,
  Search,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Clock,
  X,
  ChevronDown,
  SlidersHorizontal,
} from 'lucide-react';

interface DateRange {
  start: string;
  end: string;
}

interface TransactionFiltersProps {
  filterType: string;
  setFilterType: (type: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  dateRange: DateRange;
  setDateRange: (range: DateRange) => void;
  viewMode: 'table' | 'card';
  setViewMode: (mode: 'table' | 'card') => void;
}

export const TransactionFilters: React.FC<TransactionFiltersProps> = ({
  filterType,
  setFilterType,
  searchTerm,
  setSearchTerm,
  dateRange,
  setDateRange,
  viewMode,
  setViewMode,
}) => {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleQuickFilter = (type: 'today' | 'week' | 'month' | 'year' | 'clear') => {
    const today = new Date().toISOString().split('T')[0];

    switch (type) {
      case 'today':
        setDateRange({ start: today, end: today });
        break;
      case 'week': {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        setDateRange({
          start: startOfWeek.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0],
        });
        break;
      }
      case 'month': {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        setDateRange({
          start: startOfMonth.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0],
        });
        break;
      }
      case 'year': {
        const today = new Date();
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        setDateRange({
          start: startOfYear.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0],
        });
        break;
      }
      case 'clear':
        setDateRange({ start: '', end: '' });
        setSearchTerm('');
        setFilterType('all');
        break;
    }
  };

  // Calculate active filters count
  const activeFiltersCount = [
    filterType !== 'all',
    searchTerm !== '',
    dateRange.start !== '' || dateRange.end !== '',
  ].filter(Boolean).length;

  // Get quick filter button variant
  const getQuickFilterVariant = (type: 'today' | 'week' | 'month' | 'year') => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    switch (type) {
      case 'today':
        return dateRange.start === todayStr && dateRange.end === todayStr ? 'default' : 'outline';
      case 'week': {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const weekStart = startOfWeek.toISOString().split('T')[0];
        return dateRange.start === weekStart && dateRange.end === todayStr ? 'default' : 'outline';
      }
      case 'month': {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthStart = startOfMonth.toISOString().split('T')[0];
        return dateRange.start === monthStart && dateRange.end === todayStr ? 'default' : 'outline';
      }
      case 'year': {
        const startOfYear = new Date(today.getFullYear(), 0, 1);
        const yearStart = startOfYear.toISOString().split('T')[0];
        return dateRange.start === yearStart && dateRange.end === todayStr ? 'default' : 'outline';
      }
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Enhanced Search Bar */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
          <Search className="w-5 h-5 text-muted-foreground" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-12 py-3 text-base bg-gradient-to-r from-background to-muted/20 border border-border/50 rounded-2xl shadow-sm backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:shadow-lg placeholder:text-muted-foreground/60"
          placeholder="Search transactions, descriptions, or categories..."
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 flex items-center pr-4 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick Filters with Icons */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Quick filters:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={getQuickFilterVariant('today')}
            size="sm"
            onClick={() => handleQuickFilter('today')}
            className="h-8 px-3 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105"
          >
            <Calendar className="w-3 h-3 mr-1" />
            Today
          </Button>
          <Button
            variant={getQuickFilterVariant('week')}
            size="sm"
            onClick={() => handleQuickFilter('week')}
            className="h-8 px-3 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105"
          >
            This Week
          </Button>
          <Button
            variant={getQuickFilterVariant('month')}
            size="sm"
            onClick={() => handleQuickFilter('month')}
            className="h-8 px-3 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105"
          >
            This Month
          </Button>
          <Button
            variant={getQuickFilterVariant('year')}
            size="sm"
            onClick={() => handleQuickFilter('year')}
            className="h-8 px-3 rounded-full text-xs font-medium transition-all duration-200 hover:scale-105"
          >
            This Year
          </Button>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleQuickFilter('clear')}
              className="h-8 px-3 rounded-full text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all duration-200"
            >
              <X className="w-3 h-3 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      <div className="bg-gradient-to-br from-card/80 via-card/60 to-muted/20 rounded-2xl border border-border/50 shadow-lg backdrop-blur-sm overflow-hidden">
        <Collapsible open={filtersOpen} onOpenChange={setFiltersOpen}>
          <div className="p-4 bg-gradient-to-r from-muted/30 to-muted/10 border-b border-border/50">
            <div className="flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="p-2 -ml-2 flex items-center gap-3 hover:bg-muted/50 rounded-xl transition-all duration-200"
                >
                  <div className="p-1 bg-primary/10 rounded-lg">
                    <SlidersHorizontal className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-foreground">Advanced Filters</span>
                    {activeFiltersCount > 0 && (
                      <Badge variant="default" className="h-5 px-2 text-xs font-bold bg-primary/90">
                        {activeFiltersCount}
                      </Badge>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${
                      filtersOpen ? 'rotate-180' : ''
                    }`}
                  />
                </Button>
              </CollapsibleTrigger>

              {/* View Mode Selector */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground mr-2">View:</span>
                <div className="flex bg-muted/30 rounded-xl p-1 border border-border/30">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={viewMode === 'table' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('table')}
                          className="h-8 px-3 rounded-lg text-xs transition-all duration-200"
                        >
                          <List className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Table view</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>

                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant={viewMode === 'card' ? 'default' : 'ghost'}
                          size="sm"
                          onClick={() => setViewMode('card')}
                          className="h-8 px-3 rounded-lg text-xs transition-all duration-200"
                        >
                          <LayoutGrid className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Card view</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </div>
          </div>

          <CollapsibleContent className="data-[state=open]:animate-in data-[state=open]:slide-in-from-top-2 data-[state=closed]:animate-out data-[state=closed]:slide-out-to-top-2">
            <div className="p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Transaction Type Filter */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <label htmlFor="filter-type" className="text-sm font-semibold text-foreground">
                      Transaction Type
                    </label>
                  </div>
                  <div className="relative">
                    <select
                      id="filter-type"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full appearance-none rounded-xl border border-border/50 bg-gradient-to-r from-background to-muted/20 px-4 py-3 pr-10 text-sm font-medium backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:shadow-lg"
                    >
                      <option value="all">All Types</option>
                      <option value="income">Income Only</option>
                      <option value="expense">Expenses Only</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      {filterType === 'income' ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : filterType === 'expense' ? (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Date Range Filter */}
                <div className="space-y-3 sm:col-span-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-primary" />
                    <label className="text-sm font-semibold text-foreground">
                      Custom Date Range
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="relative">
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="w-full rounded-xl border border-border/50 bg-gradient-to-r from-background to-muted/20 px-4 py-3 text-sm font-medium backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:shadow-lg"
                        placeholder="Start date"
                      />
                      <div className="absolute -bottom-6 left-0 text-xs text-muted-foreground">
                        From
                      </div>
                    </div>
                    <div className="relative">
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="w-full rounded-xl border border-border/50 bg-gradient-to-r from-background to-muted/20 px-4 py-3 text-sm font-medium backdrop-blur-sm transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary/50 focus:shadow-lg"
                        placeholder="End date"
                      />
                      <div className="absolute -bottom-6 left-0 text-xs text-muted-foreground">
                        To
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Filters Summary */}
              {activeFiltersCount > 0 && (
                <div className="mt-6 pt-4 border-t border-border/30">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-sm font-medium text-muted-foreground">
                      Active filters:
                    </span>
                    {filterType !== 'all' && (
                      <Badge
                        variant="secondary"
                        className="h-7 px-3 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                      >
                        {filterType === 'income' ? 'Income' : 'Expenses'}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-1 h-4 w-4 p-0 hover:bg-blue-200 dark:hover:bg-blue-800/50 rounded-full"
                          onClick={() => setFilterType('all')}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    )}
                    {searchTerm && (
                      <Badge
                        variant="secondary"
                        className="h-7 px-3 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                      >
                        Search: &quot;{searchTerm.substring(0, 15)}
                        {searchTerm.length > 15 ? '...' : ''}&quot;
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-1 h-4 w-4 p-0 hover:bg-green-200 dark:hover:bg-green-800/50 rounded-full"
                          onClick={() => setSearchTerm('')}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    )}
                    {(dateRange.start || dateRange.end) && (
                      <Badge
                        variant="secondary"
                        className="h-7 px-3 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
                      >
                        {dateRange.start || '...'} → {dateRange.end || '...'}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="ml-1 h-4 w-4 p-0 hover:bg-purple-200 dark:hover:bg-purple-800/50 rounded-full"
                          onClick={() => setDateRange({ start: '', end: '' })}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
};

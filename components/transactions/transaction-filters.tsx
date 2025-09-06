import React from 'react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Filter, List, LayoutGrid, Search } from 'lucide-react';

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
  const handleQuickFilter = (type: 'today' | 'week' | 'month' | 'clear') => {
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
          end: today.toISOString().split('T')[0]
        });
        break;
      }
      case 'month': {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        setDateRange({
          start: startOfMonth.toISOString().split('T')[0],
          end: today.toISOString().split('T')[0]
        });
        break;
      }
      case 'clear':
        setDateRange({ start: "", end: "" });
        setSearchTerm("");
        setFilterType("all");
        break;
    }
  };

  return (
    <>
      {/* Quick Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickFilter('today')}
          className="h-9"
        >
          Today
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickFilter('week')}
          className="h-9"
        >
          This Week
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickFilter('month')}
          className="h-9"
        >
          This Month
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleQuickFilter('clear')}
          className="h-9 ml-auto"
        >
          Clear Filters
        </Button>
      </div>

      {/* Filters */}
      <div className="mb-6 rounded-lg border bg-card shadow-sm overflow-hidden">
        <Collapsible>
          <div className="p-4 border-b flex items-center justify-between">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="p-2 -ml-2 flex items-center gap-2"
                aria-label="Toggle filters visibility"
              >
                <Filter size={16} />
                <span>Filters</span>
                <div className="transition-transform rotate-0 group-data-[state=open]:rotate-180">
                  ▼
                </div>
              </Button>
            </CollapsibleTrigger>

            <div className="flex items-center gap-3">
              <div className="flex border rounded-md">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={viewMode === "table" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("table")}
                        className="rounded-r-none h-9 px-3"
                        aria-label="Table view"
                      >
                        <List size={18} />
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
                        variant={viewMode === "card" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("card")}
                        className="rounded-l-none h-9 px-3"
                        aria-label="Card view"
                      >
                        <LayoutGrid size={18} />
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

          <CollapsibleContent>
            <div className="p-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                <div>
                  <label htmlFor="filter-type" className="mb-2 block text-sm font-medium">Type</label>
                  <select
                    id="filter-type"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2.5"
                    aria-label="Filter by transaction type"
                  >
                    <option value="all">All Types</option>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="search-term" className="mb-2 block text-sm font-medium">Search</label>
                  <div className="relative">
                    <input
                      id="search-term"
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2.5 pr-10"
                      placeholder="Search transactions..."
                      aria-label="Search transactions"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <Search size={16} className="text-gray-400" />
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="date-range" className="mb-2 block text-sm font-medium">Date Range</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, start: e.target.value })
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      aria-label="Start date"
                    />
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) =>
                        setDateRange({ ...dateRange, end: e.target.value })
                      }
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                      aria-label="End date"
                    />
                  </div>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </>
  );
};
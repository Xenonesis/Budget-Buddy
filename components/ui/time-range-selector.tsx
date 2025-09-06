"use client";

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export type TimeRange = 'today' | 'yesterday' | 'this-week' | 'last-week' | 'this-month' | 'last-month' | 'this-year' | 'last-year' | 'custom';

export interface DateRange {
  from: Date;
  to: Date;
}

export interface TimeRangeSelectorProps {
  value: TimeRange;
  customRange?: DateRange;
  onChange: (range: TimeRange, customRange?: DateRange) => void;
  className?: string;
}

const TIME_RANGE_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'yesterday', label: 'Yesterday' },
  { value: 'this-week', label: 'This Week' },
  { value: 'last-week', label: 'Last Week' },
  { value: 'this-month', label: 'This Month' },
  { value: 'last-month', label: 'Last Month' },
  { value: 'this-year', label: 'This Year' },
  { value: 'last-year', label: 'Last Year' },
  { value: 'custom', label: 'Custom Range' },
] as const;

export function TimeRangeSelector({
  value,
  customRange,
  onChange,
  className
}: TimeRangeSelectorProps) {
  const handleRangeChange = (newValue: TimeRange) => {
    if (newValue === 'custom') {
      // For now, just set to this month if custom is selected
      onChange('this-month');
    } else {
      onChange(newValue);
    }
  };

  const getDisplayLabel = () => {
    if (value === 'custom' && customRange) {
      return `${format(customRange.from, 'MMM dd')} - ${format(customRange.to, 'MMM dd, yyyy')}`;
    }
    return TIME_RANGE_OPTIONS.find(option => option.value === value)?.label || 'Select Range';
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Clock className="h-4 w-4 text-muted-foreground" />
      <Select value={value} onValueChange={handleRangeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select time range">
            {getDisplayLabel()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {TIME_RANGE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
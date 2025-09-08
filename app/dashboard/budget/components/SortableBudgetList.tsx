"use client";

import { useState } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Budget, BudgetFilter, CategorySpending } from '../types';
import { formatCurrency } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, AlertTriangle, CheckCircle, GripVertical, Filter, TrendingUp, TrendingDown, Target, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

interface SortableBudgetItemProps {
  readonly budget: Budget;
  readonly categorySpending: CategorySpending | undefined;
  readonly onEdit: (budget: Budget) => void;
  readonly onDelete: (id: string) => void;
}

function SortableBudgetItem({ budget, categorySpending, onEdit, onDelete }: SortableBudgetItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: budget.id,
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const percentage = categorySpending?.percentage || 0;

  const getProgressBarWidth = (percentage: number) => {
    return `${Math.min(percentage, 100)}%`;
  };

  const getProgressBarColor = (percentage: number) => {
    if (percentage > 100) return "bg-gradient-to-r from-red-500 to-red-600";
    if (percentage > 85) return "bg-gradient-to-r from-amber-500 to-orange-500";
    if (percentage > 70) return "bg-gradient-to-r from-yellow-500 to-amber-500";
    return "bg-gradient-to-r from-emerald-500 to-green-500";
  };

  const getProgressBarGlow = (percentage: number) => {
    if (percentage > 100) return "shadow-red-500/25";
    if (percentage > 85) return "shadow-amber-500/25";
    if (percentage > 70) return "shadow-yellow-500/25";
    return "shadow-emerald-500/25";
  };

  const getMilestoneMarkers = (percentage: number) => {
    const milestones = [25, 50, 75, 90, 100];
    return milestones.filter((milestone: number) => milestone <= percentage);
  };

  const getSpendingVelocity = (percentage: number, daysInPeriod: number = 30) => {
    const dailyRate = percentage / daysInPeriod;
    if (dailyRate > 2) return { level: 'high', color: 'text-red-500', icon: '🚀' };
    if (dailyRate > 1) return { level: 'medium', color: 'text-amber-500', icon: '⚡' };
    return { level: 'low', color: 'text-emerald-500', icon: '🐌' };
  };

  const getBudgetHealth = (percentage: number) => {
    if (percentage > 100) return { status: 'over', color: 'text-red-500', bgColor: 'bg-red-50 dark:bg-red-900/20' };
    if (percentage > 90) return { status: 'warning', color: 'text-amber-500', bgColor: 'bg-amber-50 dark:bg-amber-900/20' };
    if (percentage > 75) return { status: 'caution', color: 'text-yellow-500', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' };
    return { status: 'good', color: 'text-emerald-500', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20' };
  };

  const velocity = getSpendingVelocity(percentage);
  const health = getBudgetHealth(percentage);

  const getCategoryStatusIcon = (percentage: number) => {
    if (percentage > 100) {
      return <AlertTriangle className="h-4 w-4 text-red-500" />;
    } else if (percentage > 85) {
      return <AlertTriangle className="h-4 w-4 text-amber-500" />;
    } else {
      return <CheckCircle className="h-4 w-4 text-emerald-500" />;
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`bg-card border rounded-lg mb-3 sm:mb-4 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 ${
        isDragging ? 'shadow-lg border-primary' : 'hover:border-primary/50'
      } group cursor-pointer`}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="p-3 sm:p-4 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className="flex items-center gap-2">
            <div
              {...attributes}
              {...listeners}
              className="touch-manipulation cursor-grab active:cursor-grabbing p-1.5 rounded hover:bg-muted"
              title="Drag to reorder"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </div>
            {getCategoryStatusIcon(percentage)}
            <h3 className="font-medium line-clamp-1">{budget.category_name}</h3>
            {categorySpending && (
              <div className="flex items-center gap-1 ml-2">
                <span className={`text-sm ${velocity.color}`}>{velocity.icon}</span>
                <span className="text-xs text-muted-foreground capitalize">{velocity.level}</span>
                <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${health.bgColor} ${health.color} ml-1`}>
                  {health.status}
                </div>
                {/* Trend indicator - simplified for now */}
                <div className="flex items-center ml-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 items-center mt-1 sm:mt-0">
            <div className="text-sm px-3 py-1 rounded-full bg-primary/10 text-primary whitespace-nowrap">
              {formatCurrency(budget.amount)} budget
            </div>
            {categorySpending && (
              <div className={`text-sm px-3 py-1 rounded-full whitespace-nowrap ${
                percentage > 100
                  ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                  : "bg-muted text-muted-foreground"
              }`}>
                {formatCurrency(categorySpending.spent)} spent
              </div>
            )}
            {categorySpending && (
              <span
                className={`text-sm font-medium ml-1 whitespace-nowrap ${
                  (() => {
                    if (percentage > 100) return "text-red-600 dark:text-red-400";
                    if (percentage > 85) return "text-amber-600 dark:text-amber-400";
                    return "text-emerald-600 dark:text-emerald-400";
                  })()
                }`}
              >
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        </div>

        {categorySpending && (
          <div className="relative h-3 bg-muted rounded-full overflow-hidden mb-3 shadow-inner">
            <motion.div
              className={`h-full ${getProgressBarColor(percentage)} shadow-lg ${getProgressBarGlow(percentage)}`}
              initial={{ width: 0 }}
              animate={{ width: getProgressBarWidth(percentage) }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            />
            
            {/* Milestone markers */}
            {getMilestoneMarkers(percentage).map((milestone) => (
              <div
                key={milestone}
                className="absolute top-0 h-full w-1 bg-white/80 rounded-full shadow-sm"
                style={{ left: `${milestone}%` }}
              />
            ))}
            
            {/* Current position indicator */}
            {percentage > 0 && (
              <motion.div
                className="absolute top-0 h-full w-1 bg-white rounded-full shadow-md"
                initial={{ left: 0 }}
                animate={{ left: getProgressBarWidth(percentage) }}
                transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              />
            )}
          </div>
        )}

        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <div>
            {categorySpending ? (
              (() => {
                const remaining = budget.amount - (categorySpending?.spent || 0);
                const isOverBudget = percentage > 100;
                
                return isOverBudget ? (
                  <span className="text-red-600 dark:text-red-400">
                    {formatCurrency((categorySpending?.spent || 0) - budget.amount)} over budget
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(remaining)} remaining
                  </span>
                );
              })()
            ) : (
              <span className="text-muted-foreground">No spending tracked</span>
            )}
          </div>
          
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(budget)}
              className="h-10 w-10 p-0 touch-manipulation opacity-60 group-hover:opacity-100 transition-opacity hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600"
              aria-label={`Edit budget for ${budget.category_name}`}
              title={`Edit budget for ${budget.category_name}`}
            >
              <Pencil className="h-5 w-5" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(budget.id)}
              className="h-10 w-10 p-0 text-red-500 hover:text-red-600 opacity-60 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-900/20 touch-manipulation"
              aria-label={`Delete budget for ${budget.category_name}`}
              title={`Delete budget for ${budget.category_name}`}
            >
              <Trash2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

interface SortableBudgetListProps {
  readonly budgets: readonly Budget[];
  readonly categorySpending: readonly CategorySpending[];
  readonly onReorder: (newOrder: Budget[]) => void;
  readonly onEdit: (budget: Budget) => void;
  readonly onDelete: (id: string) => void;
}

export function SortableBudgetList({ budgets, categorySpending, onReorder, onEdit, onDelete }: SortableBudgetListProps) {
  const [activeFilter, setActiveFilter] = useState<BudgetFilter>('all');
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // 5px movement before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = budgets.findIndex((budget) => budget.id === active.id);
      const newIndex = budgets.findIndex((budget) => budget.id === over.id);
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newBudgets = [...budgets]; // Create a mutable copy
        const [movedItem] = newBudgets.splice(oldIndex, 1);
        newBudgets.splice(newIndex, 0, movedItem);
        // Update with new order
        onReorder(newBudgets);
      }
    }
  };

  // Filter the budgets based on the active filter
  const filteredBudgets = budgets.filter(budget => {
    if (activeFilter === 'all') return true;
    
    const spendingForBudget = categorySpending.find(cat => cat.category_id === budget.category_id);
    
    if (!spendingForBudget) return activeFilter === 'under-budget'; // If no spending, count as under budget
    
    if (activeFilter === 'over-budget') {
      return spendingForBudget.percentage > 100;
    } else if (activeFilter === 'under-budget') {
      return spendingForBudget.percentage <= 100;
    }
    
    return true;
  });

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2 sm:mb-4 px-3 sm:px-4">
        <h3 className="text-base sm:text-lg font-medium">Budget Progress</h3>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div className="flex border rounded-md overflow-hidden">
            <Button 
              variant={activeFilter === 'all' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveFilter('all')}
              className="h-9 rounded-none px-2 text-xs sm:text-sm"
            >
              All
            </Button>
            <Button 
              variant={activeFilter === 'over-budget' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveFilter('over-budget')}
              className="h-9 rounded-none px-2 text-xs sm:text-sm"
            >
              Over Budget
            </Button>
            <Button 
              variant={activeFilter === 'under-budget' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveFilter('under-budget')}
              className="h-9 rounded-none px-2 text-xs sm:text-sm"
            >
              Under Budget
            </Button>
          </div>
        </div>
      </div>

      {/* Display empty state if no budgets match the filter */}
      {filteredBudgets.length === 0 ? (
        <div className="text-center p-6">
          <div className="h-12 w-12 bg-muted rounded-full mx-auto flex items-center justify-center mb-3">
            <Filter className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-base font-medium mb-1">No matching budgets</h3>
          <p className="text-muted-foreground text-sm">
            Try changing your filter selection
          </p>
        </div>
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredBudgets.map(b => b.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="px-3 sm:px-4 pb-3 sm:pb-4">
              {filteredBudgets.map((budget) => (
                <SortableBudgetItem
                  key={budget.id}
                  budget={budget}
                  categorySpending={categorySpending.find(cat => cat.category_id === budget.category_id)}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
} 
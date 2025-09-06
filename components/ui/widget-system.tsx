"use client";

import React, { useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  GripVertical, 
  Eye, 
  EyeOff, 
  Plus,
  X,
  BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Import interfaces from store to avoid circular dependency
import { Widget, WidgetLayout } from '@/lib/store';

// Import all widget components
import {
  QuickStatsWidget,
  BudgetProgressWidget,
  RecentTransactionsWidget,
  MonthlySummaryWidget,
  CategoryBreakdownWidget,
  SimpleStatsWidget,
  SimpleBudgetWidget,
  EnhancedStatsWidget,
  EnhancedBudgetWidget
} from '@/components/ui/dashboard-widgets';

// Widget type to component mapping
const WIDGET_COMPONENT_MAP: Record<string, React.ComponentType<any>> = {
  'quick-stats': QuickStatsWidget,
  'budget-progress': BudgetProgressWidget,
  'recent-transactions': RecentTransactionsWidget,
  'monthly-summary': MonthlySummaryWidget,
  'category-breakdown': CategoryBreakdownWidget,
  'simple-stats': SimpleStatsWidget,
  'simple-budget': SimpleBudgetWidget,
  'enhanced-stats': EnhancedStatsWidget,
  'enhanced-budget': EnhancedBudgetWidget,
};

interface WidgetSystemProps {
  layout: WidgetLayout;
  onLayoutChange: (layout: WidgetLayout) => void;
  isEditMode: boolean;
  onEditModeChange: (editMode: boolean) => void;
  availableWidgets: Widget[];
  widgetData?: any;
}

export function WidgetSystem({
  layout,
  onLayoutChange,
  isEditMode,
  onEditModeChange,
  availableWidgets,
  widgetData = {}
}: WidgetSystemProps) {
  const [draggedWidget, setDraggedWidget] = useState<string | null>(null);

  const handleDragEnd = useCallback((result: DropResult) => {
    setDraggedWidget(null);
    
    if (!result.destination) return;

    const items = Array.from(layout.widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index
    }));

    onLayoutChange({
      ...layout,
      widgets: updatedItems
    });
  }, [layout, onLayoutChange]);

  const handleDragStart = useCallback((start: any) => {
    setDraggedWidget(start.draggableId);
  }, []);

  const toggleWidgetVisibility = useCallback((widgetId: string) => {
    const updatedWidgets = layout.widgets.map(widget =>
      widget.id === widgetId
        ? { ...widget, isVisible: !widget.isVisible }
        : widget
    );

    onLayoutChange({
      ...layout,
      widgets: updatedWidgets
    });
  }, [layout, onLayoutChange]);

  const addWidget = useCallback((widgetType: string) => {
    const availableWidget = availableWidgets.find(w => w.type === widgetType);
    if (!availableWidget) return;

    const newWidget: Widget = {
      ...availableWidget,
      id: `${widgetType}-${Date.now()}`,
      position: layout.widgets.length,
      isVisible: true
    };

    onLayoutChange({
      ...layout,
      widgets: [...layout.widgets, newWidget]
    });
  }, [availableWidgets, layout, onLayoutChange]);

  const removeWidget = useCallback((widgetId: string) => {
    const updatedWidgets = layout.widgets
      .filter(widget => widget.id !== widgetId)
      .map((widget, index) => ({ ...widget, position: index }));

    onLayoutChange({
      ...layout,
      widgets: updatedWidgets
    });
  }, [layout, onLayoutChange]);

  const updateWidgetSize = useCallback((widgetId: string, size: 'small' | 'medium' | 'large') => {
    const updatedWidgets = layout.widgets.map(widget =>
      widget.id === widgetId
        ? { ...widget, size }
        : widget
    );

    onLayoutChange({
      ...layout,
      widgets: updatedWidgets
    });
  }, [layout, onLayoutChange]);

  const getWidgetGridClass = (size: 'small' | 'medium' | 'large') => {
    switch (size) {
      case 'small':
        return 'col-span-1';
      case 'medium':
        return 'col-span-1 md:col-span-2';
      case 'large':
        return 'col-span-1 md:col-span-2 lg:col-span-3';
      default:
        return 'col-span-1';
    }
  };

  const visibleWidgets = layout.widgets
    .filter(widget => widget.isVisible)
    .sort((a, b) => a.position - b.position);

  const hiddenWidgets = layout.widgets.filter(widget => !widget.isVisible);
  const unusedWidgets = availableWidgets.filter(
    available => !layout.widgets.some(widget => widget.type === available.type)
  );

  return (
    <div className="space-y-6">
      {/* Widget Management Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard Widgets</h2>
          <p className="text-muted-foreground">
            Customize your dashboard by adding, removing, and rearranging widgets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={isEditMode ? "default" : "outline"}
            onClick={() => onEditModeChange(!isEditMode)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            {isEditMode ? "Done Editing" : "Customize"}
          </Button>
        </div>
      </div>

      {/* Edit Mode Panel */}
      {isEditMode && (
        <Card className="border-dashed border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add Widgets
            </CardTitle>
            <CardDescription>
              Click on a widget below to add it to your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unusedWidgets.map((widget) => (
                <Card
                  key={widget.type}
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => addWidget(widget.type)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary">
                        {React.isValidElement(widget.icon) ? widget.icon : null}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{widget.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          {widget.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {hiddenWidgets.length > 0 && (
              <div className="mt-6">
                <h4 className="font-medium mb-3">Hidden Widgets</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {hiddenWidgets.map((widget) => (
                    <Card
                      key={widget.id}
                      className="cursor-pointer hover:bg-accent/50 transition-colors opacity-60"
                      onClick={() => toggleWidgetVisibility(widget.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-muted text-muted-foreground">
                            {React.isValidElement(widget.icon) ? widget.icon : null}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{widget.title}</h4>
                            <Badge variant="secondary" className="text-xs">
                              Hidden
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Widget Grid */}
      <DragDropContext onDragEnd={handleDragEnd} onDragStart={handleDragStart}>
        <Droppable droppableId="widgets" direction="horizontal">
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={cn(
                "grid gap-6 transition-colors",
                layout.columns === 1 && "grid-cols-1",
                layout.columns === 2 && "grid-cols-1 lg:grid-cols-2",
                layout.columns === 3 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
                layout.columns === 4 && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
                snapshot.isDraggingOver && "bg-accent/20 rounded-lg p-4"
              )}
            >
              {visibleWidgets.map((widget, index) => (
                <Draggable
                  key={widget.id}
                  draggableId={widget.id}
                  index={index}
                  isDragDisabled={!isEditMode}
                >
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={cn(
                        getWidgetGridClass(widget.size),
                        "transition-transform",
                        snapshot.isDragging && "rotate-2 scale-105 z-50",
                        draggedWidget === widget.id && "opacity-50"
                      )}
                    >
                      <Card className={cn(
                        "h-full relative group",
                        isEditMode && "ring-2 ring-primary/20",
                        snapshot.isDragging && "shadow-2xl ring-2 ring-primary"
                      )}>
                        {/* Edit Mode Controls */}
                        {isEditMode && (
                          <div className="absolute top-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => toggleWidgetVisibility(widget.id)}
                            >
                              {widget.isVisible ? (
                                <EyeOff className="h-4 w-4" />
                              ) : (
                                <Eye className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={() => removeWidget(widget.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <div
                              {...provided.dragHandleProps}
                              className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-accent"
                            >
                              <GripVertical className="h-4 w-4" />
                            </div>
                          </div>
                        )}

                        {/* Widget Size Controls */}
                        {isEditMode && (
                          <div className="absolute bottom-2 right-2 z-10 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant={widget.size === 'small' ? "default" : "ghost"}
                              className="h-6 w-6 p-0 text-xs"
                              onClick={() => updateWidgetSize(widget.id, 'small')}
                            >
                              S
                            </Button>
                            <Button
                              size="sm"
                              variant={widget.size === 'medium' ? "default" : "ghost"}
                              className="h-6 w-6 p-0 text-xs"
                              onClick={() => updateWidgetSize(widget.id, 'medium')}
                            >
                              M
                            </Button>
                            <Button
                              size="sm"
                              variant={widget.size === 'large' ? "default" : "ghost"}
                              className="h-6 w-6 p-0 text-xs"
                              onClick={() => updateWidgetSize(widget.id, 'large')}
                            >
                              L
                            </Button>
                          </div>
                        )}

                        {/* Widget Content */}
                        {(() => {
                          const WidgetComponent = widget.component || WIDGET_COMPONENT_MAP[widget.type];
                          if (WidgetComponent) {
                            return React.createElement(WidgetComponent, { data: widgetData });
                          } else {
                            return (
                              <div className="p-4 text-center text-muted-foreground">
                                Widget component not found: {widget.type}
                              </div>
                            );
                          }
                        })()}
                      </Card>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Empty State */}
      {visibleWidgets.length === 0 && (
        <Card className="border-dashed border-2 border-muted-foreground/20">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="p-4 rounded-full bg-muted/50 mb-4">
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">No widgets added yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Start customizing your dashboard by adding some widgets
            </p>
            <Button onClick={() => onEditModeChange(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Widgets
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Widget Icons - removed export as we're using direct imports now
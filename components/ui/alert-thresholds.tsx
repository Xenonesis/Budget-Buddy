"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';

export interface AlertThreshold {
  id: string;
  type: 'budget' | 'spending' | 'balance' | 'category';
  category?: string;
  threshold: number;
  condition: 'above' | 'below' | 'equals';
  enabled: boolean;
  frequency: 'immediate' | 'daily' | 'weekly';
}

export interface AlertThresholdsProps {
  thresholds: AlertThreshold[];
  onChange: (thresholds: AlertThreshold[]) => void;
  className?: string;
}

const ALERT_TYPES = [
  { value: 'budget', label: 'Budget Limit', icon: DollarSign },
  { value: 'spending', label: 'Spending Alert', icon: TrendingUp },
  { value: 'balance', label: 'Balance Warning', icon: AlertTriangle },
  { value: 'category', label: 'Category Spending', icon: Bell },
] as const;

const CONDITIONS = [
  { value: 'above', label: 'Above' },
  { value: 'below', label: 'Below' },
  { value: 'equals', label: 'Equals' },
] as const;

const FREQUENCIES = [
  { value: 'immediate', label: 'Immediate' },
  { value: 'daily', label: 'Daily Summary' },
  { value: 'weekly', label: 'Weekly Summary' },
] as const;

export function AlertThresholds({
  thresholds,
  onChange,
  className
}: AlertThresholdsProps) {
  const [newThreshold, setNewThreshold] = useState<Partial<AlertThreshold>>({
    type: 'budget',
    condition: 'above',
    enabled: true,
    frequency: 'immediate',
  });

  const addThreshold = () => {
    if (!newThreshold.type || !newThreshold.threshold) return;

    const threshold: AlertThreshold = {
      id: `alert-${Date.now()}`,
      type: newThreshold.type as AlertThreshold['type'],
      category: newThreshold.category,
      threshold: newThreshold.threshold,
      condition: newThreshold.condition as AlertThreshold['condition'],
      enabled: newThreshold.enabled ?? true,
      frequency: newThreshold.frequency as AlertThreshold['frequency'],
    };

    onChange([...thresholds, threshold]);
    setNewThreshold({
      type: 'budget',
      condition: 'above',
      enabled: true,
      frequency: 'immediate',
    });
  };

  const updateThreshold = (id: string, updates: Partial<AlertThreshold>) => {
    const updated = thresholds.map(threshold =>
      threshold.id === id ? { ...threshold, ...updates } : threshold
    );
    onChange(updated);
  };

  const removeThreshold = (id: string) => {
    onChange(thresholds.filter(threshold => threshold.id !== id));
  };

  const getTypeIcon = (type: AlertThreshold['type']) => {
    const typeConfig = ALERT_TYPES.find(t => t.value === type);
    const Icon = typeConfig?.icon || Bell;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Alert Thresholds
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Existing Thresholds */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Active Alerts</h4>
          {thresholds.length === 0 ? (
            <p className="text-sm text-muted-foreground">No alerts configured</p>
          ) : (
            <div className="space-y-3">
              {thresholds.map((threshold) => (
                <div
                  key={threshold.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      {getTypeIcon(threshold.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {ALERT_TYPES.find(t => t.value === threshold.type)?.label}
                        </span>
                        {threshold.category && (
                          <span className="text-xs text-muted-foreground">
                            ({threshold.category})
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Alert when {threshold.condition} ${threshold.threshold}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={threshold.enabled}
                      onCheckedChange={(enabled) =>
                        updateThreshold(threshold.id, { enabled })
                      }
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeThreshold(threshold.id)}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Threshold */}
        <div className="space-y-4 pt-4 border-t">
          <h4 className="text-sm font-medium">Add New Alert</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="alert-type">Alert Type</Label>
              <Select
                value={newThreshold.type}
                onValueChange={(type) => setNewThreshold({ ...newThreshold, type: type as AlertThreshold['type'] })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select alert type" />
                </SelectTrigger>
                <SelectContent>
                  {ALERT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex items-center gap-2">
                        <type.icon className="h-4 w-4" />
                        {type.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="threshold">Threshold Amount</Label>
              <Input
                id="threshold"
                type="number"
                placeholder="Enter amount"
                value={newThreshold.threshold || ''}
                onChange={(e) => setNewThreshold({
                  ...newThreshold,
                  threshold: parseFloat(e.target.value) || 0
                })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="condition">Condition</Label>
              <Select
                value={newThreshold.condition}
                onValueChange={(condition) => setNewThreshold({
                  ...newThreshold,
                  condition: condition as AlertThreshold['condition']
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select condition" />
                </SelectTrigger>
                <SelectContent>
                  {CONDITIONS.map((condition) => (
                    <SelectItem key={condition.value} value={condition.value}>
                      {condition.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={newThreshold.frequency}
                onValueChange={(frequency) => setNewThreshold({
                  ...newThreshold,
                  frequency: frequency as AlertThreshold['frequency']
                })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {FREQUENCIES.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {newThreshold.type === 'category' && (
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  placeholder="Enter category name"
                  value={newThreshold.category || ''}
                  onChange={(e) => setNewThreshold({
                    ...newThreshold,
                    category: e.target.value
                  })}
                />
              </div>
            )}
          </div>

          <Button
            onClick={addThreshold}
            disabled={!newThreshold.type || !newThreshold.threshold}
            className="w-full"
          >
            Add Alert Threshold
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
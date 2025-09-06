"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TimeRangeSelector } from '@/components/ui/time-range-selector';
import { Settings, Bell } from 'lucide-react';
import { Widget, WidgetSettings, WidgetAlertThreshold, TimeRange, DateRange } from '@/lib/store';

interface WidgetSettingsPanelProps {
  widget: Widget;
  onSettingsChange: (widgetId: string, settings: WidgetSettings) => void;
  onClose: () => void;
}

export function WidgetSettingsPanel({
  widget,
  onSettingsChange,
  onClose
}: WidgetSettingsPanelProps) {
  const [settings, setSettings] = useState<WidgetSettings>(widget.settings || {});
  const [newAlert, setNewAlert] = useState<Partial<WidgetAlertThreshold>>({
    type: 'budget',
    threshold: 0,
    condition: 'above',
    enabled: true
  });

  const handleTimeRangeChange = (range: TimeRange, customRange?: DateRange) => {
    const updatedSettings = {
      ...settings,
      timeRange: range,
      customDateRange: customRange
    };
    setSettings(updatedSettings);
  };

  const handleSettingChange = (key: keyof WidgetSettings, value: any) => {
    const updatedSettings = { ...settings, [key]: value };
    setSettings(updatedSettings);
  };

  const addAlertThreshold = () => {
    if (!newAlert.type || newAlert.threshold === undefined) return;

    const alertThreshold: WidgetAlertThreshold = {
      id: `alert-${Date.now()}`,
      type: newAlert.type as WidgetAlertThreshold['type'],
      threshold: newAlert.threshold,
      condition: newAlert.condition as WidgetAlertThreshold['condition'],
      enabled: newAlert.enabled || true,
      category: newAlert.category
    };

    const updatedSettings = {
      ...settings,
      alertThresholds: [...(settings.alertThresholds || []), alertThreshold]
    };
    setSettings(updatedSettings);

    // Reset form
    setNewAlert({
      type: 'budget',
      threshold: 0,
      condition: 'above',
      enabled: true
    });
  };

  const removeAlertThreshold = (alertId: string) => {
    const updatedSettings = {
      ...settings,
      alertThresholds: settings.alertThresholds?.filter(alert => alert.id !== alertId) || []
    };
    setSettings(updatedSettings);
  };

  const toggleAlertEnabled = (alertId: string) => {
    const updatedSettings = {
      ...settings,
      alertThresholds: settings.alertThresholds?.map(alert =>
        alert.id === alertId ? { ...alert, enabled: !alert.enabled } : alert
      ) || []
    };
    setSettings(updatedSettings);
  };

  const saveSettings = () => {
    onSettingsChange(widget.id, settings);
    onClose();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Widget Settings: {widget.title}
        </CardTitle>
        <CardDescription>
          Customize this widget's behavior and appearance
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="time">Time Range</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="display">Display</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="refresh-interval">Auto Refresh Interval (minutes)</Label>
              <Select
                value={settings.refreshInterval?.toString() || "0"}
                onValueChange={(value) => handleSettingChange('refreshInterval', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select refresh interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">No auto refresh</SelectItem>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="time" className="space-y-4">
            <div className="space-y-2">
              <Label>Widget Time Range</Label>
              <p className="text-sm text-muted-foreground">
                Set a specific time range for this widget (overrides global dashboard time range)
              </p>
              <TimeRangeSelector
                value={settings.timeRange || 'this-month'}
                customRange={settings.customDateRange}
                onChange={handleTimeRangeChange}
              />
            </div>
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Widget Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Set up alerts specific to this widget's data
                </p>
              </div>

              {/* Existing Alerts */}
              {settings.alertThresholds && settings.alertThresholds.length > 0 && (
                <div className="space-y-2">
                  <Label>Active Alerts</Label>
                  {settings.alertThresholds.map((alert) => (
                    <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={alert.enabled}
                          onCheckedChange={() => toggleAlertEnabled(alert.id)}
                        />
                        <div>
                          <p className="font-medium">
                            {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)} Alert
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {alert.condition} {alert.threshold}
                            {alert.category && ` in ${alert.category}`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAlertThreshold(alert.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Alert */}
              <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                <Label>Add New Alert</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="alert-type">Type</Label>
                    <Select
                      value={newAlert.type}
                      onValueChange={(value) => setNewAlert({ ...newAlert, type: value as WidgetAlertThreshold['type'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="budget">Budget</SelectItem>
                        <SelectItem value="spending">Spending</SelectItem>
                        <SelectItem value="balance">Balance</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="alert-threshold">Threshold</Label>
                    <Input
                      id="alert-threshold"
                      type="number"
                      value={newAlert.threshold}
                      onChange={(e) => setNewAlert({ ...newAlert, threshold: parseFloat(e.target.value) })}
                      placeholder="Enter threshold"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="alert-condition">Condition</Label>
                    <Select
                      value={newAlert.condition}
                      onValueChange={(value) => setNewAlert({ ...newAlert, condition: value as WidgetAlertThreshold['condition'] })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="above">Above</SelectItem>
                        <SelectItem value="below">Below</SelectItem>
                        <SelectItem value="equals">Equals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {newAlert.type === 'category' && (
                    <div>
                      <Label htmlFor="alert-category">Category</Label>
                      <Input
                        id="alert-category"
                        value={newAlert.category || ''}
                        onChange={(e) => setNewAlert({ ...newAlert, category: e.target.value })}
                        placeholder="Category name"
                      />
                    </div>
                  )}
                </div>
                <Button onClick={addAlertThreshold} className="w-full">
                  <Bell className="h-4 w-4 mr-2" />
                  Add Alert
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="display" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-trend">Show Trend Indicators</Label>
                  <p className="text-sm text-muted-foreground">
                    Display trend arrows and percentage changes
                  </p>
                </div>
                <Switch
                  id="show-trend"
                  checked={settings.showTrend ?? true}
                  onCheckedChange={(checked) => handleSettingChange('showTrend', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="compact-view">Compact View</Label>
                  <p className="text-sm text-muted-foreground">
                    Use smaller text and tighter spacing
                  </p>
                </div>
                <Switch
                  id="compact-view"
                  checked={settings.compactView ?? false}
                  onCheckedChange={(checked) => handleSettingChange('compactView', checked)}
                />
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={saveSettings}>
            Save Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
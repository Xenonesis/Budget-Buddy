"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Settings, 
  Bell, 
  RefreshCw, 
  Filter, 
  Download,
  Zap,
  Clock,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from "lucide-react";

interface InsightsSettingsProps {
  settings: {
    autoRefresh: boolean;
    notifications: boolean;
    refreshInterval: number;
    insightTypes: string[];
    priorityFilter: string;
    exportFormat: string;
  };
  onSettingsChange: (settings: any) => void;
}

export function InsightsSettings({ settings, onSettingsChange }: InsightsSettingsProps) {
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...localSettings, [key]: value };
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const insightTypeOptions = [
    { id: 'spending_pattern', label: 'Spending Patterns', icon: TrendingUp, description: 'Analyze spending trends and patterns' },
    { id: 'budget_warning', label: 'Budget Alerts', icon: AlertCircle, description: 'Get notified when approaching budget limits' },
    { id: 'saving_suggestion', label: 'Savings Tips', icon: Target, description: 'Receive personalized saving recommendations' },
    { id: 'investment_tip', label: 'Investment Insights', icon: Zap, description: 'Investment opportunities and tips' },
    { id: 'trend', label: 'Financial Trends', icon: TrendingUp, description: 'Track financial health trends over time' },
    { id: 'success', label: 'Achievement Alerts', icon: CheckCircle2, description: 'Celebrate financial milestones' }
  ];

  const refreshIntervalOptions = [
    { value: 5, label: '5 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 240, label: '4 hours' },
    { value: 1440, label: '24 hours' }
  ];

  const priorityFilterOptions = [
    { value: 'all', label: 'All Insights' },
    { value: 'high', label: 'High Priority Only' },
    { value: 'medium', label: 'Medium & High Priority' },
    { value: 'actionable', label: 'Actionable Items Only' }
  ];

  const exportFormatOptions = [
    { value: 'json', label: 'JSON Format' },
    { value: 'csv', label: 'CSV Format' },
    { value: 'pdf', label: 'PDF Report' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold">Insights Settings</h2>
      </div>

      {/* General Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Auto Refresh */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="auto-refresh" className="font-medium">Auto Refresh</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Automatically refresh insights at regular intervals
              </p>
            </div>
            <Switch
              id="auto-refresh"
              checked={localSettings.autoRefresh}
              onCheckedChange={(checked) => handleSettingChange('autoRefresh', checked)}
            />
          </div>

          {/* Refresh Interval */}
          {localSettings.autoRefresh && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <Label className="font-medium">Refresh Interval</Label>
              </div>
              <select
                value={localSettings.refreshInterval}
                onChange={(e) => handleSettingChange('refreshInterval', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-border rounded-md bg-background"
              >
                {refreshIntervalOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="notifications" className="font-medium">Push Notifications</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Receive notifications for important financial insights
              </p>
            </div>
            <Switch
              id="notifications"
              checked={localSettings.notifications}
              onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Insight Types */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Insight Types</CardTitle>
          <p className="text-sm text-muted-foreground">
            Choose which types of insights you want to receive
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {insightTypeOptions.map(option => {
              const Icon = option.icon;
              const isEnabled = localSettings.insightTypes.includes(option.id);
              
              return (
                <div 
                  key={option.id}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    isEnabled 
                      ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => {
                    const newTypes = isEnabled
                      ? localSettings.insightTypes.filter(t => t !== option.id)
                      : [...localSettings.insightTypes, option.id];
                    handleSettingChange('insightTypes', newTypes);
                  }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${
                      isEnabled ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{option.label}</h4>
                        {isEnabled && (
                          <Badge variant="default" className="text-xs">
                            Enabled
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Display Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Display Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Priority Filter */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Label className="font-medium">Default Priority Filter</Label>
            </div>
            <select
              value={localSettings.priorityFilter}
              onChange={(e) => handleSettingChange('priorityFilter', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            >
              {priorityFilterOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Export Format */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-muted-foreground" />
              <Label className="font-medium">Default Export Format</Label>
            </div>
            <select
              value={localSettings.exportFormat}
              onChange={(e) => handleSettingChange('exportFormat', e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-background"
            >
              {exportFormatOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" className="justify-start">
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset to Defaults
            </Button>
            <Button variant="outline" className="justify-start">
              <Download className="h-4 w-4 mr-2" />
              Export Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
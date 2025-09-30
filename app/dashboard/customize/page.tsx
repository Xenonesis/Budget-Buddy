"use client";

import React, { useState, useEffect } from 'react';
import { WidgetSystem } from '@/components/ui/widget-system';
import { WidgetLayout } from '@/lib/store';
import { useUserPreferences } from '@/hooks/use-user-preferences';
import { AVAILABLE_WIDGETS, getDefaultLayout } from '@/lib/widget-config';
import { SIMPLE_WIDGET_CONFIG, getSimpleDefaultLayout } from '@/lib/simple-widget-config';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, RotateCcw, Settings, Clock, Bell, Eye } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { TimeRangeSelector } from '@/components/ui/time-range-selector';
import { AlertThresholds } from '@/components/ui/alert-thresholds';
import { SectionVisibility } from '@/components/ui/section-visibility';

export default function CustomizeDashboardPage() {
  const {
    dashboardLayout,
    setDashboardLayout,
    userId,
    timeRange,
    customDateRange,
    alertThresholds,
    sectionVisibility,
    setTimeRange,
    setAlertThresholds,
    setSectionVisibility
  } = useUserPreferences();
  const [currentLayout, setCurrentLayout] = useState<WidgetLayout>(
    dashboardLayout || getSimpleDefaultLayout()
  );
  const [isEditMode, setIsEditMode] = useState(true);
  const [saving, setSaving] = useState(false);

  // Initialize layout if not set
  useEffect(() => {
    if (!dashboardLayout) {
      const defaultLayout = getSimpleDefaultLayout();
      setCurrentLayout(defaultLayout);
      setDashboardLayout(defaultLayout);
    }
  }, [dashboardLayout, setDashboardLayout]);

  const handleLayoutChange = (newLayout: WidgetLayout) => {
    setCurrentLayout(newLayout);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to local store
      setDashboardLayout(currentLayout);
      
      // Save to database if user is logged in
      if (userId) {
        const { error } = await supabase
          .from('profiles')
          .update({ 
            dashboard_layout: currentLayout,
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);

        if (error) {
          console.error('Error saving dashboard layout:', error);
          toast.error('Failed to save dashboard layout');
        } else {
          toast.success('Dashboard layout saved successfully');
        }
      } else {
        toast.success('Dashboard layout saved locally');
      }
    } catch (error) {
      console.error('Error saving layout:', error);
      toast.error('Failed to save dashboard layout');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    const defaultLayout = getSimpleDefaultLayout();
    setCurrentLayout(defaultLayout);
    setDashboardLayout(defaultLayout);
    toast.success('Dashboard reset to default layout');
  };

  return (
    <div className="container mx-auto px-4 py-6 md:p-6 lg:p-8 max-w-screen-xl">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold md:text-3xl">Customize Dashboard</h1>
            <p className="text-muted-foreground">
              Personalize your dashboard with advanced settings
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Default
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Layout
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Personalization Tabs */}
      <Tabs defaultValue="widgets" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="widgets" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Widgets
          </TabsTrigger>
          <TabsTrigger value="sections" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Sections
          </TabsTrigger>
          <TabsTrigger value="time" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Time Range
          </TabsTrigger>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Alerts
          </TabsTrigger>
        </TabsList>

        {/* Widgets Tab */}
        <TabsContent value="widgets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Widget Layout</CardTitle>
              <CardDescription>
                Customize your dashboard by adding, removing, and rearranging widgets
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WidgetSystem
                layout={currentLayout}
                onLayoutChange={handleLayoutChange}
                isEditMode={isEditMode}
                onEditModeChange={setIsEditMode}
                availableWidgets={SIMPLE_WIDGET_CONFIG}
                widgetData={{}}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sections Tab */}
        <TabsContent value="sections">
          <SectionVisibility
            sections={sectionVisibility}
            onChange={setSectionVisibility}
          />
        </TabsContent>

        {/* Time Range Tab */}
        <TabsContent value="time">
          <Card>
            <CardHeader>
              <CardTitle>Default Time Range</CardTitle>
              <CardDescription>
                Set your preferred time range for dashboard data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-md">
                <TimeRangeSelector
                  value={timeRange}
                  customRange={customDateRange}
                  onChange={setTimeRange}
                />
              </div>
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> This sets the default time range for your dashboard.
                  Individual charts and widgets may have their own time range controls.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts">
          <AlertThresholds
            thresholds={alertThresholds}
            onChange={setAlertThresholds}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
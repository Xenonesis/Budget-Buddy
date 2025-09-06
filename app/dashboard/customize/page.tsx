"use client";

import React, { useState, useEffect } from 'react';
import { WidgetSystem } from '@/components/ui/widget-system';
import { WidgetLayout } from '@/lib/store';
import { useUserPreferences } from '@/lib/store';
import { AVAILABLE_WIDGETS, getDefaultLayout } from '@/lib/widget-config';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function CustomizeDashboardPage() {
  const { dashboardLayout, setDashboardLayout, userId } = useUserPreferences();
  const [currentLayout, setCurrentLayout] = useState<WidgetLayout>(
    dashboardLayout || getDefaultLayout()
  );
  const [isEditMode, setIsEditMode] = useState(true);
  const [saving, setSaving] = useState(false);

  // Initialize layout if not set
  useEffect(() => {
    if (!dashboardLayout) {
      const defaultLayout = getDefaultLayout();
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
    const defaultLayout = getDefaultLayout();
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
              Personalize your dashboard by adding, removing, and rearranging widgets
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

      {/* Instructions Card */}
      <Card className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/20">
        <CardHeader>
          <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
            How to Customize Your Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800 dark:text-blue-200">
            <div className="space-y-2">
              <h4 className="font-medium">Adding Widgets:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Click on any widget in the "Add Widgets" section</li>
                <li>• Hidden widgets can be made visible by clicking them</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">Organizing Widgets:</h4>
              <ul className="space-y-1 text-xs">
                <li>• Drag widgets using the grip handle to reorder</li>
                <li>• Use S/M/L buttons to change widget sizes</li>
                <li>• Click the eye icon to hide widgets</li>
                <li>• Click the X to remove widgets completely</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Widget System */}
      <WidgetSystem
        layout={currentLayout}
        onLayoutChange={handleLayoutChange}
        isEditMode={isEditMode}
        onEditModeChange={setIsEditMode}
        availableWidgets={AVAILABLE_WIDGETS}
      />
    </div>
  );
}
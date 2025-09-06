"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  BarChart3,
  DollarSign,
  Target,
  Activity,
  PieChart,
  TrendingUp,
  Eye,
  EyeOff
} from 'lucide-react';

export interface DashboardSection {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  visible: boolean;
}

export interface SectionVisibilityProps {
  sections: DashboardSection[];
  onChange: (sections: DashboardSection[]) => void;
  className?: string;
}

const DEFAULT_SECTIONS: DashboardSection[] = [
  {
    id: 'stats-cards',
    title: 'Financial Summary Cards',
    description: 'Total income, expenses, and balance overview',
    icon: <DollarSign className="h-4 w-4" />,
    visible: true,
  },
  {
    id: 'charts',
    title: 'Charts & Analytics',
    description: 'Income vs expenses and category breakdown charts',
    icon: <BarChart3 className="h-4 w-4" />,
    visible: true,
  },
  {
    id: 'budget-overview',
    title: 'Monthly Budget Overview',
    description: 'Budget progress and spending vs budget analysis',
    icon: <Target className="h-4 w-4" />,
    visible: true,
  },
  {
    id: 'recent-transactions',
    title: 'Recent Transactions',
    description: 'Latest financial activity and transaction history',
    icon: <Activity className="h-4 w-4" />,
    visible: true,
  },
  {
    id: 'category-insights',
    title: 'Category Insights',
    description: 'Top spending categories and spending patterns',
    icon: <PieChart className="h-4 w-4" />,
    visible: true,
  },
  {
    id: 'widgets',
    title: 'Custom Widgets',
    description: 'Personalized dashboard widgets and components',
    icon: <TrendingUp className="h-4 w-4" />,
    visible: true,
  },
];

export function SectionVisibility({
  sections = DEFAULT_SECTIONS,
  onChange,
  className
}: SectionVisibilityProps) {
  const handleSectionToggle = (sectionId: string, visible: boolean) => {
    const updatedSections = sections.map(section =>
      section.id === sectionId ? { ...section, visible } : section
    );
    onChange(updatedSections);
  };

  const visibleCount = sections.filter(section => section.visible).length;
  const totalCount = sections.length;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Section Visibility
          </div>
          <span className="text-sm text-muted-foreground">
            {visibleCount} of {totalCount} visible
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sections.map((section) => (
            <div
              key={section.id}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  section.visible
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {section.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor={`section-${section.id}`}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {section.title}
                    </Label>
                    {section.visible ? (
                      <Eye className="h-3 w-3 text-green-600" />
                    ) : (
                      <EyeOff className="h-3 w-3 text-muted-foreground" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {section.description}
                  </p>
                </div>
              </div>
              <Switch
                id={`section-${section.id}`}
                checked={section.visible}
                onCheckedChange={(visible) => handleSectionToggle(section.id, visible)}
              />
            </div>
          ))}
        </div>

        {visibleCount === 0 && (
          <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200">
              <EyeOff className="h-4 w-4" />
              <span className="text-sm font-medium">All sections hidden</span>
            </div>
            <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
              Your dashboard will appear empty. Enable at least one section to see content.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
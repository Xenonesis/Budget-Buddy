"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { QuickStatsWidget, BudgetProgressWidget } from './dashboard-widgets';

// Enhanced widgets using the improved designs
export function SimpleQuickStatsWidget({ data }: Readonly<{ data: any }>) {
  return <QuickStatsWidget data={data} />;
}

export function SimpleBudgetWidget({ data }: Readonly<{ data: any }>) {
  return <BudgetProgressWidget data={data} />;
}
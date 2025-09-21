"use client";

import React, { memo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as PieChartIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface CategoryData {
  name: string;
  value: number;
  color: string;
  [key: string]: any; // Index signature for Recharts compatibility
}

interface ExpenseCategoryChartProps {
  categoryData: CategoryData[];
}

// Enhanced colors for better visualization
const COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#14B8A6', // Teal
  '#A855F7'  // Violet
];

function ExpenseCategoryChartComponent({ categoryData }: ExpenseCategoryChartProps) {
  if (categoryData.length === 0) {
    return (
      <div className="flex h-80 items-center justify-center text-muted-foreground">
        No expense data available
      </div>
    );
  }

  // Calculate total to determine percentages
  const total = categoryData.reduce((sum, category) => sum + category.value, 0);

  // Group small categories (less than 5%) as "Other"
  const threshold = 0.05; // 5%
  const mainCategories = categoryData.filter(item => item.value / total >= threshold);
  const smallCategories = categoryData.filter(item => item.value / total < threshold);
  const otherValue = smallCategories.reduce((sum, item) => sum + item.value, 0);

  // Final data with small categories grouped as "Other"
  const chartData = [
    ...mainCategories,
    ...(otherValue > 0
      ? [{ name: 'Other', value: otherValue, color: '#9CA3AF' }]
      : [])
  ].sort((a, b) => b.value - a.value);

  // Custom label that shows percentages more clearly
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    // Only show labels for segments that are big enough (over 5%)
    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom legend formatter
  const renderLegendFormatter = (value: string, entry: any, total: number) => (
    <span style={{ color: 'var(--foreground)', display: 'inline-flex', alignItems: 'center' }}>
      {value}: {((entry.payload.value / total) * 100).toFixed(1)}%
    </span>
  );

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-primary" />
            Expense Categories
          </CardTitle>
        </div>
        <CardDescription>
          How your expenses are distributed
        </CardDescription>
      </CardHeader>
      <CardContent>
        {categoryData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-4">
            <p className="text-muted-foreground">No expense data available for the selected period.</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <defs>
                  {chartData.map((entry) => (
                    <filter key={`shadow-${entry.name}`} id={`shadow-${entry.name}`} height="200%">
                      <feDropShadow dx="0" dy="0" stdDeviation="2" floodColor={entry.color} floodOpacity="0.5"/>
                    </filter>
                  ))}
                </defs>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  innerRadius={40}
                  paddingAngle={3}
                  dataKey="value"
                  label={renderCustomizedLabel}
                  stroke="#000"
                  strokeOpacity={0.1}
                  strokeWidth={1}
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${entry.name}`}
                      fill={entry.color}
                      style={{ filter: `url(#shadow-${entry.name})` }}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any, name: any, props: any) => [
                    formatCurrency(value as number),
                    props.payload.name
                  ]}
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    padding: '0.5rem'
                  }}
                  itemStyle={{ color: 'var(--foreground)' }}
                />
                <Legend
                  layout="vertical"
                  align="right"
                  verticalAlign="middle"
                  wrapperStyle={{ paddingLeft: 20, fontSize: 12 }}
                  formatter={(value: string, entry: any) => renderLegendFormatter(value, entry, total)}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const ExpenseCategoryChart = memo(ExpenseCategoryChartComponent);
ExpenseCategoryChart.displayName = 'ExpenseCategoryChart';

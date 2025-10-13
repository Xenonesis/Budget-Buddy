"use client";

import React, { memo, useState, useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart as PieChartIcon, ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CategoryData {
  name: string;
  value: number;
  color: string;
  subcategories?: SubcategoryData[];
  [key: string]: any; // Index signature for Recharts compatibility
}

interface SubcategoryData {
  name: string;
  value: number;
  color: string;
  [key: string]: any; // Index signature for Recharts compatibility
}

interface EnhancedExpensePieChartProps {
  categoryData: CategoryData[];
  onCategoryClick?: (category: CategoryData) => void;
}

// Enhanced colors for better visualization
const COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#F97316', '#6366F1', '#14B8A6', '#A855F7'
];

// Assign colors to categories consistently
const getColorForCategory = (categoryName: string, index: number) => {
  return COLORS[index % COLORS.length];
};

function EnhancedExpensePieChartComponent({ categoryData, onCategoryClick }: EnhancedExpensePieChartProps) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryData | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Calculate total to determine percentages
  const total = useMemo(() =>
    categoryData.reduce((sum, category) => sum + category.value, 0),
    [categoryData]
  );

  // Group small categories (less than 3%) as "Other"
  const threshold = 0.03; // 3%
  const processedData = useMemo(() => {
    const mainCategories = categoryData.filter(item => item.value / total >= threshold);
    const smallCategories = categoryData.filter(item => item.value / total < threshold);
    const otherValue = smallCategories.reduce((sum, item) => sum + item.value, 0);

    return [
      ...mainCategories,
      ...(otherValue > 0
        ? [{
          name: 'Other',
          value: otherValue,
          color: '#9CA3AF',
          subcategories: smallCategories.map(cat => ({
            name: cat.name,
            value: cat.value,
            color: cat.color
          }))
        }]
        : [])
    ].sort((a, b) => b.value - a.value);
  }, [categoryData, total, threshold]);

  // Handle pie slice click for drill-down
  const handlePieClick = (data: any, index: number) => {
    const category = processedData[index];
    if (category.subcategories && category.subcategories.length > 0) {
      setIsAnimating(true);
      setTimeout(() => {
        setSelectedCategory(category);
        setIsAnimating(false);
      }, 300);
    }
    onCategoryClick?.(category);
  };

  // Enhanced drill-down with breadcrumb navigation
  const handleBackToMain = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setSelectedCategory(null);
      setIsAnimating(false);
    }, 300);
  };

  // Custom label renderer
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
        style={{ textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / total) * 100).toFixed(1);

      return (
        <div className="bg-card border border-border rounded-lg shadow-lg p-3 max-w-xs">
          <div className="flex items-center gap-2 mb-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: data.color }}
            />
            <span className="font-medium text-foreground">{data.name}</span>
          </div>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Amount:</span>
              <span className="font-medium">{formatCurrency(data.value)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Percentage:</span>
              <span className="font-medium">{percentage}%</span>
            </div>
            {data.subcategories && (
              <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                Click to view {data.subcategories.length} subcategories
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Data to display (main categories or subcategories)
  const displayData = selectedCategory?.subcategories || processedData;
  const displayTotal = selectedCategory
    ? selectedCategory.value
    : total;

  if (categoryData.length === 0) {
    return (
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <PieChartIcon className="h-4 w-4 text-primary" />
            Category-wise Spending
          </CardTitle>
          <CardDescription>
            Interactive breakdown of your expenses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center h-80 text-center p-4">
            <PieChartIcon className="h-12 w-12 text-muted-foreground/40 mb-4" />
            <p className="text-muted-foreground">No expense data available for the selected period.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {selectedCategory && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToMain}
                className="p-1 h-auto hover:bg-muted/50 transition-colors"
                title="Back to main categories"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-primary" />
              {selectedCategory ? `${selectedCategory.name} Breakdown` : 'Category-wise Spending'}
            </CardTitle>
          </div>
        </div>
        <CardDescription>
          {selectedCategory
            ? `Detailed view of ${selectedCategory.name} expenses`
            : 'Interactive breakdown of your expenses - click to drill down'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className={`h-80 transition-opacity duration-300 ${isAnimating ? 'opacity-50' : 'opacity-100'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <defs>
                {displayData.map((entry: any) => (
                  <filter key={`shadow-${entry.name}`} id={`shadow-${entry.name}`} height="200%">
                    <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor={entry.color} floodOpacity="0.3" />
                  </filter>
                ))}
              </defs>
              <Pie
                data={displayData as (CategoryData | SubcategoryData)[]}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                innerRadius={50}
                paddingAngle={2}
                dataKey="value"
                label={renderCustomizedLabel}
                stroke="#fff"
                strokeWidth={2}
                onClick={handlePieClick}
                style={{ cursor: 'pointer' }}
              >
                {displayData.map((entry: any, index: number) => (
                  <Cell
                    key={`cell-${entry.name}`}
                    fill={entry.color}
                    style={{
                      filter: `url(#shadow-${entry.name})`,
                      transition: 'all 0.3s ease'
                    }}
                    className="hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="vertical"
                align="right"
                verticalAlign="middle"
                wrapperStyle={{
                  paddingLeft: 20,
                  fontSize: 12,
                  maxWidth: '150px'
                }}
                formatter={(value: string, entry: any) => (
                  <span style={{ color: 'var(--foreground)' }}>
                    {value}: {((entry.payload.value / displayTotal) * 100).toFixed(1)}%
                  </span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Summary stats */}
        <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-sm items-start">
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground leading-none">Total Amount:</span>
            <div className="font-semibold leading-none">{formatCurrency(displayTotal)}</div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-muted-foreground leading-none">Categories:</span>
            <div className="font-semibold leading-none">{displayData.length}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const EnhancedExpensePieChart = memo(EnhancedExpensePieChartComponent);
EnhancedExpensePieChart.displayName = 'EnhancedExpensePieChart';
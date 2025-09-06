"use client";

import React, { memo, useMemo } from "react";
import {
  ComposedChart,
  Area,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart as ChartIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface MonthlyData {
  name: string;
  income: number;
  expense: number;
}

interface IncomeExpenseChartProps {
  monthlyData: MonthlyData[];
}

function IncomeExpenseChartComponent({ monthlyData }: IncomeExpenseChartProps) {
  // Calculate max value for appropriate Y-axis scaling
  const maxValue = useMemo(() => {
    const allValues = monthlyData.flatMap(item => [item.income, item.expense]);
    return Math.max(...allValues, 1000) * 1.1; // Add 10% padding
  }, [monthlyData]);

  // Calculate net amounts for each month (income - expense)
  const chartData = useMemo(() => {
    return monthlyData.map(item => ({
      ...item,
      net: item.income - item.expense
    }));
  }, [monthlyData]);

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium flex items-center gap-2">
            <ChartIcon className="h-4 w-4 text-primary" />
            Income vs. Expenses
          </CardTitle>
        </div>
        <CardDescription>
          Monthly financial flow comparison
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center p-4">
            <p className="text-muted-foreground">No transaction data available for the selected period.</p>
          </div>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                <XAxis
                  dataKey="name"
                  tick={{
                    fill: 'var(--foreground)',
                    fontWeight: 600,
                    fontSize: 12,
                    className: 'month-label'
                  }}
                  tickLine={{ stroke: 'var(--border)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                />
                <YAxis
                  tick={{ fill: 'var(--muted-foreground)' }}
                  tickFormatter={(value) => {
                    if (value === 0) return '0';
                    if (value >= 1000) return `${(value/1000).toFixed(1)}k`;
                    return value.toString();
                  }}
                  tickLine={{ stroke: 'var(--border)' }}
                  axisLine={{ stroke: 'var(--border)' }}
                  domain={[0, maxValue]}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                  contentStyle={{
                    backgroundColor: 'var(--card)',
                    borderColor: 'var(--border)',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    padding: '0.5rem',
                    color: 'var(--foreground)'
                  }}
                  labelStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
                  itemStyle={{ color: 'var(--foreground)' }}
                  cursor={{ strokeDasharray: '3 3' }}
                />
                <Legend
                  wrapperStyle={{ paddingTop: 10 }}
                  iconType="circle"
                  iconSize={10}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  name="Income"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorIncome)"
                  activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
                />
                <Bar
                  dataKey="expense"
                  name="Expenses"
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
                <Line
                  type="monotone"
                  dataKey="net"
                  name="Net Balance"
                  stroke="#6366F1"
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export const IncomeExpenseChart = memo(IncomeExpenseChartComponent);
IncomeExpenseChart.displayName = 'IncomeExpenseChart';
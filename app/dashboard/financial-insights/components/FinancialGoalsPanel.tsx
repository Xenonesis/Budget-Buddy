"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Target, 
  Plus, 
  Edit, 
  Trash2, 
  DollarSign, 
  Calendar,
  TrendingUp,
  CheckCircle2,
  Clock
} from "lucide-react";

interface FinancialGoal {
  id: string;
  title: string;
  description: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: 'savings' | 'debt' | 'investment' | 'purchase' | 'emergency';
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

interface FinancialGoalsPanelProps {
  goals: FinancialGoal[];
  onAddGoal: (goal: Omit<FinancialGoal, 'id' | 'createdAt'>) => void;
  onUpdateGoal: (id: string, updates: Partial<FinancialGoal>) => void;
  onDeleteGoal: (id: string) => void;
}

export function FinancialGoalsPanel({ 
  goals, 
  onAddGoal, 
  onUpdateGoal, 
  onDeleteGoal 
}: FinancialGoalsPanelProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    targetAmount: string;
    currentAmount: string;
    targetDate: string;
    category: 'savings' | 'debt' | 'investment' | 'purchase' | 'emergency';
    priority: 'high' | 'medium' | 'low';
  }>({
    title: '',
    description: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    category: 'savings',
    priority: 'medium'
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'savings': return '💰';
      case 'debt': return '💳';
      case 'investment': return '📈';
      case 'purchase': return '🛒';
      case 'emergency': return '🚨';
      default: return '🎯';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'savings': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      case 'debt': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      case 'investment': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200';
      case 'purchase': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-200';
      case 'emergency': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200';
    }
  };

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const calculateDaysRemaining = (targetDate: string) => {
    const target = new Date(targetDate);
    const today = new Date();
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const goalData = {
      title: formData.title,
      description: formData.description,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: parseFloat(formData.currentAmount) || 0,
      targetDate: formData.targetDate,
      category: formData.category,
      priority: formData.priority
    };

    if (editingGoal) {
      onUpdateGoal(editingGoal, goalData);
      setEditingGoal(null);
    } else {
      onAddGoal(goalData);
    }

    setFormData({
      title: '',
      description: '',
      targetAmount: '',
      currentAmount: '',
      targetDate: '',
      category: 'savings',
      priority: 'medium'
    });
    setShowAddForm(false);
  };

  const startEditing = (goal: FinancialGoal) => {
    setFormData({
      title: goal.title,
      description: goal.description,
      targetAmount: goal.targetAmount.toString(),
      currentAmount: goal.currentAmount.toString(),
      targetDate: goal.targetDate,
      category: goal.category,
      priority: goal.priority
    });
    setEditingGoal(goal.id);
    setShowAddForm(true);
  };

  const cancelEditing = () => {
    setEditingGoal(null);
    setShowAddForm(false);
    setFormData({
      title: '',
      description: '',
      targetAmount: '',
      currentAmount: '',
      targetDate: '',
      category: 'savings',
      priority: 'medium'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Financial Goals</h2>
          <p className="text-muted-foreground">Track your progress towards financial milestones</p>
        </div>
        <Button 
          onClick={() => setShowAddForm(true)}
          className="shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {editingGoal ? 'Edit Goal' : 'Create New Goal'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Goal Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Emergency Fund"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetAmount">Target Amount</Label>
                  <Input
                    id="targetAmount"
                    type="number"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    placeholder="10000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currentAmount">Current Amount</Label>
                  <Input
                    id="currentAmount"
                    type="number"
                    value={formData.currentAmount}
                    onChange={(e) => setFormData({ ...formData, currentAmount: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetDate">Target Date</Label>
                  <Input
                    id="targetDate"
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="savings">Savings</option>
                    <option value="debt">Debt Payoff</option>
                    <option value="investment">Investment</option>
                    <option value="purchase">Major Purchase</option>
                    <option value="emergency">Emergency Fund</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <select
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-border rounded-md bg-background"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of your goal"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </Button>
                <Button type="button" variant="outline" onClick={cancelEditing}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Goals List */}
      {goals.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Goals Yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by creating your first financial goal to track your progress.
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Goal
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {goals.map((goal) => {
            const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
            const daysRemaining = calculateDaysRemaining(goal.targetDate);
            const isCompleted = progress >= 100;
            const isOverdue = daysRemaining < 0;

            return (
              <Card key={goal.id} className={`transition-all hover:shadow-lg ${
                isCompleted ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/20' : ''
              }`}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{getCategoryIcon(goal.category)}</div>
                      <div>
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          {goal.title}
                          {isCompleted && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        </h3>
                        {goal.description && (
                          <p className="text-muted-foreground text-sm">{goal.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge className={getCategoryColor(goal.category)}>
                            {goal.category}
                          </Badge>
                          <Badge className={getPriorityColor(goal.priority)}>
                            {goal.priority} priority
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(goal)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteGoal(goal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm text-muted-foreground">
                          {progress.toFixed(1)}%
                        </span>
                      </div>
                      <Progress value={progress} className="h-3" />
                    </div>

                    {/* Amount Progress */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          ${goal.currentAmount.toLocaleString()} of ${goal.targetAmount.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {isOverdue ? (
                          <span className="text-red-600 dark:text-red-400">
                            {Math.abs(daysRemaining)} days overdue
                          </span>
                        ) : isCompleted ? (
                          <span className="text-green-600 dark:text-green-400">
                            Completed!
                          </span>
                        ) : (
                          <span>
                            {daysRemaining} days remaining
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const newAmount = prompt(
                            `Update current amount for "${goal.title}":`,
                            goal.currentAmount.toString()
                          );
                          if (newAmount && !isNaN(parseFloat(newAmount))) {
                            onUpdateGoal(goal.id, { currentAmount: parseFloat(newAmount) });
                          }
                        }}
                      >
                        <TrendingUp className="h-4 w-4 mr-1" />
                        Update Progress
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
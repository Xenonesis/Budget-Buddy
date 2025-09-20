"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import { 
  Settings,
  Target,
  AlertTriangle,
  CheckCircle,
  Copy,
  Download,
  Upload,
  Calendar,
  DollarSign,
  TrendingUp,
  BarChart3,
  Zap,
  RefreshCw,
  Save,
  Trash2,
  Plus,
  Edit,
  Eye,
  EyeOff,
  Bell,
  BellOff,
  Lock,
  Unlock,
  Archive,
  RotateCcw
} from 'lucide-react';
import { Budget, CategorySpending } from '../types';

interface BudgetManagementToolsProps {
  budgets: Budget[];
  categorySpending: CategorySpending[];
  onBudgetsUpdate: () => void;
}

interface BudgetTemplate {
  id: string;
  name: string;
  description: string;
  budgets: Array<{
    categoryName: string;
    amount: number;
    period: string;
  }>;
  totalAmount: number;
  createdAt: string;
}

interface BudgetAlert {
  id: string;
  categoryId: string;
  categoryName: string;
  threshold: number;
  type: 'percentage' | 'amount';
  enabled: boolean;
}

export function BudgetManagementTools({ budgets, categorySpending, onBudgetsUpdate }: BudgetManagementToolsProps) {
  const [activeTab, setActiveTab] = useState<'templates' | 'alerts' | 'bulk' | 'export'>('templates');
  const [templates, setTemplates] = useState<BudgetTemplate[]>([]);
  const [alerts, setAlerts] = useState<BudgetAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [bulkOperation, setBulkOperation] = useState<'increase' | 'decrease' | 'reset'>('increase');
  const [bulkPercentage, setBulkPercentage] = useState(10);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchTemplates();
    fetchAlerts();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from('budget_templates')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTemplates(data || []);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const { data, error } = await supabase
        .from('budget_alerts')
        .select('*')
        .eq('user_id', userData.user.id);

      if (error) throw error;
      setAlerts(data || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const createTemplate = async () => {
    if (!templateName.trim()) {
      toast.error('Please enter a template name');
      return;
    }

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const templateData = {
        name: templateName,
        description: templateDescription,
        budgets: budgets.map(budget => ({
          categoryName: budget.category_name,
          amount: budget.amount,
          period: budget.period
        })),
        totalAmount: budgets.reduce((sum, budget) => sum + budget.amount, 0)
      };

      const { error } = await supabase
        .from('budget_templates')
        .insert([{
          user_id: userData.user.id,
          name: templateName,
          description: templateDescription,
          template_data: templateData,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      toast.success('Template created successfully');
      setTemplateName('');
      setTemplateDescription('');
      setShowCreateTemplate(false);
      fetchTemplates();
    } catch (error) {
      console.error('Error creating template:', error);
      toast.error('Failed to create template');
    } finally {
      setLoading(false);
    }
  };

  const applyTemplate = async (template: BudgetTemplate) => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      // Get current categories
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .eq('user_id', userData.user.id);

      if (categoriesError) throw categoriesError;

      // Create budgets from template
      const budgetsToCreate = [];
      for (const templateBudget of template.budgets) {
        const category = categories?.find(c => c.name === templateBudget.categoryName);
        if (category) {
          budgetsToCreate.push({
            user_id: userData.user.id,
            category_id: category.id,
            amount: templateBudget.amount,
            period: templateBudget.period
          });
        }
      }

      if (budgetsToCreate.length > 0) {
        const { error } = await supabase
          .from('budgets')
          .upsert(budgetsToCreate, { 
            onConflict: 'user_id,category_id',
            ignoreDuplicates: false 
          });

        if (error) throw error;

        toast.success(`Applied template: ${template.name}`);
        onBudgetsUpdate();
      } else {
        toast.warning('No matching categories found for this template');
      }
    } catch (error) {
      console.error('Error applying template:', error);
      toast.error('Failed to apply template');
    } finally {
      setLoading(false);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('budget_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      toast.success('Template deleted');
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const performBulkOperation = async () => {
    if (selectedCategories.length === 0) {
      toast.error('Please select categories to modify');
      return;
    }

    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) return;

      const updates = selectedCategories.map(categoryId => {
        const budget = budgets.find(b => b.category_id === categoryId);
        if (!budget) return null;

        let newAmount = budget.amount;
        switch (bulkOperation) {
          case 'increase':
            newAmount = budget.amount * (1 + bulkPercentage / 100);
            break;
          case 'decrease':
            newAmount = budget.amount * (1 - bulkPercentage / 100);
            break;
          case 'reset':
            newAmount = 0; // Will be handled separately
            break;
        }

        return {
          id: budget.id,
          amount: Math.max(0, newAmount)
        };
      }).filter(Boolean);

      if (bulkOperation === 'reset') {
        // Delete selected budgets
        const { error } = await supabase
          .from('budgets')
          .delete()
          .in('category_id', selectedCategories)
          .eq('user_id', userData.user.id);

        if (error) throw error;
        toast.success('Selected budgets reset');
      } else {
        // Update selected budgets
        for (const update of updates) {
          if (update) {
            const { error } = await supabase
              .from('budgets')
              .update({ amount: update.amount })
              .eq('id', update.id);

            if (error) throw error;
          }
        }

        toast.success(`Budgets ${bulkOperation}d by ${bulkPercentage}%`);
      }

      setSelectedCategories([]);
      onBudgetsUpdate();
    } catch (error) {
      console.error('Error performing bulk operation:', error);
      toast.error('Failed to perform bulk operation');
    } finally {
      setLoading(false);
    }
  };

  const exportBudgets = () => {
    const exportData = {
      budgets: budgets.map(budget => ({
        category: budget.category_name,
        amount: budget.amount,
        period: budget.period,
        spent: categorySpending.find(cs => cs.category_id === budget.category_id)?.spent || 0
      })),
      summary: {
        totalBudget: budgets.reduce((sum, b) => sum + b.amount, 0),
        totalSpent: categorySpending.reduce((sum, cs) => sum + cs.spent, 0),
        exportDate: new Date().toISOString()
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success('Budget data exported successfully');
  };

  const toggleCategorySelection = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="rounded-2xl border bg-card shadow-lg overflow-hidden mb-8">
      <div className="border-b p-6 bg-gradient-to-r from-card to-card/80">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Budget Management Tools
            </h2>
            <p className="text-muted-foreground mt-1">
              Advanced tools for managing your budgets efficiently
            </p>
          </div>
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Settings className="h-6 w-6 text-primary" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b p-4">
        <div className="flex gap-2">
          {[
            { id: 'templates', label: 'Templates', icon: Copy },
            { id: 'alerts', label: 'Alerts', icon: Bell },
            { id: 'bulk', label: 'Bulk Actions', icon: Edit },
            { id: 'export', label: 'Export/Import', icon: Download }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id as any)}
                className="h-10"
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'templates' && (
          <motion.div
            key="templates"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold flex items-center gap-2">
                <Copy className="h-4 w-4 text-primary" />
                Budget Templates
                <Badge variant="secondary">{templates.length}</Badge>
              </h3>
              <Button
                onClick={() => setShowCreateTemplate(true)}
                size="sm"
                className="h-8"
              >
                <Plus className="h-3 w-3 mr-1" />
                Create Template
              </Button>
            </div>

            {/* Create Template Form */}
            <AnimatePresence>
              {showCreateTemplate && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-6"
                >
                  <div className="border rounded-lg p-4 bg-muted/30">
                    <h4 className="font-medium mb-3">Create New Template</h4>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Template name"
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      />
                      <textarea
                        placeholder="Description (optional)"
                        value={templateDescription}
                        onChange={(e) => setTemplateDescription(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm h-20 resize-none"
                      />
                      <div className="flex gap-2">
                        <Button
                          onClick={createTemplate}
                          disabled={loading}
                          size="sm"
                        >
                          {loading ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : <Save className="h-3 w-3 mr-1" />}
                          Save Template
                        </Button>
                        <Button
                          onClick={() => setShowCreateTemplate(false)}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Templates List */}
            <div className="space-y-3">
              {templates.length > 0 ? (
                templates.map((template, index) => (
                  <motion.div
                    key={template.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border rounded-lg p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium">{template.name}</h4>
                        {template.description && (
                          <p className="text-sm text-muted-foreground mt-1">{template.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{template.budgets.length} categories</span>
                          <span>Total: {formatCurrency(template.totalAmount)}</span>
                          <span>Created: {new Date(template.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => applyTemplate(template)}
                          disabled={loading}
                          size="sm"
                          variant="outline"
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Apply
                        </Button>
                        <Button
                          onClick={() => deleteTemplate(template.id)}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Copy className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">No templates created yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Create templates to quickly set up budgets</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'bulk' && (
          <motion.div
            key="bulk"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6"
          >
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <Edit className="h-4 w-4 text-primary" />
              Bulk Budget Operations
            </h3>

            {/* Operation Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-3">
                <label className="text-sm font-medium">Operation</label>
                <select
                  value={bulkOperation}
                  onChange={(e) => setBulkOperation(e.target.value as any)}
                  className="w-full px-3 py-2 border rounded-md text-sm"
                >
                  <option value="increase">Increase budgets</option>
                  <option value="decrease">Decrease budgets</option>
                  <option value="reset">Reset budgets</option>
                </select>
              </div>

              {bulkOperation !== 'reset' && (
                <div className="space-y-3">
                  <label className="text-sm font-medium">Percentage</label>
                  <input
                    type="number"
                    value={bulkPercentage}
                    onChange={(e) => setBulkPercentage(Number(e.target.value))}
                    className="w-full px-3 py-2 border rounded-md text-sm"
                    min="1"
                    max="100"
                  />
                </div>
              )}

              <div className="space-y-3">
                <label className="text-sm font-medium">Selected Categories</label>
                <div className="text-sm text-muted-foreground">
                  {selectedCategories.length} of {budgets.length} selected
                </div>
              </div>
            </div>

            {/* Category Selection */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setSelectedCategories(budgets.map(b => b.category_id))}
                  size="sm"
                  variant="outline"
                >
                  Select All
                </Button>
                <Button
                  onClick={() => setSelectedCategories([])}
                  size="sm"
                  variant="outline"
                >
                  Clear All
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                {budgets.map((budget) => (
                  <div
                    key={budget.id}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedCategories.includes(budget.category_id)
                        ? 'bg-primary/10 border-primary'
                        : 'hover:bg-muted/30'
                    }`}
                    onClick={() => toggleCategorySelection(budget.category_id)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-4 w-4 rounded border-2 flex items-center justify-center ${
                        selectedCategories.includes(budget.category_id)
                          ? 'bg-primary border-primary'
                          : 'border-muted-foreground'
                      }`}>
                        {selectedCategories.includes(budget.category_id) && (
                          <CheckCircle className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span className="text-sm font-medium">{budget.category_name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(budget.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Execute Button */}
            <Button
              onClick={performBulkOperation}
              disabled={loading || selectedCategories.length === 0}
              className="w-full"
            >
              {loading ? (
                <RefreshCw className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Zap className="h-4 w-4 mr-2" />
              )}
              {bulkOperation === 'reset' 
                ? `Reset ${selectedCategories.length} budgets`
                : `${bulkOperation} ${selectedCategories.length} budgets by ${bulkPercentage}%`
              }
            </Button>
          </motion.div>
        )}

        {activeTab === 'export' && (
          <motion.div
            key="export"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-6"
          >
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <Download className="h-4 w-4 text-primary" />
              Export & Import
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Export Section */}
              <div className="space-y-4">
                <h4 className="font-medium">Export Budget Data</h4>
                <p className="text-sm text-muted-foreground">
                  Download your budget data as a JSON file for backup or sharing.
                </p>
                <Button
                  onClick={exportBudgets}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export Budgets
                </Button>
              </div>

              {/* Import Section */}
              <div className="space-y-4">
                <h4 className="font-medium">Import Budget Data</h4>
                <p className="text-sm text-muted-foreground">
                  Upload a previously exported budget file to restore your data.
                </p>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Import Budgets (Coming Soon)
                </Button>
              </div>
            </div>

            {/* Export Summary */}
            <div className="mt-8 p-4 border rounded-lg bg-muted/30">
              <h4 className="font-medium mb-3">Current Budget Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-muted-foreground">Total Budgets</div>
                  <div className="font-semibold">{budgets.length}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Total Amount</div>
                  <div className="font-semibold">
                    {formatCurrency(budgets.reduce((sum, b) => sum + b.amount, 0))}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Total Spent</div>
                  <div className="font-semibold">
                    {formatCurrency(categorySpending.reduce((sum, cs) => sum + cs.spent, 0))}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Categories</div>
                  <div className="font-semibold">{categorySpending.length}</div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
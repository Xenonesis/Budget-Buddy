"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  RefreshCw, 
  Settings, 
  Brain, 
  Sparkles,
  HelpCircle,
  ExternalLink
} from "lucide-react";
import { LayoutToggle } from "./LayoutToggle";

type LayoutMode = 'default' | 'chat-focus' | 'insights-focus' | 'voice-focus';

interface PageHeaderProps {
  layoutMode: LayoutMode;
  insightLoading: boolean;
  quotaStatus?: any;
  onLayoutChange: (mode: LayoutMode) => void;
  onRefreshInsights: () => void;
  onOpenSettings: () => void;
}

export function PageHeader({
  layoutMode,
  insightLoading,
  quotaStatus,
  onLayoutChange,
  onRefreshInsights,
  onOpenSettings
}: PageHeaderProps) {
  return (
    <div className="mb-6">
      {/* Main Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold">AI Financial Assistant</h1>
              <p className="text-sm text-muted-foreground">
                Get personalized insights and chat with your financial data
              </p>
            </div>
          </div>
          
          {/* Status Badges */}
          <div className="hidden lg:flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              AI Powered
            </Badge>
            {quotaStatus && (
              <Badge 
                variant={quotaStatus.status?.canMakeRequest ? "default" : "destructive"}
                className="text-xs"
              >
                {quotaStatus.status?.usage || 'Unknown usage'}
              </Badge>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2">
          <LayoutToggle 
            layoutMode={layoutMode} 
            onLayoutChange={onLayoutChange} 
          />
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={onRefreshInsights}
              disabled={insightLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${insightLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh Insights</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={onOpenSettings}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Settings</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200/50 dark:border-blue-800/50 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex-shrink-0">
            <HelpCircle className="h-4 w-4 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              Getting Started with AI Assistant
            </h3>
            <p className="text-xs text-blue-700/80 dark:text-blue-200/80 mb-3 leading-relaxed">
              Your AI assistant can analyze spending patterns, suggest budget optimizations, 
              answer questions about your finances, and provide personalized recommendations.
            </p>
            <div className="flex flex-wrap gap-1.5">
              <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-blue-100/50 text-blue-700 border-blue-200">
                "How much did I spend on groceries this month?"
              </Badge>
              <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-green-100/50 text-green-700 border-green-200">
                "Suggest ways to save money"
              </Badge>
              <Badge variant="secondary" className="text-xs px-2 py-0.5 bg-purple-100/50 text-purple-700 border-purple-200">
                "Analyze my spending trends"
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="flex-shrink-0 text-blue-600 hover:text-blue-700 hover:bg-blue-100/50">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
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

type LayoutMode = 'default' | 'chat-focus' | 'insights-focus';

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

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="text-center">
          <div className="text-lg font-semibold text-primary">AI Insights</div>
          <div className="text-xs text-muted-foreground">Personalized analysis</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-blue-600">Smart Chat</div>
          <div className="text-xs text-muted-foreground">Ask anything</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-green-600">Real-time</div>
          <div className="text-xs text-muted-foreground">Live data analysis</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-semibold text-purple-600">Multi-model</div>
          <div className="text-xs text-muted-foreground">Choose your AI</div>
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-3">
          <HelpCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
              Getting Started with AI Assistant
            </h3>
            <p className="text-xs text-blue-700 dark:text-blue-200 mb-2">
              Your AI assistant can analyze spending patterns, suggest budget optimizations, 
              answer questions about your finances, and provide personalized recommendations.
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                "How much did I spend on groceries this month?"
              </Badge>
              <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                "Suggest ways to save money"
              </Badge>
              <Badge variant="outline" className="text-xs border-blue-300 text-blue-700">
                "Analyze my spending trends"
              </Badge>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
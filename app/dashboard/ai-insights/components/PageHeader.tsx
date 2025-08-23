"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  RefreshCw, 
  Settings, 
  Brain, 
  Sparkles
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

      
    </div>
  );
}
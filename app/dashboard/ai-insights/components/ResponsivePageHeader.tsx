"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  RefreshCw, 
  Settings, 
  Brain, 
  Sparkles,
  Menu,
  X,
  MessageCircle,
  History,
  Mic,
  Grid3X3
} from "lucide-react";
import { useState } from "react";

type LayoutMode = 'mobile-chat' | 'mobile-history' | 'desktop-default' | 'chat-focus' | 'voice-focus';

interface ResponsivePageHeaderProps {
  layoutMode: LayoutMode;
  insightLoading: boolean;
  quotaStatus?: any;
  onLayoutChange: (mode: LayoutMode) => void;
  onRefreshInsights: () => void;
  onOpenSettings: () => void;
  isMobile: boolean;
}

export function ResponsivePageHeader({
  layoutMode,
  insightLoading,
  quotaStatus,
  onLayoutChange,
  onRefreshInsights,
  onOpenSettings,
  isMobile
}: ResponsivePageHeaderProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const layoutOptions = [
    {
      id: 'desktop-default' as LayoutMode,
      label: 'Default',
      icon: Grid3X3,
      description: 'Balanced layout'
    },
    {
      id: 'chat-focus' as LayoutMode,
      label: 'Chat Focus',
      icon: MessageCircle,
      description: 'Emphasize chat'
    },
    {
      id: 'voice-focus' as LayoutMode,
      label: 'Voice Mode',
      icon: Mic,
      description: 'Voice assistant'
    }
  ];

  return (
    <div className="mb-6">
      {/* Main Header */}
      <div className="flex flex-col space-y-4">
        {/* Top Row - Title and Mobile Menu */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-600/20 rounded-xl blur-sm"></div>
                <div className="relative p-3 bg-gradient-to-br from-primary to-blue-600 rounded-xl shadow-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                  AI Financial Assistant
                </h1>
                <p className="text-sm text-muted-foreground">
                  {isMobile ? "Your smart finance companion" : "Get personalized insights and chat with your financial data"}
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          {isMobile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden"
            >
              {showMobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          )}

          {/* Desktop Actions */}
          {!isMobile && (
            <div className="flex items-center gap-3">
              {/* Status Badges */}
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="flex items-center gap-1 bg-gradient-to-r from-primary/10 to-blue-600/10 border-primary/20">
                  <Sparkles className="h-3 w-3 text-primary" />
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

              {/* Layout Toggle for Desktop */}
              <div className="flex gap-1 bg-muted/50 rounded-lg p-1">
                {layoutOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.id}
                      variant="ghost"
                      size="sm"
                      className={`h-9 w-9 p-0 transition-all hover:scale-105 ${
                        layoutMode === option.id 
                          ? 'bg-primary/10 text-primary shadow-sm' 
                          : 'hover:bg-background/80'
                      }`}
                      onClick={() => onLayoutChange(option.id)}
                      title={`${option.label} - ${option.description}`}
                    >
                      <Icon className="h-4 w-4" />
                    </Button>
                  );
                })}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onRefreshInsights}
                  disabled={insightLoading}
                  className="flex items-center gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all"
                >
                  <RefreshCw className={`h-4 w-4 ${insightLoading ? 'animate-spin' : ''}`} />
                  <span className="hidden xl:inline">Refresh</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={onOpenSettings}
                  className="flex items-center gap-2 hover:bg-primary/5 hover:border-primary/30 transition-all"
                >
                  <Settings className="h-4 w-4" />
                  <span className="hidden xl:inline">Settings</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Status Badges */}
        {isMobile && (
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="flex items-center gap-1 bg-gradient-to-r from-primary/10 to-blue-600/10 border-primary/20">
              <Sparkles className="h-3 w-3 text-primary" />
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
        )}

        {/* Mobile Menu */}
        {isMobile && showMobileMenu && (
          <div className="lg:hidden bg-card/80 backdrop-blur border rounded-lg p-4 space-y-4 shadow-lg">
            {/* Layout Options for Mobile */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Layout Options</h3>
              <div className="grid grid-cols-1 gap-2">
                {layoutOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.id}
                      variant={layoutMode === option.id ? "default" : "outline"}
                      size="sm"
                      className="justify-start gap-3 h-12"
                      onClick={() => {
                        onLayoutChange(option.id);
                        setShowMobileMenu(false);
                      }}
                    >
                      <Icon className="h-4 w-4" />
                      <div className="text-left">
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons for Mobile */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Actions</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    onRefreshInsights();
                    setShowMobileMenu(false);
                  }}
                  disabled={insightLoading}
                  className="flex items-center gap-2 h-12"
                >
                  <RefreshCw className={`h-4 w-4 ${insightLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    onOpenSettings();
                    setShowMobileMenu(false);
                  }}
                  className="flex items-center gap-2 h-12"
                >
                  <Settings className="h-4 w-4" />
                  Settings
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
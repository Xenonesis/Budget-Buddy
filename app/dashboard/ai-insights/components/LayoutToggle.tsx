"use client";

import { Button } from "@/components/ui/button";
import { Grid3X3, MessageCircle, HelpCircle, Mic } from "lucide-react";

type LayoutMode = 'default' | 'chat-focus' | 'insights-focus' | 'voice-focus';

interface LayoutToggleProps {
  layoutMode: LayoutMode;
  onLayoutChange: (mode: LayoutMode) => void;
}

export function LayoutToggle({ layoutMode, onLayoutChange }: LayoutToggleProps) {
  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        size="sm"
        className={`w-9 h-9 p-0 ${layoutMode === 'default' ? 'bg-primary/10' : ''}`}
        onClick={() => onLayoutChange('default')}
        title="Default view"
      >
        <Grid3X3 className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        className={`w-9 h-9 p-0 ${layoutMode === 'chat-focus' ? 'bg-primary/10' : ''}`}
        onClick={() => onLayoutChange('chat-focus')}
        title="Focus on chat"
      >
        <MessageCircle className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        className={`w-9 h-9 p-0 ${layoutMode === 'insights-focus' ? 'bg-primary/10' : ''}`}
        onClick={() => onLayoutChange('insights-focus')}
        title="Focus on insights"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        className={`w-9 h-9 p-0 ${layoutMode === 'voice-focus' ? 'bg-primary/10' : ''}`}
        onClick={() => onLayoutChange('voice-focus')}
        title="Voice assistant mode"
      >
        <Mic className="h-4 w-4" />
      </Button>
    </div>
  );
}
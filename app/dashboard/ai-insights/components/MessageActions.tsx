"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  Share2, 
  ThumbsUp, 
  ThumbsDown, 
  MoreHorizontal,
  Bookmark,
  BookmarkCheck
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface MessageActionsProps {
  content: string;
  role: 'user' | 'assistant';
  onSpeak?: (text: string) => void;
  onRegenerate?: () => void;
  className?: string;
}

export function MessageActions({ 
  content, 
  role, 
  onSpeak, 
  onRegenerate,
  className = ""
}: MessageActionsProps) {
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState<boolean | null>(null);
  const [bookmarked, setBookmarked] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      toast.success("Message copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy message");
    }
  };

  const handleSpeak = () => {
    if (onSpeak && !speaking) {
      setSpeaking(true);
      onSpeak(content);
      // Reset speaking state after a reasonable time
      setTimeout(() => setSpeaking(false), Math.max(content.length * 50, 2000));
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'AI Financial Advice',
          text: content,
        });
        toast.success("Shared successfully");
      } catch (error) {
        // User cancelled sharing or sharing failed
        handleCopy(); // Fallback to copy
      }
    } else {
      handleCopy(); // Fallback to copy if Web Share API not available
    }
  };

  const handleLike = (isLike: boolean) => {
    setLiked(isLike);
    toast.success(isLike ? "Thanks for the feedback!" : "Feedback noted, I'll improve!");
  };

  const handleBookmark = () => {
    setBookmarked(!bookmarked);
    toast.success(bookmarked ? "Bookmark removed" : "Message bookmarked");
  };

  if (role === 'user') {
    return (
      <div className={`flex items-center justify-end gap-1 ${className}`}>
        <div className="text-xs text-primary-foreground/70">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between pt-3 border-t border-border/30 ${className}`}>
      <div className="text-xs text-muted-foreground">
        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
      
      <div className="flex items-center gap-1">
        {/* Primary Actions */}
        {onSpeak && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSpeak}
            disabled={speaking}
            className="h-7 px-2 text-xs hover:bg-muted/80 transition-all hover:scale-105"
          >
            {speaking ? (
              <VolumeX className="h-3 w-3 mr-1 text-blue-600" />
            ) : (
              <Volume2 className="h-3 w-3 mr-1" />
            )}
            {speaking ? 'Playing...' : 'Listen'}
          </Button>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 px-2 text-xs hover:bg-muted/80 transition-all hover:scale-105"
        >
          {copied ? (
            <Check className="h-3 w-3 mr-1 text-green-600" />
          ) : (
            <Copy className="h-3 w-3 mr-1" />
          )}
          {copied ? 'Copied!' : 'Copy'}
        </Button>

        {/* Feedback Actions */}
        <div className="flex items-center gap-0.5 ml-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleLike(true)}
            className={`h-7 w-7 p-0 transition-all hover:scale-110 ${
              liked === true ? 'text-green-600 bg-green-50 dark:bg-green-950/20' : 'hover:bg-muted/80'
            }`}
          >
            <ThumbsUp className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleLike(false)}
            className={`h-7 w-7 p-0 transition-all hover:scale-110 ${
              liked === false ? 'text-red-600 bg-red-50 dark:bg-red-950/20' : 'hover:bg-muted/80'
            }`}
          >
            <ThumbsDown className="h-3 w-3" />
          </Button>
        </div>

        {/* More Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-muted/80 transition-all hover:scale-110"
            >
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem onClick={handleBookmark} className="text-xs">
              {bookmarked ? (
                <BookmarkCheck className="h-3 w-3 mr-2 text-blue-600" />
              ) : (
                <Bookmark className="h-3 w-3 mr-2" />
              )}
              {bookmarked ? 'Bookmarked' : 'Bookmark'}
            </DropdownMenuItem>
            
            <DropdownMenuItem onClick={handleShare} className="text-xs">
              <Share2 className="h-3 w-3 mr-2" />
              Share Message
            </DropdownMenuItem>
            
            {onRegenerate && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onRegenerate} className="text-xs">
                  <Volume2 className="h-3 w-3 mr-2" />
                  Regenerate Response
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
'use client';

import * as React from 'react';
import { Copy, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useClipboard } from '@/lib/hooks/useClipboard';
import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface CopyButtonProps {
  text: string;
  onCopy?: () => void;
  className?: string;
  iconSize?: number;
  variant?:
    | 'default'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'link'
    | 'destructive'
    | 'success'
    | 'warning';
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon';
  tooltipText?: {
    idle?: string;
    copied?: string;
    error?: string;
  };
}

export function CopyButton({
  text,
  onCopy,
  className,
  iconSize = 16,
  variant = 'ghost',
  size = 'icon',
  tooltipText = {
    idle: 'Copy to clipboard',
    copied: 'Copied!',
    error: 'Failed to copy',
  },
}: CopyButtonProps) {
  const { copyToClipboard, status, reset } = useClipboard();

  const handleCopy = async () => {
    if (status === 'inactive') {
      const success = await copyToClipboard(text);
      if (success && onCopy) {
        onCopy();
      }
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={variant}
            size={size}
            className={cn('relative', className)}
            onClick={handleCopy}
            aria-label={
              status === 'copied'
                ? 'Copied'
                : status === 'error'
                  ? 'Copy failed'
                  : 'Copy to clipboard'
            }
          >
            {status === 'copied' ? (
              <Check size={iconSize} className="text-green-500" />
            ) : status === 'error' ? (
              <AlertCircle size={iconSize} className="text-red-500" />
            ) : (
              <Copy size={iconSize} />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="top">
          {status === 'copied'
            ? tooltipText.copied
            : status === 'error'
              ? tooltipText.error
              : tooltipText.idle}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

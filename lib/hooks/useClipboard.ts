import { useState, useCallback } from 'react';

type CopyStatus = 'inactive' | 'copied' | 'error';

interface UseClipboardReturn {
  copyToClipboard: (text: string) => Promise<boolean>;
  status: CopyStatus;
  reset: () => void;
}

/**
 * A custom hook that provides clipboard functionality with fallbacks for browsers 
 * that don't support the Clipboard API.
 */
export function useClipboard(resetAfterMs = 2000): UseClipboardReturn {
  const [status, setStatus] = useState<CopyStatus>('inactive');

  const reset = useCallback(() => {
    setStatus('inactive');
  }, []);

  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    if (!text) {
      setStatus('error');
      return false;
    }

    // Method 1: Use the modern Clipboard API if available
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(text);
        setStatus('copied');
        
        if (resetAfterMs > 0) {
          setTimeout(reset, resetAfterMs);
        }
        
        return true;
      } catch (err) {
        console.warn('Clipboard API failed:', err);
        // Fall through to fallback methods
      }
    }

    // Method 2: Use the older document.execCommand('copy') approach
    try {
      // Create temporary element
      const textArea = document.createElement('textarea');
      textArea.value = text;
      
      // Make the textarea out of viewport
      textArea.style.position = 'fixed';
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.width = '2em';
      textArea.style.height = '2em';
      textArea.style.padding = '0';
      textArea.style.border = 'none';
      textArea.style.outline = 'none';
      textArea.style.boxShadow = 'none';
      textArea.style.background = 'transparent';
      textArea.style.opacity = '0';
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      
      if (successful) {
        setStatus('copied');
        
        if (resetAfterMs > 0) {
          setTimeout(reset, resetAfterMs);
        }
        
        return true;
      }
    } catch (err) {
      console.warn('execCommand approach failed:', err);
    }

    // If we get here, both methods failed
    setStatus('error');
    return false;
  }, [reset, resetAfterMs]);

  return { copyToClipboard, status, reset };
} 
"use client";

import { useState, useEffect, useCallback } from 'react';

interface UseSidebarReturn {
  collapsed: boolean;
  isMobileSidebarOpen: boolean;
  toggleCollapsed: () => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

/**
 * Custom hook for managing sidebar state
 * Provides consistent sidebar behavior across the application
 */
export function useSidebar(): UseSidebarReturn {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Load sidebar state from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('sidebar-collapsed');
      if (savedState !== null) {
        setCollapsed(savedState === 'true');
      }
    }
  }, []);

  const toggleCollapsed = useCallback(() => {
    setCollapsed(prev => {
      const newState = !prev;
      // Save state to localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebar-collapsed', newState.toString());
      }
      return newState;
    });
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsMobileSidebarOpen(prev => !prev);
    
    // Add a class to show the sidebar but preserve scrolling
    document.documentElement.classList.toggle("sidebar-open");
    
    // Toggle ARIA expanded state for accessibility
    const menuButton = document.querySelector('[aria-label="Toggle menu"]');
    if (menuButton) {
      const isExpanded = menuButton.getAttribute('aria-expanded') === 'true';
      menuButton.setAttribute('aria-expanded', (!isExpanded).toString());
    }
  }, []);

  const closeSidebar = useCallback(() => {
    setIsMobileSidebarOpen(false);
    
    // Remove the sidebar class to hide it
    document.documentElement.classList.remove("sidebar-open");
    
    // Update ARIA expanded state
    const menuButton = document.querySelector('[aria-label="Toggle menu"]');
    if (menuButton) {
      menuButton.setAttribute('aria-expanded', 'false');
    }
  }, []);

  // Handle body scroll lock when mobile sidebar is open
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isMobileSidebarOpen]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      // Toggle sidebar with Alt+S
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        toggleCollapsed();
      }
      
      // Escape key to close sidebar on mobile
      if (e.key === 'Escape' && document.documentElement.classList.contains('sidebar-open')) {
        closeSidebar();
      }
    };
    
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [toggleCollapsed, closeSidebar]);

  return {
    collapsed,
    isMobileSidebarOpen,
    toggleCollapsed,
    toggleSidebar,
    closeSidebar,
  };
}
"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

const notificationStyles = {
  success: {
    icon: CheckCircle,
    colors: "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/50 dark:border-green-800 dark:text-green-300",
    iconColor: "text-green-600 dark:text-green-400"
  },
  error: {
    icon: AlertCircle,
    colors: "bg-red-50 border-red-200 text-red-800 dark:bg-red-950/50 dark:border-red-800 dark:text-red-300",
    iconColor: "text-red-600 dark:text-red-400"
  },
  warning: {
    icon: AlertTriangle,
    colors: "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950/50 dark:border-yellow-800 dark:text-yellow-300",
    iconColor: "text-yellow-600 dark:text-yellow-400"
  },
  info: {
    icon: Info,
    colors: "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950/50 dark:border-blue-800 dark:text-blue-300",
    iconColor: "text-blue-600 dark:text-blue-400"
  }
};

function NotificationItem({ 
  notification, 
  onRemove 
}: { 
  notification: Notification; 
  onRemove: (id: string) => void;
}) {
  const style = notificationStyles[notification.type];
  const Icon = style.icon;

  React.useEffect(() => {
    if (notification.duration && notification.duration > 0) {
      const timer = setTimeout(() => {
        onRemove(notification.id);
      }, notification.duration);

      return () => clearTimeout(timer);
    }
  }, [notification.id, notification.duration, onRemove]);

  return (
    <Card className={cn(
      "border shadow-lg transition-all duration-300 animate-in slide-in-from-right-full",
      style.colors
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Icon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", style.iconColor)} />
          
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm">{notification.title}</h4>
            {notification.message && (
              <p className="text-sm opacity-90 mt-1">{notification.message}</p>
            )}
            
            {notification.action && (
              <Button
                variant="ghost"
                size="sm"
                onClick={notification.action.onClick}
                className="mt-2 h-8 px-3 text-xs hover:bg-white/20"
              >
                {notification.action.label}
              </Button>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(notification.id)}
            className="h-6 w-6 p-0 hover:bg-white/20 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((notification: Omit<Notification, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000
    };
    
    setNotifications(prev => [...prev, newNotification]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll
    }}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
        {notifications.map(notification => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onRemove={removeNotification}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

// Convenience hooks for different notification types
export function useSuccessNotification() {
  const { addNotification } = useNotifications();
  
  return useCallback((title: string, message?: string, action?: Notification["action"]) => {
    addNotification({ type: "success", title, message, action });
  }, [addNotification]);
}

export function useErrorNotification() {
  const { addNotification } = useNotifications();
  
  return useCallback((title: string, message?: string, action?: Notification["action"]) => {
    addNotification({ type: "error", title, message, action, duration: 8000 });
  }, [addNotification]);
}

export function useWarningNotification() {
  const { addNotification } = useNotifications();
  
  return useCallback((title: string, message?: string, action?: Notification["action"]) => {
    addNotification({ type: "warning", title, message, action, duration: 6000 });
  }, [addNotification]);
}

export function useInfoNotification() {
  const { addNotification } = useNotifications();
  
  return useCallback((title: string, message?: string, action?: Notification["action"]) => {
    addNotification({ type: "info", title, message, action });
  }, [addNotification]);
}
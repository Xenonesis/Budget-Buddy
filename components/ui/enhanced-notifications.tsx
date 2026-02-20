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
    colors: "bg-green-400 border-4 border-foreground text-foreground shadow-[4px_4px_0px_hsl(var(--foreground))] rounded-none",
    iconColor: "text-foreground stroke-[3]"
  },
  error: {
    icon: AlertCircle,
    colors: "bg-red-500 border-4 border-foreground text-foreground shadow-[4px_4px_0px_hsl(var(--foreground))] rounded-none",
    iconColor: "text-foreground stroke-[3]"
  },
  warning: {
    icon: AlertTriangle,
    colors: "bg-[#DFFF00] border-4 border-foreground text-foreground shadow-[4px_4px_0px_hsl(var(--foreground))] rounded-none",
    iconColor: "text-foreground stroke-[3]"
  },
  info: {
    icon: Info,
    colors: "bg-blue-400 border-4 border-foreground text-foreground shadow-[4px_4px_0px_hsl(var(--foreground))] rounded-none",
    iconColor: "text-foreground stroke-[3]"
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
      "transition-all duration-300 animate-in slide-in-from-right-full rounded-none overflow-hidden",
      style.colors
    )}>
      <CardContent className="p-0">
        <div className="flex items-stretch">
          <div className="flex items-center justify-center p-4 border-r-4 border-foreground bg-background/20">
            <Icon className={cn("h-6 w-6 flex-shrink-0", style.iconColor)} />
          </div>
          
          <div className="flex-1 min-w-0 p-4">
            <h4 className="font-mono font-black uppercase tracking-widest text-sm text-foreground">{notification.title}</h4>
            {notification.message && (
              <p className="font-mono font-bold text-xs text-foreground/90 mt-1">{notification.message}</p>
            )}
            
            {notification.action && (
              <Button
                variant="ghost"
                size="sm"
                onClick={notification.action.onClick}
                className="mt-3 h-8 px-3 text-xs font-mono font-bold uppercase border-2 border-foreground bg-foreground text-background hover:bg-background hover:text-foreground rounded-none"
              >
                {notification.action.label}
              </Button>
            )}
          </div>
          
          <div className="p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemove(notification.id)}
              className="h-8 w-8 p-0 rounded-none border-2 border-transparent hover:border-foreground hover:bg-foreground hover:text-background text-foreground flex-shrink-0"
            >
              <X className="h-5 w-5 stroke-[3]" />
            </Button>
          </div>
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
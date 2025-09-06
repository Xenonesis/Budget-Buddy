"use client";

import { useState, useEffect, useCallback } from 'react';
import { NotificationService } from '@/lib/notification-service';
import { Notification } from '@/lib/types/notification';
import { supabase } from '@/lib/supabase';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load notifications
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const [notificationData, unreadCountData] = await Promise.all([
        NotificationService.getNotifications(50),
        NotificationService.getUnreadCount(),
      ]);
      setNotifications(notificationData);
      setUnreadCount(unreadCountData);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }, []);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await NotificationService.deleteNotification(notificationId);
      const deletedNotification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      if (deletedNotification && !deletedNotification.read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }, [notifications]);

  // Add new notification (for real-time updates)
  const addNotification = useCallback((notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    if (!notification.read) {
      setUnreadCount(prev => prev + 1);
    }
  }, []);

  // Set up real-time subscription
  useEffect(() => {
    let subscription: any;

    const setupRealtimeSubscription = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          subscription = NotificationService.subscribeToNotifications(
            userData.user.id,
            addNotification
          );
        }
      } catch (error) {
        console.error('Error setting up real-time subscription:', error);
      }
    };

    setupRealtimeSubscription();

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [addNotification]);

  // Load notifications on mount
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    addNotification,
  };
}
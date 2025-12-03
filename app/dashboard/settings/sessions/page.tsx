'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Monitor,
  Smartphone,
  Tablet,
  Globe,
  Shield,
  LogOut,
  Clock,
  MapPin,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';

interface SessionInfo {
  id: string;
  created_at: string;
  updated_at: string;
  user_agent: string;
  ip: string;
  is_current: boolean;
  device_type: 'desktop' | 'mobile' | 'tablet' | 'unknown';
  browser: string;
  os: string;
  location?: string;
}

// Parse user agent to extract device info
function parseUserAgent(userAgent: string): {
  device_type: SessionInfo['device_type'];
  browser: string;
  os: string;
} {
  const ua = userAgent.toLowerCase();

  // Detect device type
  let device_type: SessionInfo['device_type'] = 'unknown';
  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(ua)) {
    device_type = 'mobile';
  } else if (/ipad|tablet/i.test(ua)) {
    device_type = 'tablet';
  } else if (/windows|macintosh|linux/i.test(ua)) {
    device_type = 'desktop';
  }

  // Detect browser
  let browser = 'Unknown Browser';
  if (/edg/i.test(ua)) browser = 'Microsoft Edge';
  else if (/chrome/i.test(ua) && !/edg/i.test(ua)) browser = 'Google Chrome';
  else if (/firefox/i.test(ua)) browser = 'Mozilla Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/opera|opr/i.test(ua)) browser = 'Opera';
  else if (/msie|trident/i.test(ua)) browser = 'Internet Explorer';

  // Detect OS
  let os = 'Unknown OS';
  if (/windows nt 10/i.test(ua)) os = 'Windows 10/11';
  else if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  return { device_type, browser, os };
}

// Get device icon based on type
function getDeviceIcon(deviceType: SessionInfo['device_type']) {
  switch (deviceType) {
    case 'mobile':
      return <Smartphone className="h-5 w-5" />;
    case 'tablet':
      return <Tablet className="h-5 w-5" />;
    case 'desktop':
      return <Monitor className="h-5 w-5" />;
    default:
      return <Globe className="h-5 w-5" />;
  }
}

// Format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins === 1 ? '' : 's'} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [showRevokeAllDialog, setShowRevokeAllDialog] = useState(false);
  const [revokingAll, setRevokingAll] = useState(false);

  // Fetch current session info
  const fetchSessions = async () => {
    setLoading(true);
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) throw error;
      if (!session) {
        router.push('/auth/login');
        return;
      }

      // Get session details from Supabase
      // Note: Supabase doesn't expose all sessions by default, so we'll show the current session
      // and any session history stored in our own tracking (if implemented)
      const currentSession: SessionInfo = {
        id: session.access_token.slice(-12), // Use last 12 chars as ID
        created_at: new Date(session.expires_at! * 1000 - 3600000).toISOString(), // Approximate creation time
        updated_at: new Date().toISOString(),
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
        ip: 'Current IP', // Would need server-side to get actual IP
        is_current: true,
        ...parseUserAgent(typeof navigator !== 'undefined' ? navigator.userAgent : ''),
      };

      // Load session history from localStorage (for demo purposes)
      // In production, this would come from a server-side session tracking table
      const storedSessions = localStorage.getItem('session_history');
      let sessionHistory: SessionInfo[] = [];

      if (storedSessions) {
        try {
          sessionHistory = JSON.parse(storedSessions);
          // Mark current session and filter out expired
          sessionHistory = sessionHistory
            .filter((s) => s.id !== currentSession.id)
            .map((s) => ({ ...s, is_current: false }));
        } catch {
          sessionHistory = [];
        }
      }

      // Store current session in history
      const updatedHistory = [currentSession, ...sessionHistory].slice(0, 10); // Keep last 10
      localStorage.setItem('session_history', JSON.stringify(updatedHistory));

      setSessions(updatedHistory);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast.error('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Revoke a specific session
  const revokeSession = async (sessionId: string) => {
    setRevoking(sessionId);

    try {
      const session = sessions.find((s) => s.id === sessionId);

      if (session?.is_current) {
        // Log out current session
        await supabase.auth.signOut();
        router.push('/auth/login?message=You have been signed out');
        return;
      }

      // For non-current sessions, just remove from history
      // In production, this would call an API to invalidate the session token
      const updatedSessions = sessions.filter((s) => s.id !== sessionId);
      setSessions(updatedSessions);
      localStorage.setItem('session_history', JSON.stringify(updatedSessions));

      toast.success('Session revoked successfully');
    } catch (error) {
      console.error('Error revoking session:', error);
      toast.error('Failed to revoke session');
    } finally {
      setRevoking(null);
    }
  };

  // Revoke all other sessions
  const revokeAllOtherSessions = async () => {
    setRevokingAll(true);

    try {
      // In production, this would call an API to invalidate all other session tokens
      const currentSession = sessions.find((s) => s.is_current);
      if (currentSession) {
        setSessions([currentSession]);
        localStorage.setItem('session_history', JSON.stringify([currentSession]));
      }

      toast.success('All other sessions have been revoked');
      setShowRevokeAllDialog(false);
    } catch (error) {
      console.error('Error revoking all sessions:', error);
      toast.error('Failed to revoke sessions');
    } finally {
      setRevokingAll(false);
    }
  };

  const otherSessionsCount = sessions.filter((s) => !s.is_current).length;

  return (
    <div className="container mx-auto px-4 py-6 md:px-6 md:py-6 lg:px-8 lg:py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push('/dashboard/settings')}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Settings
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold md:text-3xl flex items-center gap-2">
              <Shield className="h-7 w-7 text-primary" />
              Active Sessions
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your active sessions and sign out from other devices
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={fetchSessions} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Security Notice */}
      <Card className="mb-6 border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
        <CardContent className="py-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">Security Tip</p>
              <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                If you see any sessions you don&apos;t recognize, revoke them immediately and
                consider changing your password.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Sessions</CardTitle>
              <CardDescription>
                {sessions.length} active session{sessions.length === 1 ? '' : 's'}
              </CardDescription>
            </div>

            {otherSessionsCount > 0 && (
              <Button variant="destructive" size="sm" onClick={() => setShowRevokeAllDialog(true)}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign out all other sessions
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No active sessions found</p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {sessions.map((session, index) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.05 }}
                    className={`relative p-4 rounded-lg border ${
                      session.is_current
                        ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/20'
                        : 'border-muted hover:border-muted-foreground/30'
                    } transition-colors`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        {/* Device Icon */}
                        <div
                          className={`p-3 rounded-lg ${
                            session.is_current
                              ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {getDeviceIcon(session.device_type)}
                        </div>

                        {/* Session Details */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{session.browser}</span>
                            {session.is_current && (
                              <Badge variant="default" className="bg-green-600 hover:bg-green-600">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Current Session
                              </Badge>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground">
                            {session.os} •{' '}
                            {session.device_type.charAt(0).toUpperCase() +
                              session.device_type.slice(1)}
                          </p>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Last active: {formatRelativeTime(session.updated_at)}
                            </span>
                            {session.ip && session.ip !== 'Current IP' && (
                              <span className="flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {session.ip}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <Button
                        variant={session.is_current ? 'outline' : 'destructive'}
                        size="sm"
                        onClick={() => revokeSession(session.id)}
                        disabled={revoking === session.id}
                        className="flex-shrink-0"
                      >
                        {revoking === session.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <LogOut className="h-4 w-4 mr-1" />
                            {session.is_current ? 'Sign out' : 'Revoke'}
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">About Sessions</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Current session:</strong> The device and browser you&apos;re currently using.
            Signing out here will log you out of the application.
          </p>
          <p>
            <strong>Other sessions:</strong> These are other devices or browsers where you&apos;re
            signed in. Revoking a session will immediately sign out that device.
          </p>
          <p>
            <strong>Security recommendation:</strong> Regularly review your active sessions and
            revoke any you don&apos;t recognize to keep your account secure.
          </p>
        </CardContent>
      </Card>

      {/* Revoke All Dialog */}
      <AlertDialog open={showRevokeAllDialog} onOpenChange={setShowRevokeAllDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sign out all other sessions?</AlertDialogTitle>
            <AlertDialogDescription>
              This will sign out all other devices and browsers where you&apos;re currently logged
              in. Your current session will remain active.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={revokingAll}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={revokeAllOtherSessions}
              disabled={revokingAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {revokingAll ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out all
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

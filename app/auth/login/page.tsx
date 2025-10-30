"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Lock, Eye, CheckCircle2, Sparkles, AlertCircle, Mail, Users, Star } from "lucide-react";
import { 
  AuthLogo, 
  AuthCard, 
  LoginForm, 
  ForgotPasswordLink, 
  SignUpPrompt, 
  AnimatedBackground
} from "@/components/auth";
import { BackToHomeLink } from "@/components/auth";

export default function LoginPage() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<URLSearchParams | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Initialize searchParams only on client side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setSearchParams(new URLSearchParams(window.location.search));
    }
  }, []);

  // Check for messages from URL params (like email verification)
  useEffect(() => {
    if (searchParams) {
      const message = searchParams.get('message');
      if (message) {
        setSuccessMessage(message);
        // Clear the message after 5 seconds
        setTimeout(() => setSuccessMessage(null), 5000);
      }
    }
  }, [searchParams]);

  const handleLoginSuccess = () => {
    setShowSuccessAnimation(true);
    setIsLoading(true);
    
    // Add a slight delay for the success animation
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1500);
  };

  const handleLoginError = (errorMessage: string) => {
    setError(errorMessage);
    setIsLoading(false);
  };

  const handleLoginStart = () => {
    setIsLoading(true);
    setError(null);
  };

  // Enhanced trust indicators with animations
  const trustIndicators = [
    { icon: Shield, label: "Bank-level Security", color: "bg-emerald-500", delay: 0.1 },
    { icon: Lock, label: "256-bit Encryption", color: "bg-blue-500", delay: 0.2 },
    { icon: Eye, label: "Privacy Protected", color: "bg-purple-500", delay: 0.3 },
  ];

  // Social proof indicators
  const socialProofItems = [
    { icon: Users, label: "50,000+ Active Users", delay: 0.4 },
    { icon: Star, label: "4.9/5 Average Rating", delay: 0.5 },
    { icon: Shield, label: "SOC 2 Compliant", delay: 0.6 },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-gradient-to-br from-background via-background to-primary/5 relative overflow-hidden overflow-x-hidden">
      <AnimatedBackground />
      
      {/* Enhanced background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.02]" />

      {/* Success message from URL params */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4"
          >
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 shadow-lg backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-800 dark:text-green-200">
                    {successMessage}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessAnimation && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="bg-card/90 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-primary/20"
            >
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center"
                >
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <h3 className="text-xl font-semibold text-gradient">Welcome back!</h3>
                  <p className="text-muted-foreground text-sm mt-1">Redirecting to your dashboard...</p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md space-y-8 relative z-10"
      >
        <BackToHomeLink />

        {/* Enhanced header with floating elements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="relative"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-4 -right-4 w-8 h-8 text-primary/20"
          >
            <Sparkles className="w-full h-full" />
          </motion.div>
          
          <AuthCard 
            title="Welcome back" 
            subtitle="Sign in to your account to continue your financial journey"
            error={error}
          >
            <AuthLogo />
          </AuthCard>
        </motion.div>

        {/* Enhanced form container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="relative group"
        >
          {/* Glow effect */}
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative bg-background/70 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8 overflow-hidden">
            {/* Subtle animated border */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/10 via-transparent to-primary/10 opacity-50" />
            
            <LoginForm 
              onSuccess={handleLoginSuccess}
              onError={handleLoginError}
              onStart={handleLoginStart}
            />
            
            <motion.div
              className="mt-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.3 }}
            >
              <ForgotPasswordLink />
            </motion.div>
          </div>
        </motion.div>

        <SignUpPrompt />

        {/* Enhanced trust indicators */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.4 }}
        >
          <div className="text-center">
            <p className="text-xs text-muted-foreground font-medium mb-3">
              Trusted by thousands of users worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {trustIndicators.map(({ icon: Icon, label, color, delay }, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: delay + 0.9, duration: 0.3 }}
                className="flex items-center justify-center gap-3 p-3 rounded-xl bg-card/50 backdrop-blur-sm border border-white/5 hover:bg-card/70 transition-colors duration-300"
              >
                <div className={`w-2 h-2 ${color} rounded-full animate-pulse`} />
                <Icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">{label}</span>
              </motion.div>
            ))}
          </div>

          {/* Social proof section */}
          <motion.div
            className="space-y-2 mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.3, duration: 0.4 }}
          >
            <div className="text-center mb-2">
              <p className="text-xs text-muted-foreground font-medium">
                Join our community
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-2">
              {socialProofItems.map(({ icon: Icon, label, delay }, index) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: delay + 1.3, duration: 0.3 }}
                  className="flex items-center justify-center gap-3 p-2 rounded-lg bg-primary/5 border border-primary/10"
                >
                  <Icon className="w-3 h-3 text-primary" />
                  <span className="text-xs text-muted-foreground font-medium">{label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* Additional security badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.6, duration: 0.3 }}
            className="text-center pt-2"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-muted-foreground font-medium">
                SSL Secured Connection
              </span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
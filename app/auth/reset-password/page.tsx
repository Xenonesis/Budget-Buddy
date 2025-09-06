"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle, AlertCircle, Shield, Clock, RefreshCw } from "lucide-react";

// AuthLogo component
const AuthLogo = () => (
  <div className="flex items-center justify-center">
    <motion.div
      className="relative"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative flex items-center justify-center h-16 w-16 transition-all duration-300">
        <Image 
          src="/logo.svg" 
          alt="Budget Buddy Logo" 
          width={48} 
          height={48} 
          className="h-12 w-12 transition-all duration-300"
          priority={true} 
        />
      </div>
      <motion.div 
        className="absolute inset-0 rounded-full bg-primary/10 blur-sm -z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      />
    </motion.div>
  </div>
);

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessState, setShowSuccessState] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) throw error;
      
      setShowSuccessState(true);
      setMessage("Check your email for a password reset link");
    } catch (error: any) {
      setError(error.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div 
          className="absolute top-1/4 right-1/4 w-64 h-64 bg-primary/8 rounded-full blur-3xl opacity-60"
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.4, 0.6, 0.4]
          }}
          transition={{ 
            duration: 8, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 left-1/4 w-48 h-48 bg-violet-500/8 rounded-full blur-3xl opacity-60"
          animate={{ 
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.4, 0.6]
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md space-y-8 relative z-10"
      >
        {/* Back to home link */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Link 
            href="/auth/login" 
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to login
          </Link>
        </motion.div>

        <div className="bg-background/85 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8 relative overflow-hidden">
          {/* Background animation */}
          <div className="absolute inset-0 -z-10">
            <motion.div 
              className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-transparent to-violet-500/5 rounded-2xl"
              animate={{ 
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
              }}
              transition={{ 
                duration: 15, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                backgroundSize: '400% 400%'
              }}
            />
          </div>

          <AnimatePresence mode="wait">
            {!showSuccessState ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header */}
                <div className="space-y-4 text-center mb-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  >
                    <AuthLogo />
                  </motion.div>
                  <div>
                    <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary via-violet-500 to-indigo-500 bg-clip-text text-transparent">
                      Reset your password
                    </h1>
                    <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                      Enter your email address and we'll send you a link to reset your password
                    </p>
                  </div>
                </div>

                {/* Error display */}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    className="mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 p-4 text-sm border border-red-200 dark:border-red-800 flex items-center gap-3"
                  >
                    <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                    <span className="text-red-700 dark:text-red-300">{error}</span>
                  </motion.div>
                )}

                <form onSubmit={handleResetPassword} className="space-y-6">
                  <motion.div 
                    className="space-y-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.3 }}
                  >
                    <label
                      htmlFor="email"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        placeholder="name@example.com"
                        className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                      <motion.div 
                        className="absolute bottom-0 left-0 h-[2px] bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: email ? "100%" : "0%" }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4, duration: 0.3 }}
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                  >
                    <Button 
                      type="submit" 
                      className="w-full h-11 relative overflow-hidden group"
                      disabled={loading || !email}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        {loading ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin" />
                            Sending reset link...
                          </>
                        ) : (
                          <>
                            <Mail className="h-4 w-4" />
                            Send Reset Link
                          </>
                        )}
                      </span>
                      {!loading && (
                        <motion.div 
                          className="absolute inset-0 bg-gradient-to-r from-primary to-violet-600"
                          animate={{ x: ["0%", "100%"] }}
                          transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            repeatType: "reverse"
                          }}
                        />
                      )}
                    </Button>
                  </motion.div>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center space-y-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center"
                >
                  <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                </motion.div>
                
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold text-foreground">
                    Check your email
                  </h2>
                  <div className="space-y-2">
                    <p className="text-muted-foreground text-sm">
                      We've sent a password reset link to
                    </p>
                    <p className="font-medium text-foreground">{email}</p>
                  </div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
                >
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Link expires in 60 minutes
                      </p>
                      <p className="text-blue-700 dark:text-blue-300 text-xs">
                        Didn't receive the email? Check your spam folder or request a new link.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-3"
                >
                  <Button 
                    onClick={() => setShowSuccessState(false)}
                    variant="outline"
                    className="w-full"
                  >
                    Send Another Link
                  </Button>
                  <Button 
                    onClick={() => router.push("/auth/login")}
                    className="w-full"
                  >
                    Back to Login
                  </Button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Trust indicator */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.4 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <Shield className="w-4 h-4 text-green-600 dark:text-green-400" />
            <span className="text-xs text-green-700 dark:text-green-300 font-medium">
              Secure Password Reset
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 
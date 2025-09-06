"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle, Shield, ArrowRight } from "lucide-react";

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

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessState, setShowSuccessState] = useState(false);
  const [sessionValid, setSessionValid] = useState(true);

  useEffect(() => {
    // Check if there's a session when the component mounts
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        setError("Invalid or expired reset link. Please try again.");
        setSessionValid(false);
      }
    };

    checkSession();
  }, []);

  // Password strength calculation
  const passwordStrength = () => {
    if (!password) return 0;
    let score = 0;
    
    if (password.length >= 12) score += 30;
    else if (password.length >= 8) score += 20;
    else if (password.length >= 6) score += 10;
    
    if (/[A-Z]/.test(password)) score += 20;
    if (/[a-z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 20;
    
    return Math.min(100, score);
  };

  const getStrengthText = () => {
    const strength = passwordStrength();
    if (strength >= 90) return "Excellent";
    if (strength >= 70) return "Strong";
    if (strength >= 50) return "Good";
    if (strength >= 30) return "Fair";
    if (strength > 0) return "Weak";
    return "";
  };

  const getStrengthColor = () => {
    const strength = passwordStrength();
    if (strength >= 90) return "bg-green-600";
    if (strength >= 70) return "bg-green-500";
    if (strength >= 50) return "bg-yellow-500";
    if (strength >= 30) return "bg-orange-500";
    return "bg-red-500";
  };

  const getPasswordRequirements = () => {
    return [
      { label: "At least 8 characters", met: password.length >= 8 },
      { label: "Contains uppercase letter", met: /[A-Z]/.test(password) },
      { label: "Contains lowercase letter", met: /[a-z]/.test(password) },
      { label: "Contains number", met: /[0-9]/.test(password) },
      { label: "Contains special character", met: /[^A-Za-z0-9]/.test(password) },
    ];
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate passwords
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;
      
      setShowSuccessState(true);
    } catch (error: any) {
      setError(error.message || "Failed to update password");
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
                      Set new password
                    </h1>
                    <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
                      Choose a strong password to secure your account
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

                {!sessionValid && (
                  <div className="text-center">
                    <Button onClick={() => router.push("/auth/reset-password")}>
                      Request New Reset Link
                    </Button>
                  </div>
                )}

                {sessionValid && (
                  <form onSubmit={handleUpdatePassword} className="space-y-6">
                    {/* Password Field */}
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.3 }}
                    >
                      <label
                        htmlFor="password"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          placeholder="Enter your new password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <motion.div 
                          className="absolute bottom-0 left-0 h-[2px] bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: password ? "100%" : "0%" }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      
                      {password && (
                        <motion.div 
                          className="mt-3 space-y-3"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          transition={{ duration: 0.3 }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-xs text-muted-foreground font-medium">Password strength</div>
                            <div className={`text-xs font-semibold ${
                              passwordStrength() >= 90 ? 'text-green-600' : 
                              passwordStrength() >= 70 ? 'text-green-500' : 
                              passwordStrength() >= 50 ? 'text-yellow-600' : 
                              passwordStrength() >= 30 ? 'text-orange-600' : 'text-red-600'
                            }`}>
                              {getStrengthText()}
                            </div>
                          </div>
                          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                            <motion.div 
                              className={`h-full rounded-full ${getStrengthColor()}`}
                              initial={{ width: 0 }}
                              animate={{ width: `${passwordStrength()}%` }}
                              transition={{ duration: 0.3 }}
                            />
                          </div>
                          
                          {/* Password requirements */}
                          <div className="grid grid-cols-1 gap-2 mt-3">
                            {getPasswordRequirements().map((req, index) => (
                              <motion.div
                                key={req.label}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.2 }}
                                className={`flex items-center gap-2 text-xs ${
                                  req.met ? 'text-green-600' : 'text-muted-foreground'
                                }`}
                              >
                                <div className={`w-1.5 h-1.5 rounded-full ${
                                  req.met ? 'bg-green-500' : 'bg-muted-foreground/30'
                                }`} />
                                <span>{req.label}</span>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Confirm Password Field */}
                    <motion.div 
                      className="space-y-2"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.3 }}
                    >
                      <label
                        htmlFor="confirmPassword"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          className={`flex h-11 w-full rounded-md border bg-background px-3 py-2 pr-10 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                            confirmPassword && password !== confirmPassword 
                              ? 'border-red-500 focus-visible:ring-red-500' 
                              : confirmPassword && password === confirmPassword
                              ? 'border-green-500 focus-visible:ring-green-500'
                              : 'border-input focus-visible:ring-ring'
                          }`}
                          placeholder="Confirm your new password"
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button 
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                        <motion.div 
                          className={`absolute bottom-0 left-0 h-[2px] ${
                            confirmPassword && password !== confirmPassword 
                              ? 'bg-red-500' 
                              : confirmPassword && password === confirmPassword
                              ? 'bg-green-500'
                              : 'bg-primary'
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: confirmPassword ? "100%" : "0%" }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      {confirmPassword && password !== confirmPassword && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-600 flex items-center gap-1"
                        >
                          <AlertCircle size={12} />
                          Passwords don't match
                        </motion.p>
                      )}
                    </motion.div>

                    {/* Submit Button */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.3 }}
                      whileHover={{ scale: loading ? 1 : 1.02 }}
                      whileTap={{ scale: loading ? 1 : 0.98 }}
                      className="mt-8"
                    >
                      <Button 
                        type="submit" 
                        className="w-full h-12 relative overflow-hidden group"
                        disabled={loading || password !== confirmPassword || !password || passwordStrength() < 50}
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {loading ? (
                            <>
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              >
                                <Lock className="h-4 w-4" />
                              </motion.div>
                              Updating password...
                            </>
                          ) : (
                            <>
                              <Lock className="h-4 w-4" />
                              Update Password
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
                )}
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
                    Password Updated Successfully!
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    Your password has been updated. You can now sign in with your new password.
                  </p>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <div className="text-sm text-left">
                      <p className="font-medium text-green-900 dark:text-green-100 mb-1">
                        Your account is now secure
                      </p>
                      <p className="text-green-700 dark:text-green-300 text-xs">
                        Remember to use a unique password and enable two-factor authentication for additional security.
                      </p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Button 
                    onClick={() => router.push("/auth/login?message=Password updated successfully! Please sign in.")}
                    className="w-full group"
                  >
                    <span>Continue to Login</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
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
              Bank-level Password Security
            </span>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 
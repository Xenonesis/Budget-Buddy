"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useUserPreferences } from "@/hooks/use-user-preferences";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, UserPlus, ChevronLeft, AlertCircle, Info, CheckCircle, Shield, Lock, Users, Star, Mail, Phone, CreditCard } from "lucide-react";
import { Logo } from "@/components/ui/logo";

// Custom Auth Logo component to ensure proper styling
const AuthLogo = () => (
  <div className="flex items-center gap-2">
    <motion.div
      className="relative"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative flex items-center justify-center h-20 w-20 sm:h-24 sm:w-24 transition-all duration-300">
        <Image 
          src="/logo.svg" 
          alt="Budget Buddy Logo" 
          width={56} 
          height={56} 
          className="h-14 w-14 sm:h-16 sm:w-16 transition-all duration-300"
          priority={true} 
        />
      </div>
      <motion.div 
        className="absolute inset-0 rounded-full bg-primary/10 blur-sm -z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      ></motion.div>
    </motion.div>
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.3 }}
    >
      <motion.span
        className="font-bold tracking-tight bg-gradient-to-r from-primary via-violet-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)] text-2xl sm:text-3xl"
        whileHover={{ 
          textShadow: "0 0 8px rgba(124, 58, 237, 0.5)",
          scale: 1.02,
          transition: { duration: 0.2 }
        }}
      >
        Budget Buddy
      </motion.span>
      <motion.div 
        className="absolute -inset-1 bg-primary/5 blur-sm rounded-lg -z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.3 }}
      ></motion.div>
    </motion.div>
  </div>
);

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const { resetPreferences } = useUserPreferences();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!acceptedTerms) {
      setError("Please accept the Terms of Service and Privacy Policy");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Reset preferences for a clean state
      resetPreferences();
      
      console.log("Starting registration process...");
      console.log("Email:", email);
      console.log("Name:", name);
      
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            preferred_currency: 'USD',
          },
          emailRedirectTo: `${window.location.origin}/auth/login?message=Account confirmed! Please sign in.`
        }
      });

      console.log("Signup response:", { data, error: signUpError });

      if (signUpError) {
        console.error("Signup error details:", {
          message: signUpError.message,
          status: signUpError.status,
          code: signUpError.code,
          details: signUpError
        });
        throw signUpError;
      }

      console.log("User created successfully:", data.user?.id);

      if (data.user) {
        console.log("Attempting to create profile manually...");
        
        // Try to create the profile manually (in addition to any trigger)
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: email,
            name: name,
            currency: 'USD'
          });
          
        console.log("Profile creation result:", { error: profileError });
          
        // Handle profile creation errors
        if (profileError) {
          console.error("Profile creation error details:", {
            message: profileError.message,
            code: profileError.code,
            details: profileError.details,
            hint: profileError.hint
          });
          
          // If it's not a duplicate key error (23505), it might be a permissions issue
          if (profileError.code !== '23505') {
            // Try to handle the error gracefully
            console.warn("Profile creation failed, but user account was created. Profile may be created by trigger.");
            
            // Don't throw error here - the trigger might have handled it
            console.log("Continuing despite profile creation error...");
          }
        } else {
          console.log("Profile created successfully!");
        }
      }

      console.log("Registration completed successfully!");
      setShowSuccessMessage(true);
    } catch (error: any) {
      console.error("Registration failed:", {
        message: error.message,
        status: error.status,
        code: error.code,
        stack: error.stack
      });
      setError(error.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    if (!password) return 0;
    let score = 0;
    
    // Length check
    if (password.length >= 12) score += 30;
    else if (password.length >= 8) score += 20;
    else if (password.length >= 6) score += 10;
    
    // Complexity checks
    if (/[A-Z]/.test(password)) score += 20; // Has uppercase
    if (/[a-z]/.test(password)) score += 15; // Has lowercase
    if (/[0-9]/.test(password)) score += 15; // Has number
    if (/[^A-Za-z0-9]/.test(password)) score += 20; // Has special char
    
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

  // Trust indicators
  const trustIndicators = [
    { icon: Shield, label: "Bank-level Security" },
    { icon: Lock, label: "End-to-end Encryption" }
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-gradient-to-br from-background via-background/95 to-primary/5 relative overflow-hidden overflow-x-hidden">
      {/* Enhanced background gradient elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <motion.div 
          className="absolute -top-[10%] right-[20%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-3xl opacity-60"
          animate={{ 
            x: [0, 10, 0], 
            y: [0, 15, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 12, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
        />
        <motion.div 
          className="absolute -bottom-[20%] left-[10%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-3xl opacity-60"
          animate={{ 
            x: [0, -10, 0], 
            y: [0, -15, 0],
            scale: [1, 1.05, 1]
          }}
          transition={{ 
            duration: 10, 
            repeat: Infinity,
            repeatType: "reverse" 
          }}
        />
        {/* Additional background elements */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent" />
      </div>

      {/* Success Message Overlay */}
      <AnimatePresence>
        {showSuccessMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="bg-card/95 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-primary/20 max-w-md w-full mx-4"
            >
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
                  className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center"
                >
                  <Mail className="w-8 h-8 text-green-600 dark:text-green-400" />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="space-y-2"
                >
                  <h3 className="text-xl font-semibold text-foreground">Check your email!</h3>
                  <p className="text-muted-foreground text-sm">
                    We've sent you a confirmation link at <br />
                    <span className="font-medium text-foreground">{email}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-3">
                    Click the link in your email to activate your account
                  </p>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="pt-2"
                >
                  <Button 
                    onClick={() => router.push("/auth/login")}
                    className="w-full"
                  >
                    Continue to Login
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md space-y-6 relative z-10"
      >
        <Link 
          href="/" 
          className="absolute -top-12 left-0 text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 group"
        >
          <ChevronLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to home
        </Link>

        <div className="bg-background/80 backdrop-blur-lg rounded-2xl border border-white/10 shadow-xl p-8 relative overflow-hidden">
          {/* Enhanced background animation */}
          <div className="absolute inset-0 -z-10">
            <motion.div 
              className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 via-violet-500/3 to-transparent rounded-2xl"
              animate={{ 
                backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
              }}
              transition={{ 
                duration: 20, 
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                backgroundSize: '300% 300%'
              }}
            />
          </div>

          <motion.div 
            className="space-y-4 text-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <motion.div
              className="mx-auto mb-6 relative"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ 
                delay: 0.2, 
                duration: 0.4, 
                type: "spring", 
                stiffness: 200 
              }}
            >
              <AuthLogo />
            </motion.div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary via-violet-500 to-indigo-500 bg-clip-text text-transparent">
              Create your account
            </h1>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Join thousands of users managing their finances with <br />
              <span className="font-medium text-foreground">Budget Buddy</span>
            </p>
          </motion.div>

          {error && (
            <motion.div 
              className="mt-6 rounded-lg bg-destructive/10 p-3 text-sm border border-destructive/20 flex items-center gap-2 text-destructive"
              initial={{ opacity: 0, height: 0, y: -10 }}
              animate={{ opacity: 1, height: "auto", y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          <motion.form 
            onSubmit={handleRegister} 
            className="space-y-5 mt-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <label
                htmlFor="name"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Full Name
              </label>
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <motion.div 
                  className="absolute bottom-0 left-0 h-[2px] bg-primary"
                  initial={{ width: 0 }}
                  whileInView={{ width: name ? "100%" : "0%" }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.3 }}
            >
              <label
                htmlFor="email"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Email
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
                  whileInView={{ width: email ? "100%" : "0%" }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>

            <motion.div 
              className="space-y-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.3 }}
            >
              <label
                htmlFor="password"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
                  whileInView={{ width: password ? "100%" : "0%" }}
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
              transition={{ delay: 0.7, duration: 0.3 }}
            >
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className={`flex h-11 w-full rounded-md border bg-background px-3 py-2 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                    confirmPassword && password !== confirmPassword 
                      ? 'border-red-500 focus-visible:ring-red-500' 
                      : confirmPassword && password === confirmPassword
                      ? 'border-green-500 focus-visible:ring-green-500'
                      : 'border-input'
                  }`}
                  placeholder="Confirm your password"
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
                  whileInView={{ width: confirmPassword ? "100%" : "0%" }}
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

            {/* Terms and Conditions */}
            <motion.div
              className="space-y-3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.3 }}
            >
              <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border border-muted">
                <input
                  id="terms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 text-primary bg-background border-input rounded focus:ring-primary focus:ring-2"
                />
                <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed">
                  I agree to the{" "}
                  <Link href="/legal/terms-of-service" className="text-primary hover:underline font-medium">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/legal/privacy-policy" className="text-primary hover:underline font-medium">
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.3 }}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="mt-8"
            >
              <Button 
                type="submit" 
                className="w-full h-12 relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || !acceptedTerms || password !== confirmPassword || !password || !email || !name}
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  {loading ? "Creating account..." : "Create Account"}
                </span>
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-primary to-violet-600"
                  animate={{ 
                    x: loading ? "0%" : ["0%", "100%"],
                  }}
                  transition={{ 
                    duration: loading ? 0 : 2, 
                    repeat: loading ? 0 : Infinity,
                    repeatType: "reverse"
                  }}
                />
              </Button>
            </motion.div>

            {/* Benefits highlight */}
            <motion.div 
              className="rounded-lg bg-primary/5 p-4 border border-primary/10 flex gap-3 text-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.3 }}
            >
              <div className="flex-shrink-0 mt-0.5">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Start Managing Your Money Today</p>
                <ul className="text-muted-foreground text-xs space-y-1">
                  <li>• Track expenses automatically</li>
                  <li>• Set budgets and savings goals</li>
                  <li>• Get personalized insights</li>
                  <li>• Bank-level security protection</li>
                </ul>
              </div>
            </motion.div>
          </motion.form>

          <motion.div 
            className="text-center text-sm mt-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.3 }}
          >
            Already have an account?{" "}
            <Link
              href="/auth/login"
              className="text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline font-semibold"
            >
              Sign in
            </Link>
          </motion.div>
        </div>

        {/* Trust indicators */}
        <motion.div
          className="mt-6 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.4 }}
        >
          <div className="text-center">
            <p className="text-xs text-muted-foreground font-medium mb-3">
              Trusted by professionals worldwide
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {trustIndicators.map(({ icon: Icon, label }, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 1.3 + (index * 0.1), duration: 0.3 }}
                className="flex items-center justify-center gap-2 p-3 rounded-lg bg-card/50 backdrop-blur-sm border border-white/5 hover:bg-card/70 transition-colors duration-300"
              >
                <Icon className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground font-medium">{label}</span>
              </motion.div>
            ))}
          </div>
          
          {/* SSL Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.7, duration: 0.3 }}
            className="text-center pt-2"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-700 dark:text-green-300 font-medium">
                256-bit SSL Encryption
              </span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
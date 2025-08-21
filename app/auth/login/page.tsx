"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { 
  AuthLogo, 
  AuthCard, 
  LoginForm, 
  ForgotPasswordLink, 
  SignUpPrompt, 
  AnimatedBackground, 
  BackToHomeLink 
} from "@/components/auth";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleLoginSuccess = () => {
    router.push("/dashboard");
    router.refresh();
  };

  const handleLoginError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-background relative overflow-hidden">
      <AnimatedBackground />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6 relative z-10"
      >
        <BackToHomeLink />

        <AuthCard 
          title="Welcome back" 
          subtitle="Sign in to your account to continue your financial journey"
          error={error}
        >
          <AuthLogo />
        </AuthCard>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="bg-background/60 backdrop-blur-sm rounded-xl border border-muted/30 p-6 shadow-lg"
        >
          <LoginForm 
            onSuccess={handleLoginSuccess}
            onError={handleLoginError}
          />
          
          <motion.div
            className="mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
          >
            <ForgotPasswordLink />
          </motion.div>
        </motion.div>

        <SignUpPrompt />

        {/* Trust indicators */}
        <motion.div
          className="text-center space-y-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.3 }}
        >
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Secure</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Encrypted</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span>Private</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 
"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  Brain, 
  Zap, 
  Shield, 
  Key, 
  ExternalLink,
  CheckCircle,
  ArrowRight
} from "lucide-react";

interface EmptyStateProps {
  onConfigureSettings: () => void;
}

export function EmptyState({ onConfigureSettings }: EmptyStateProps) {
  const features = [
    {
      icon: <Brain className="h-5 w-5 text-blue-500" />,
      title: "Smart Financial Analysis",
      description: "Get AI-powered insights about your spending patterns and financial health"
    },
    {
      icon: <Zap className="h-5 w-5 text-yellow-500" />,
      title: "Interactive Chat Assistant",
      description: "Ask questions about your finances and get instant, personalized answers"
    },
    {
      icon: <Shield className="h-5 w-5 text-green-500" />,
      title: "Secure & Private",
      description: "Your financial data stays secure with encrypted API communications"
    }
  ];

  const providers = [
    { name: "Google Gemini", icon: "💎", description: "Fast and efficient" },
    { name: "Mistral AI", icon: "🚀", description: "Open source excellence" },
    { name: "Claude", icon: "🧠", description: "Advanced reasoning" },
    { name: "OpenAI GPT", icon: "🤖", description: "Industry leading" }
  ];

  return (
    <div className="container mx-auto p-4 md:p-6">
      <Card className="max-w-4xl mx-auto">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl mb-2">AI Features Not Enabled</CardTitle>
          <CardDescription className="text-base max-w-2xl mx-auto">
            Unlock the power of AI to get personalized financial insights, smart recommendations, 
            and an interactive assistant that understands your financial goals.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8">
          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="text-center space-y-3">
                <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="font-semibold">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

          {/* Setup Steps */}
          <div className="bg-muted/30 rounded-lg p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Key className="h-5 w-5" />
              Quick Setup Guide
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <span className="text-sm">Choose your preferred AI provider</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <span className="text-sm">Get a free API key from the provider</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <span className="text-sm">Add the API key to your settings</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center">
                  <CheckCircle className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-green-700 dark:text-green-400">
                  Start getting AI insights!
                </span>
              </div>
            </div>
          </div>

          {/* Supported Providers */}
          <div>
            <h3 className="font-semibold mb-4 text-center">Supported AI Providers</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {providers.map((provider, index) => (
                <div key={index} className="text-center p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="text-2xl mb-2">{provider.icon}</div>
                  <div className="font-medium text-sm">{provider.name}</div>
                  <div className="text-xs text-muted-foreground">{provider.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-lg p-6">
            <h3 className="font-semibold mb-3 text-center">What You'll Get</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Personalized spending insights</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Budget optimization suggestions</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Interactive financial Q&A</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span>Trend analysis and forecasting</span>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="flex flex-col sm:flex-row gap-3 pt-6">
          <Button onClick={onConfigureSettings} className="flex-1 sm:flex-none">
            <Settings className="h-4 w-4 mr-2" />
            Configure AI Settings
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
          <Button variant="outline" className="flex-1 sm:flex-none">
            <ExternalLink className="h-4 w-4 mr-2" />
            Learn More
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
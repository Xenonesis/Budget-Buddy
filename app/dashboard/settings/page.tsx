"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useUserPreferences } from "@/lib/store";
import { FileText, User, Palette, Bell, Bot, LogOut, LayoutGrid } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input, Textarea } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { AIProvider, AIModel } from "@/lib/ai";
import { getAvailableModelsForProvider } from "@/lib/ai";

interface Profile {
  id: string;
  email: string;
  name: string | null;
  currency: string;
  created_at: string;
  updated_at: string;
  phone?: string;
  address?: string;
  preferred_language?: string;
  notification_preferences?: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  profile_photo?: string;
  gender?: string;
  timezone?: string;
  ai_settings: {
      google_api_key: string;
      mistral_api_key: string;
      anthropic_api_key: string;
      groq_api_key: string;
      deepseek_api_key: string;
      llama_api_key: string;
      cohere_api_key: string;
      gemini_api_key: string;
      qwen_api_key: string;
      openrouter_api_key: string;
      cerebras_api_key: string;
      xai_api_key: string;
      unbound_api_key: string;
      openai_api_key: string;
      ollama_api_key: string;
      lmstudio_api_key: string;
      enabled: boolean;
      mistral_model: string;
      defaultModel: {
        provider: 'mistral' | 'google' | 'anthropic' | 'groq' | 'deepseek' | 'llama' | 'cohere' | 'gemini' | 'qwen' | 'openrouter' | 'cerebras' | 'xAI' | 'unbound' | 'openai' | 'ollama' | 'lmstudio';
        model: string;
      };
    };
}

interface AuthUser {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at?: string;
  email_confirmed_at?: string;
  app_metadata?: {
    provider?: string;
  };
  user_metadata?: {
    name?: string;
    preferred_currency?: string;
  };
}

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { 
    username, setCurrency, setUsername, theme, setTheme, 
    syncWithDatabase, setUserId 
  } = useUserPreferences();
  const [activeTab, setActiveTab] = useState<"profile" | "preferences" | "notifications" | "ai" | "dashboard">("profile");
  
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    currency: string;
    phone: string;
    address: string;
    preferred_language: string;
    profile_photo: string;
    gender: string;
    timezone: string;
    notification_preferences: {
      email: boolean;
      push: boolean;
      sms: boolean;
    } | undefined;
    ai_settings: Profile['ai_settings'];
  }>({
    name: "",
    email: "",
    currency: "USD",
    phone: "",
    address: "",
    preferred_language: "en",
    profile_photo: "",
    gender: "prefer-not-to-say",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    notification_preferences: {
      email: true,
      push: false,
      sms: false
    },
    ai_settings: {
      google_api_key: "",
      mistral_api_key: "",
      anthropic_api_key: "",
      groq_api_key: "",
      deepseek_api_key: "",
      llama_api_key: "",
      cohere_api_key: "",
      gemini_api_key: "",
      qwen_api_key: "",
      openrouter_api_key: "",
      cerebras_api_key: "",
      xai_api_key: "",
      unbound_api_key: "",
      openai_api_key: "",
      ollama_api_key: "",
      lmstudio_api_key: "",
      mistral_model: "mistral-small",
      enabled: false,
      defaultModel: {
        provider: 'mistral' as AIProvider,
        model: 'mistral-small' as AIModel
      }
    } as NonNullable<Profile['ai_settings']>
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [themeChoice, setThemeChoice] = useState<"light" | "dark" | "system">(theme || "system");
  const [availableModels, setAvailableModels] = useState<Record<string, AIModel[]>>({});
  const [loadingModels, setLoadingModels] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  // Fetch models when the default provider changes
  useEffect(() => {
    const currentProvider = formData.ai_settings?.defaultModel?.provider;
    if (currentProvider) {
      fetchAvailableModels(currentProvider);
    }
  }, [formData.ai_settings?.defaultModel?.provider]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/auth/login");
        return;
      }

      console.log("Auth user data:", userData.user);
      
      // Map the Supabase User to AuthUser interface
      const mappedAuthUser: AuthUser = {
        id: userData.user.id,
        email: userData.user.email || '',
        created_at: userData.user.created_at,
        last_sign_in_at: userData.user.last_sign_in_at,
        email_confirmed_at: userData.user.email_confirmed_at,
        app_metadata: userData.user.app_metadata,
        user_metadata: userData.user.user_metadata
      };
      
      setAuthUser(mappedAuthUser);
      
      // Set user ID in preferences store
      setUserId(userData.user.id);

      // Check if a profile exists for this user
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userData.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        
        // If the profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          console.log("Profile not found, creating a new one...");
          
          const newProfile = {
            id: userData.user.id,
            email: userData.user.email,
            name: userData.user.user_metadata?.name || userData.user.email?.split('@')[0] || '',
            currency: userData.user.user_metadata?.preferred_currency || 'USD',
            phone: userData.user.user_metadata?.phone || '',
            address: userData.user.user_metadata?.address || '',
            preferred_language: userData.user.user_metadata?.preferred_language || 'en',
            notification_preferences: userData.user.user_metadata?.notification_preferences || {
              email: true,
              push: false,
              sms: false
            },
            profile_photo: userData.user.user_metadata?.profile_photo || '',
            gender: userData.user.user_metadata?.gender || '',
            timezone: userData.user.user_metadata?.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
            ai_settings: userData.user.user_metadata?.ai_settings || {
              google_api_key: '',
              mistral_api_key: '',
              anthropic_api_key: '',
              groq_api_key: '',
              deepseek_api_key: '',
              llama_api_key: '',
              cohere_api_key: '',
              gemini_api_key: '',
              qwen_api_key: '',
              openrouter_api_key: '',
              mistral_model: 'mistral-small',
              enabled: false,
              defaultModel: {
                provider: 'mistral' as AIProvider,
                model: 'mistral-small' as AIModel
              }
            },
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          const { error: insertError } = await supabase
            .from("profiles")
            .insert(newProfile);
            
          if (insertError) {
            console.error("Error creating profile:", insertError);
          } else {
            console.log("New profile created successfully");
            setProfile(newProfile as Profile);
            
            // Update the global store
            setUsername(newProfile.name || '');
            setCurrency(newProfile.currency);
            
            setFormData({
              name: newProfile.name || '',
              email: newProfile.email || '',
              currency: newProfile.currency,
              phone: newProfile.phone || '',
              address: newProfile.address || '',
              preferred_language: newProfile.preferred_language || 'en',
              profile_photo: newProfile.profile_photo || '',
              gender: newProfile.gender || 'prefer-not-to-say',
              timezone: newProfile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
              notification_preferences: newProfile.notification_preferences || {
                email: true,
                push: false,
                sms: false
              } as Profile['notification_preferences'],
              ai_settings: {
                google_api_key: "",
                mistral_api_key: "",
                anthropic_api_key: "",
                groq_api_key: "",
                deepseek_api_key: "",
                llama_api_key: "",
                cohere_api_key: "",
                gemini_api_key: "",
                qwen_api_key: "",
                openrouter_api_key: "",
                mistral_model: "mistral-small",
                enabled: false,
                defaultModel: {
                  provider: 'mistral' as AIProvider,
                  model: 'mistral-small' as AIModel
                }
              } as NonNullable<Profile['ai_settings']>
            });
          }
        }
      } else {
        setProfile(data as Profile);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          currency: data.currency,
          phone: data.phone || '',
          address: data.address || '',
          preferred_language: data.preferred_language || 'en',
          profile_photo: data.profile_photo || '',
          gender: data.gender || 'prefer-not-to-say',
          timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          notification_preferences: data.notification_preferences || {
            email: true,
            push: false,
            sms: false
          } as Profile['notification_preferences'],
          ai_settings: data.ai_settings || {
            google_api_key: "",
            mistral_api_key: "",
            anthropic_api_key: "",
            groq_api_key: "",
            deepseek_api_key: "",
            llama_api_key: "",
            cohere_api_key: "",
            gemini_api_key: "",
            qwen_api_key: "",
            openrouter_api_key: "",
            mistral_model: "mistral-small",
            enabled: false,
            defaultModel: {
              provider: 'mistral' as AIProvider,
              model: 'mistral-small' as AIModel
            }
          } as NonNullable<Profile['ai_settings']>
        });
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/auth/login");
        return;
      }

      const updatedProfile: Profile = {
        id: userData.user.id,
        email: formData.email,
        name: formData.name,
        currency: formData.currency,
        phone: formData.phone,
        address: formData.address,
        preferred_language: formData.preferred_language,
        profile_photo: formData.profile_photo,
        gender: formData.gender,
        timezone: formData.timezone,
        notification_preferences: formData.notification_preferences,
        ai_settings: formData.ai_settings,
        created_at: profile?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: updatedUserData, error: updateError } = await supabase
        .from("profiles")
        .update(updatedProfile)
        .eq("id", userData.user.id);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        setMessage({ type: "error", text: "Failed to update profile. Please try again later." });
      } else {
        console.log("Profile updated successfully");
        setProfile(updatedProfile);
        setFormData({
          name: updatedProfile.name || '',
          email: updatedProfile.email || '',
          currency: updatedProfile.currency,
          phone: updatedProfile.phone || '',
          address: updatedProfile.address || '',
          preferred_language: updatedProfile.preferred_language || 'en',
          profile_photo: updatedProfile.profile_photo || '',
          gender: updatedProfile.gender || 'prefer-not-to-say',
          timezone: updatedProfile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          notification_preferences: updatedProfile.notification_preferences || {
            email: true,
            push: false,
            sms: false
          } as Profile['notification_preferences'],
          ai_settings: updatedProfile.ai_settings || {
            google_api_key: "",
            mistral_api_key: "",
            anthropic_api_key: "",
            groq_api_key: "",
            deepseek_api_key: "",
            llama_api_key: "",
            cohere_api_key: "",
            gemini_api_key: "",
            qwen_api_key: "",
            openrouter_api_key: "",
            mistral_model: "mistral-small",
            enabled: false,
            defaultModel: {
              provider: 'mistral' as AIProvider,
              model: 'mistral-small' as AIModel
            }
          } as Profile['ai_settings']
        });
        setMessage({ type: "success", text: "Profile updated successfully" });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "Failed to update profile. Please try again later." });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleNotificationChange = (field: keyof NonNullable<Profile['notification_preferences']>, checked: boolean) => {
    setFormData({
      ...formData,
      notification_preferences: {
        ...formData.notification_preferences,
        [field]: checked
      } as Profile['notification_preferences']
    });
  };

  const handleAiSettingsChange = (field: keyof NonNullable<Profile['ai_settings']>, value: any) => {
    setFormData({
      ...formData,
      ai_settings: {
        ...formData.ai_settings,
        [field]: value
      } as NonNullable<Profile['ai_settings']>
    });
  };

  const handleAiModelChange = (provider: string, model: string) => {
    setFormData({
      ...formData,
      ai_settings: {
        ...formData.ai_settings,
        defaultModel: {
          provider: provider as AIProvider,
          model: model
        }
      }
    });
  };

  const handleThemeChange = (value: "light" | "dark" | "system") => {
    setThemeChoice(value);
    setTheme(value);
  };

  const fetchAvailableModels = async (provider: string) => {
    // Don't fetch if we already have the models or if we're already fetching
    if (availableModels[provider] || loadingModels[provider]) return;
    
    setLoadingModels(prev => ({ ...prev, [provider]: true }));
    
    try {
      // Get the API key for this provider
      let apiKey = '';
      switch (provider) {
        case 'mistral':
          apiKey = formData.ai_settings?.mistral_api_key || '';
          break;
        case 'anthropic':
          apiKey = formData.ai_settings?.anthropic_api_key || '';
          break;
        case 'groq':
          apiKey = formData.ai_settings?.groq_api_key || '';
          break;
        case 'deepseek':
          apiKey = formData.ai_settings?.deepseek_api_key || '';
          break;
        case 'llama':
          apiKey = formData.ai_settings?.llama_api_key || '';
          break;
        case 'cohere':
          apiKey = formData.ai_settings?.cohere_api_key || '';
          break;
        case 'gemini':
          apiKey = formData.ai_settings?.gemini_api_key || formData.ai_settings?.google_api_key || '';
          break;
        case 'qwen':
          apiKey = formData.ai_settings?.qwen_api_key || '';
          break;
        case 'openrouter':
          apiKey = formData.ai_settings?.openrouter_api_key || '';
          break;
        case 'cerebras':
          apiKey = formData.ai_settings?.cerebras_api_key || '';
          break;
        case 'xAI':
          apiKey = formData.ai_settings?.xai_api_key || '';
          break;
        case 'unbound':
          apiKey = formData.ai_settings?.unbound_api_key || '';
          break;
        case 'openai':
          apiKey = formData.ai_settings?.openai_api_key || '';
          break;
        case 'ollama':
          apiKey = formData.ai_settings?.ollama_api_key || '';
          break;
        case 'lmstudio':
          apiKey = formData.ai_settings?.lmstudio_api_key || '';
          break;
      }
      
      // If no API key, use default models
      if (!apiKey) {
        setAvailableModels(prev => ({ ...prev, [provider]: [] }));
        setLoadingModels(prev => ({ ...prev, [provider]: false }));
        return;
      }
      
      // Fetch available models
      const models = await getAvailableModelsForProvider(provider as AIProvider, apiKey);
      
      if (models) {
        setAvailableModels(prev => ({ ...prev, [provider]: models }));
      } else {
        // If fetching failed, use default models
        setAvailableModels(prev => ({ ...prev, [provider]: [] }));
      }
    } catch (error) {
      console.error(`Error fetching models for ${provider}:`, error);
      setAvailableModels(prev => ({ ...prev, [provider]: [] }));
    } finally {
      setLoadingModels(prev => ({ ...prev, [provider]: false }));
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const exportProfileToPDF = async () => {
    try {
      setSaving(true);
      
      // Dynamic import to reduce bundle size
      let jsPDF;
      try {
        const jsPDFModule = await import('jspdf');
        jsPDF = jsPDFModule.default;
      } catch (importError) {
        console.error("Failed to load jspdf:", importError);
        toast.error("PDF export functionality is not available. Please try again later.");
        return;
      }
      
      // Create document
      const doc = new jsPDF();
      
      // Add title and styling
      doc.setFontSize(20);
      doc.setTextColor(44, 62, 80);
      doc.text("User Profile", 105, 20, { align: 'center' });
      
      // Add horizontal line
      doc.setDrawColor(52, 152, 219);
      doc.setLineWidth(0.5);
      doc.line(20, 25, 190, 25);
      
      // Add profile information
      doc.setFontSize(12);
      doc.setTextColor(52, 73, 94);
      
      let yPosition = 40;
      const leftMargin = 20;
      const lineHeight = 10;
      
      // Add user details
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("Personal Information", leftMargin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      
      yPosition += lineHeight + 5;
      doc.text(`Name: ${formData.name || 'Not provided'}`, leftMargin, yPosition);
      
      yPosition += lineHeight;
      doc.text(`Email: ${formData.email}`, leftMargin, yPosition);
      
      yPosition += lineHeight;
      doc.text(`Phone: ${formData.phone || 'Not provided'}`, leftMargin, yPosition);
      
      yPosition += lineHeight;
      doc.text(`Address: ${formData.address || 'Not provided'}`, leftMargin, yPosition);
      
      yPosition += lineHeight + 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("Preferences", leftMargin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      
      yPosition += lineHeight + 5;
      doc.text(`Currency: ${formData.currency}`, leftMargin, yPosition);
      
      yPosition += lineHeight;
      doc.text(`Language: ${formData.preferred_language || 'English'}`, leftMargin, yPosition);
      
      yPosition += lineHeight;
      doc.text(`Theme: ${themeChoice}`, leftMargin, yPosition);

      yPosition += lineHeight;
      doc.text(`Gender: ${formData.gender === 'prefer-not-to-say' ? 'Not specified' : formData.gender || 'Not specified'}`, leftMargin, yPosition);
      
      yPosition += lineHeight;
      doc.text(`Timezone: ${formData.timezone || 'UTC'}`, leftMargin, yPosition);
      
      yPosition += lineHeight + 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("Notification Preferences", leftMargin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      
      yPosition += lineHeight + 5;
      doc.text(`Email notifications: ${formData.notification_preferences?.email ? 'Enabled' : 'Disabled'}`, leftMargin, yPosition);
      
      yPosition += lineHeight;
      doc.text(`Push notifications: ${formData.notification_preferences?.push ? 'Enabled' : 'Disabled'}`, leftMargin, yPosition);
      
      yPosition += lineHeight;
      doc.text(`SMS notifications: ${formData.notification_preferences?.sms ? 'Enabled' : 'Disabled'}`, leftMargin, yPosition);
      
      yPosition += lineHeight + 10;
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text("AI Assistant Settings", leftMargin, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      
      yPosition += lineHeight + 5;
      doc.text(`AI Assistant: ${formData.ai_settings?.enabled ? 'Enabled' : 'Disabled'}`, leftMargin, yPosition);
      
      yPosition += lineHeight;
      doc.text(`AI Assistant: ${formData.ai_settings?.enabled ? 'Enabled' : 'Disabled'}`, leftMargin, yPosition);
      
      yPosition += lineHeight;
      doc.text(`Google AI API Key: ${formData.ai_settings?.google_api_key ? '**********' : 'Not set'}`, leftMargin, yPosition);
      
      yPosition += lineHeight;
      doc.text(`Mistral AI API Key: ${formData.ai_settings?.mistral_api_key ? '**********' : 'Not set'}`, leftMargin, yPosition);
      
      yPosition += lineHeight;
      doc.text(`Claude (Anthropic) API Key: ${formData.ai_settings?.anthropic_api_key ? '**********' : 'Not set'}`, leftMargin, yPosition);
      
      yPosition += lineHeight;
      doc.text(`Groq API Key: ${formData.ai_settings?.groq_api_key ? '**********' : 'Not set'}`, leftMargin, yPosition);
      
      yPosition += lineHeight;
      doc.text(`DeepSeek API Key: ${formData.ai_settings?.deepseek_api_key ? '**********' : 'Not set'}`, leftMargin, yPosition);
      
      yPosition += lineHeight;
      doc.text(`Llama API Key: ${formData.ai_settings?.llama_api_key ? '**********' : 'Not set'}`, leftMargin, yPosition);
      
      yPosition += lineHeight;
      doc.text(`Cohere API Key: ${formData.ai_settings?.cohere_api_key ? '**********' : 'Not set'}`, leftMargin, yPosition);
      
      yPosition += lineHeight;
      doc.text(`Gemini API Key: ${formData.ai_settings?.gemini_api_key ? '**********' : 'Not set'}`, leftMargin, yPosition);
      
      yPosition += lineHeight;
      doc.text(`Qwen API Key: ${formData.ai_settings?.qwen_api_key ? '**********' : 'Not set'}`, leftMargin, yPosition);
      
      yPosition += lineHeight;
      doc.text(`OpenRouter API Key: ${formData.ai_settings?.openrouter_api_key ? '**********' : 'Not set'}`, leftMargin, yPosition);
      
      // Add footer with generation date
      doc.setFontSize(10);
      doc.setTextColor(127, 140, 141);
      doc.text(
        `Generated on ${new Date().toLocaleString()}`,
        105,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
      
      // Save PDF
      doc.save(`user_profile_${new Date().toISOString().slice(0,10)}.pdf`);
      
      toast.success("Profile exported to PDF successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to export profile. Please try again later.");
    } finally {
      setSaving(false);
    }
  };

  const getDefaultModelForProvider = (provider: string): string => {
    switch (provider) {
      case 'mistral': return 'mistral-small';
      case 'anthropic': return 'claude-3-5-sonnet';
      case 'groq': return 'llama-3.1-8b';
      case 'deepseek': return 'deepseek-chat';
      case 'llama': return 'llama-3.1-8b';
      case 'cohere': return 'command-r';
      case 'gemini': return 'gemini-1.5-flash';
      case 'qwen': return 'qwen-2.5-7b';
      case 'openrouter': return 'openrouter-default';
      case 'cerebras': return 'cerebras-llama-3.1-8b';
      case 'xAI': return 'grok-2';
      case 'unbound': return 'unbound-llama-3.1-8b';
      case 'openai': return 'gpt-4o';
      case 'ollama': return 'ollama-llama3.1';
      case 'lmstudio': return 'lmstudio-llama3.1';
      default: return 'mistral-small';
    }
  };
  
  const renderModelOptions = (provider: string) => {
    // Get available models for this provider, or use defaults if not fetched
    const models = availableModels[provider] || [];
    const hasFetchedModels = models.length > 0;
    const isLoading = loadingModels[provider];
    
    // If we have fetched models, use them
    if (hasFetchedModels) {
      return (
        <>
          {models.map((model) => (
            <SelectItem key={model} value={model}>
              {model}
            </SelectItem>
          ))}
        </>
      );
    }
    
    // If we're loading, show a loading indicator
    if (isLoading) {
      return <SelectItem value="loading">Loading models...</SelectItem>;
    }
    
    // Otherwise, use the default models based on provider
    switch (provider) {
      case 'mistral':
        return (
          <>
            <SelectItem value="mistral-tiny">Mistral Tiny (Fastest)</SelectItem>
            <SelectItem value="mistral-small">Mistral Small (Balanced)</SelectItem>
            <SelectItem value="mistral-small-latest">Mistral Small Latest</SelectItem>
            <SelectItem value="mistral-medium">Mistral Medium (Advanced)</SelectItem>
            <SelectItem value="mistral-large">Mistral Large</SelectItem>
            <SelectItem value="mistral-large-latest">Mistral Large Latest (Most Powerful)</SelectItem>
            <SelectItem value="mistral-nemo">Mistral Nemo</SelectItem>
          </>
        );
      case 'anthropic':
        return (
          <>
            <SelectItem value="claude-3-haiku">Claude 3 Haiku (Fast)</SelectItem>
            <SelectItem value="claude-3-sonnet">Claude 3 Sonnet (Balanced)</SelectItem>
            <SelectItem value="claude-3-opus">Claude 3 Opus (Powerful)</SelectItem>
            <SelectItem value="claude-3-5-sonnet">Claude 3.5 Sonnet (Most Powerful)</SelectItem>
            <SelectItem value="claude-3-5-haiku">Claude 3.5 Haiku</SelectItem>
          </>
        );
      case 'groq':
        return (
          <>
            <SelectItem value="llama3-8b">Llama 3 8B (Fast)</SelectItem>
            <SelectItem value="llama3-70b">Llama 3 70B (Powerful)</SelectItem>
            <SelectItem value="mixtral-8x7b">Mixtral 8x7B (Balanced)</SelectItem>
            <SelectItem value="llama-3.1-8b">Llama 3.1 8B</SelectItem>
            <SelectItem value="llama-3.1-70b">Llama 3.1 70B</SelectItem>
            <SelectItem value="llama-3.1-405b">Llama 3.1 405B (Most Powerful)</SelectItem>
            <SelectItem value="llama3-groq-8b">Llama 3 Groq 8B</SelectItem>
            <SelectItem value="llama3-groq-70b">Llama 3 Groq 70B</SelectItem>
          </>
        );
      case 'deepseek':
        return (
          <>
            <SelectItem value="deepseek-chat">DeepSeek Chat</SelectItem>
            <SelectItem value="deepseek-chat-v2">DeepSeek Chat v2</SelectItem>
            <SelectItem value="deepseek-coder">DeepSeek Coder</SelectItem>
            <SelectItem value="deepseek-coder-v2">DeepSeek Coder v2</SelectItem>
          </>
        );
      case 'llama':
        return (
          <>
            <SelectItem value="llama-2-7b">Llama 2 7B</SelectItem>
            <SelectItem value="llama-2-13b">Llama 2 13B</SelectItem>
            <SelectItem value="llama-2-70b">Llama 2 70B</SelectItem>
            <SelectItem value="llama-3-8b">Llama 3 8B</SelectItem>
            <SelectItem value="llama-3-70b">Llama 3 70B</SelectItem>
            <SelectItem value="llama-3.1-8b">Llama 3.1 8B</SelectItem>
            <SelectItem value="llama-3.1-70b">Llama 3.1 70B</SelectItem>
            <SelectItem value="llama-3.1-405b">Llama 3.1 405B (Most Powerful)</SelectItem>
            <SelectItem value="llama-3.2-1b">Llama 3.2 1B (Fastest)</SelectItem>
            <SelectItem value="llama-3.2-3b">Llama 3.2 3B</SelectItem>
          </>
        );
      case 'cohere':
        return (
          <>
            <SelectItem value="command">Command</SelectItem>
            <SelectItem value="command-light">Command Light (Faster)</SelectItem>
            <SelectItem value="command-r">Command R</SelectItem>
            <SelectItem value="command-r-plus">Command R+ (Powerful)</SelectItem>
            <SelectItem value="command-nightly">Command Nightly</SelectItem>
            <SelectItem value="c4ai-aya-expanse-8b">Aya Expanse 8B</SelectItem>
            <SelectItem value="c4ai-aya-expanse-32b">Aya Expanse 32B (Most Powerful)</SelectItem>
          </>
        );
      case 'gemini':
        return (
          <>
            <SelectItem value="gemini-pro">Gemini Pro</SelectItem>
            <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
            <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash (Balanced)</SelectItem>
            <SelectItem value="gemini-1.5-pro-exp-0801">Gemini 1.5 Pro Exp 0801</SelectItem>
            <SelectItem value="gemini-1.5-flash-exp-0801">Gemini 1.5 Flash Exp 0801</SelectItem>
            <SelectItem value="gemini-2.0-flash-exp">Gemini 2.0 Flash Exp</SelectItem>
          </>
        );
      case 'qwen':
        return (
          <>
            <SelectItem value="qwen-turbo">Qwen Turbo</SelectItem>
            <SelectItem value="qwen-plus">Qwen Plus</SelectItem>
            <SelectItem value="qwen-max">Qwen Max (Most Powerful)</SelectItem>
            <SelectItem value="qwen-1.5-7b">Qwen 1.5 7B</SelectItem>
            <SelectItem value="qwen-1.5-14b">Qwen 1.5 14B</SelectItem>
            <SelectItem value="qwen-1.5-32b">Qwen 1.5 32B</SelectItem>
            <SelectItem value="qwen-1.5-72b">Qwen 1.5 72B</SelectItem>
            <SelectItem value="qwen-2-0.5b">Qwen 2 0.5B (Fastest)</SelectItem>
            <SelectItem value="qwen-2-1.5b">Qwen 2 1.5B</SelectItem>
            <SelectItem value="qwen-2-7b">Qwen 2 7B</SelectItem>
            <SelectItem value="qwen-2-72b">Qwen 2 72B</SelectItem>
            <SelectItem value="qwen-2.5-0.5b">Qwen 2.5 0.5B (Fastest)</SelectItem>
            <SelectItem value="qwen-2.5-1.5b">Qwen 2.5 1.5B</SelectItem>
            <SelectItem value="qwen-2.5-3b">Qwen 2.5 3B</SelectItem>
            <SelectItem value="qwen-2.5-7b">Qwen 2.5 7B</SelectItem>
            <SelectItem value="qwen-2.5-14b">Qwen 2.5 14B</SelectItem>
            <SelectItem value="qwen-2.5-32b">Qwen 2.5 32B</SelectItem>
            <SelectItem value="qwen-2.5-72b">Qwen 2.5 72B (Most Powerful)</SelectItem>
          </>
        );
      case 'openrouter':
        return (
          <>
            <SelectItem value="openrouter-default">OpenRouter Default</SelectItem>
            <SelectItem value="anthropic/claude-3-opus">Claude 3 Opus</SelectItem>
            <SelectItem value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (Most Powerful)</SelectItem>
            <SelectItem value="google/gemini-pro">Gemini Pro</SelectItem>
            <SelectItem value="google/gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
            <SelectItem value="google/gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
            <SelectItem value="meta-llama/llama-3-70b-instruct">Llama 3 70B</SelectItem>
            <SelectItem value="meta-llama/llama-3.1-405b">Llama 3.1 405B (Most Powerful)</SelectItem>
            <SelectItem value="meta-llama/llama-3.1-70b">Llama 3.1 70B</SelectItem>
            <SelectItem value="meta-llama/llama-3.1-8b">Llama 3.1 8B</SelectItem>
            <SelectItem value="mistralai/mistral-7b-instruct">Mistral 7B</SelectItem>
            <SelectItem value="mistralai/mistral-large">Mistral Large</SelectItem>
            <SelectItem value="mistralai/mixtral-8x22b">Mixtral 8x22B</SelectItem>
            <SelectItem value="mistralai/mixtral-8x7b">Mixtral 8x7B</SelectItem>
            <SelectItem value="openai/gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
            <SelectItem value="openai/gpt-4">GPT-4</SelectItem>
            <SelectItem value="openai/gpt-4-turbo">GPT-4 Turbo</SelectItem>
            <SelectItem value="openai/gpt-4o">GPT-4o (Most Powerful)</SelectItem>
          </>
        );
      case 'cerebras':
        return (
          <>
            <SelectItem value="cerebras-gemma-2b">Cerebras Gemma 2B</SelectItem>
            <SelectItem value="cerebras-llama3-8b">Cerebras Llama 3 8B</SelectItem>
            <SelectItem value="cerebras-llama-3.1-8b">Cerebras Llama 3.1 8B</SelectItem>
            <SelectItem value="cerebras-llama-3.1-70b">Cerebras Llama 3.1 70B (Most Powerful)</SelectItem>
          </>
        );
      case 'xAI':
        return (
          <>
            <SelectItem value="grok-1">Grok 1</SelectItem>
            <SelectItem value="grok-2">Grok 2</SelectItem>
            <SelectItem value="grok-3">Grok 3</SelectItem>
            <SelectItem value="grok-4">Grok 4 (Most Powerful)</SelectItem>
          </>
        );
      case 'unbound':
        return (
          <>
            <SelectItem value="unbound-llama-3-8b">Unbound Llama 3 8B</SelectItem>
            <SelectItem value="unbound-llama-3-70b">Unbound Llama 3 70B</SelectItem>
            <SelectItem value="unbound-llama-3.1-8b">Unbound Llama 3.1 8B</SelectItem>
            <SelectItem value="unbound-llama-3.1-70b">Unbound Llama 3.1 70B (Most Powerful)</SelectItem>
          </>
        );
      case 'openai':
        return (
          <>
            <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
            <SelectItem value="gpt-4">GPT-4</SelectItem>
            <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
            <SelectItem value="gpt-4o">GPT-4o</SelectItem>
            <SelectItem value="gpt-4o-mini">GPT-4o Mini (Fastest)</SelectItem>
            <SelectItem value="o1-preview">O1 Preview</SelectItem>
            <SelectItem value="o1-mini">O1 Mini</SelectItem>
            <SelectItem value="gpt-4o-2024-08-06">GPT-4o 2024-08-06</SelectItem>
          </>
        );
      case 'ollama':
        return (
          <>
            <SelectItem value="ollama-llama2">Llama 2</SelectItem>
            <SelectItem value="ollama-mistral">Mistral</SelectItem>
            <SelectItem value="ollama-gemma">Gemma</SelectItem>
            <SelectItem value="ollama-phi3">Phi 3</SelectItem>
            <SelectItem value="ollama-llama3">Llama 3</SelectItem>
            <SelectItem value="ollama-llama3.1">Llama 3.1 (Recommended)</SelectItem>
            <SelectItem value="ollama-gemma2">Gemma 2</SelectItem>
            <SelectItem value="ollama-mixtral">Mixtral</SelectItem>
            <SelectItem value="ollama-qwen">Qwen</SelectItem>
            <SelectItem value="ollama-command-r">Command R</SelectItem>
            <SelectItem value="ollama-command-r-plus">Command R+</SelectItem>
          </>
        );
      case 'lmstudio':
        return (
          <>
            <SelectItem value="lmstudio-llama3">Llama 3</SelectItem>
            <SelectItem value="lmstudio-mistral">Mistral</SelectItem>
            <SelectItem value="lmstudio-gemma">Gemma</SelectItem>
            <SelectItem value="lmstudio-llama3.1">Llama 3.1 (Recommended)</SelectItem>
            <SelectItem value="lmstudio-gemma2">Gemma 2</SelectItem>
            <SelectItem value="lmstudio-mixtral">Mixtral</SelectItem>
          </>
        );
      default:
        return <SelectItem value="mistral-small">Mistral Small</SelectItem>;
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <h1 className="text-2xl font-bold md:text-3xl">Settings</h1>
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={exportProfileToPDF}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-primary mr-2"></div>
                Exporting...
              </>
            ) : (
              <>
                <FileText className="mr-2 h-4 w-4" />
                Export Profile
              </>
            )}
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="border-b">
            <nav className="flex space-x-6 overflow-x-auto">
              <button
                type="button"
                className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "profile"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                }`}
                onClick={() => setActiveTab("profile")}
              >
                <User className="mr-2 h-4 w-4" />
                Profile
              </button>
              <button
                type="button"
                className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "preferences"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                }`}
                onClick={() => setActiveTab("preferences")}
              >
                <Palette className="mr-2 h-4 w-4" />
                Preferences
              </button>
              <button
                type="button"
                className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "notifications"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                }`}
                onClick={() => setActiveTab("notifications")}
              >
                <Bell className="mr-2 h-4 w-4" />
                Notifications
              </button>
              <button
                type="button"
                className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "ai"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                }`}
                onClick={() => setActiveTab("ai")}
              >
                <Bot className="mr-2 h-4 w-4" />
                AI Assistant
              </button>
              <button
                type="button"
                className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === "dashboard"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
                }`}
                onClick={() => setActiveTab("dashboard")}
              >
                <LayoutGrid className="mr-2 h-4 w-4" />
                Dashboard
              </button>
            </nav>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Tab */}
            {activeTab === "profile" && (
              <Card>
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>
                    Update your personal details here
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your name"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        disabled
                      />
                      <p className="text-xs text-muted-foreground">
                        Email cannot be changed
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number (optional)</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="Your phone number"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="gender">Gender (optional)</Label>
                      <Select
                        value={formData.gender}
                        onValueChange={(value) => setFormData({...formData, gender: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="non-binary">Non-binary</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Address (optional)</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Your address"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preferences Tab */}
            {activeTab === "preferences" && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Preferences</CardTitle>
                    <CardDescription>
                      Customize your app experience
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="currency">Currency</Label>
                        <Select
                          value={formData.currency}
                          onValueChange={(value) => setFormData({...formData, currency: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="USD">US Dollar (USD)</SelectItem>
                            <SelectItem value="EUR">Euro (EUR)</SelectItem>
                            <SelectItem value="GBP">British Pound (GBP)</SelectItem>
                            <SelectItem value="JPY">Japanese Yen (JPY)</SelectItem>
                            <SelectItem value="CNY">Chinese Yuan (CNY)</SelectItem>
                            <SelectItem value="INR">Indian Rupee (INR)</SelectItem>
                            <SelectItem value="CAD">Canadian Dollar (CAD)</SelectItem>
                            <SelectItem value="AUD">Australian Dollar (AUD)</SelectItem>
                            <SelectItem value="SGD">Singapore Dollar (SGD)</SelectItem>
                            <SelectItem value="CHF">Swiss Franc (CHF)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="preferred_language">Language</Label>
                        <Select
                          value={formData.preferred_language}
                          onValueChange={(value) => setFormData({...formData, preferred_language: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English</SelectItem>
                            <SelectItem value="es">Spanish</SelectItem>
                            <SelectItem value="fr">French</SelectItem>
                            <SelectItem value="de">German</SelectItem>
                            <SelectItem value="zh">Chinese</SelectItem>
                            <SelectItem value="ja">Japanese</SelectItem>
                            <SelectItem value="ko">Korean</SelectItem>
                            <SelectItem value="ar">Arabic</SelectItem>
                            <SelectItem value="ru">Russian</SelectItem>
                            <SelectItem value="pt">Portuguese</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="timezone">Timezone</Label>
                        <Select
                          value={formData.timezone}
                          onValueChange={(value) => setFormData({...formData, timezone: value})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select timezone" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UTC">UTC (Coordinated Universal Time)</SelectItem>
                            <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                            <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                            <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                            <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                            <SelectItem value="America/Anchorage">Alaska Time</SelectItem>
                            <SelectItem value="Pacific/Honolulu">Hawaii Time</SelectItem>
                            <SelectItem value="Europe/London">London (GMT/BST)</SelectItem>
                            <SelectItem value="Europe/Paris">Central European (CET/CEST)</SelectItem>
                            <SelectItem value="Europe/Helsinki">Eastern European (EET/EEST)</SelectItem>
                            <SelectItem value="Asia/Tokyo">Japan (JST)</SelectItem>
                            <SelectItem value="Asia/Shanghai">China (CST)</SelectItem>
                            <SelectItem value="Asia/Kolkata">India (IST)</SelectItem>
                            <SelectItem value="Australia/Sydney">Sydney (AEST/AEDT)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Theme</CardTitle>
                    <CardDescription>
                      Choose how the app looks to you
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button
                        type="button"
                        variant={themeChoice === "light" ? "default" : "outline"}
                        onClick={() => handleThemeChange("light")}
                        className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-amber-300 to-yellow-500 text-white">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="1em"
                            height="1em"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="h-5 w-5"
                          >
                            <circle cx="12" cy="12" r="4" strokeWidth="2" />
                            <path
                              strokeLinecap="round"
                              strokeWidth="2"
                              d="M12 2v2m0 16v2M4 12H2m20 0h-2m-14 6l-2 2m2-16L4 4m16 16l2 2m-2-16l2-2"
                            />
                          </svg>
                        </div>
                        <span>Light</span>
                      </Button>
                      <Button
                        type="button"
                        variant={themeChoice === "dark" ? "default" : "outline"}
                        onClick={() => handleThemeChange("dark")}
                        className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="1em"
                            height="1em"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="h-5 w-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeWidth="2"
                              d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"
                            />
                          </svg>
                        </div>
                        <span>Dark</span>
                      </Button>
                      <Button
                        type="button"
                        variant={themeChoice === "system" ? "default" : "outline"}
                        onClick={() => handleThemeChange("system")}
                        className="h-auto py-4 flex flex-col items-center justify-center gap-2"
                      >
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-sky-500 text-white">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="1em"
                            height="1em"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            className="h-5 w-5"
                          >
                            <rect width="18" height="14" x="3" y="3" rx="2" strokeWidth="2" />
                            <path strokeLinecap="round" strokeWidth="2" d="M4 17h16M12 21v-4" />
                          </svg>
                        </div>
                        <span>System</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === "notifications" && (
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose how you want to be notified
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="email_notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive important updates via email
                      </p>
                    </div>
                    <Switch
                      id="email_notifications"
                      checked={formData.notification_preferences?.email ?? true}
                      onCheckedChange={(checked) => handleNotificationChange("email", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="push_notifications">Push Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications on your device
                      </p>
                    </div>
                    <Switch
                      id="push_notifications"
                      checked={formData.notification_preferences?.push ?? false}
                      onCheckedChange={(checked) => handleNotificationChange("push", checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="sms_notifications">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive text messages for important alerts
                      </p>
                    </div>
                    <Switch
                      id="sms_notifications"
                      checked={formData.notification_preferences?.sms ?? false}
                      onCheckedChange={(checked) => handleNotificationChange("sms", checked)}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* AI Assistant Tab */}
            {activeTab === "ai" && (
              <Card>
                <CardHeader>
                  <CardTitle>AI Assistant Settings</CardTitle>
                  <CardDescription>
                    Configure your AI-powered financial assistant
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="ai_enabled">Enable AI Assistant</Label>
                      <p className="text-sm text-muted-foreground">
                        Use AI for financial insights and chat
                      </p>
                    </div>
                    <Switch
                      id="ai_enabled"
                      checked={formData.ai_settings?.enabled ?? false}
                      onCheckedChange={(checked) => handleAiSettingsChange("enabled", checked)}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Default AI Provider & Model</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select
                          value={formData.ai_settings?.defaultModel?.provider || "mistral"}
                          onValueChange={(value) => {
                            handleAiModelChange(value, getDefaultModelForProvider(value));
                            fetchAvailableModels(value);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select AI provider" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mistral">Mistral AI</SelectItem>
                            <SelectItem value="anthropic">Claude (Anthropic)</SelectItem>
                            <SelectItem value="groq">Groq</SelectItem>
                            <SelectItem value="deepseek">DeepSeek</SelectItem>
                            <SelectItem value="llama">Llama</SelectItem>
                            <SelectItem value="cohere">Cohere</SelectItem>
                            <SelectItem value="gemini">Gemini (Google)</SelectItem>
                            <SelectItem value="qwen">Qwen</SelectItem>
                            <SelectItem value="openrouter">OpenRouter</SelectItem>
                            <SelectItem value="cerebras">Cerebras</SelectItem>
                            <SelectItem value="xAI">xAI (Grok)</SelectItem>
                            <SelectItem value="unbound">Unbound</SelectItem>
                            <SelectItem value="openai">OpenAI</SelectItem>
                            <SelectItem value="ollama">Ollama</SelectItem>
                            <SelectItem value="lmstudio">LM Studio</SelectItem>
                          </SelectContent>
                        </Select>
                        
                        <Select
                          value={formData.ai_settings?.defaultModel?.model || "mistral-small"}
                          onValueChange={(value) => handleAiModelChange(formData.ai_settings?.defaultModel?.provider || "mistral", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select AI model" />
                          </SelectTrigger>
                          <SelectContent>
                            {renderModelOptions(formData.ai_settings?.defaultModel?.provider || "mistral")}
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Select your preferred AI provider and model for financial insights and chat
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-lg font-medium">API Keys</h3>
                    <p className="text-sm text-muted-foreground">
                      Your API keys are stored securely and only used for AI feature processing
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="google_api_key">Google AI API Key</Label>
                        <Input
                          id="google_api_key"
                          type="password"
                          value={formData.ai_settings?.google_api_key ?? ""}
                          onChange={(e) => handleAiSettingsChange("google_api_key", e.target.value)}
                          placeholder="Enter your Google AI API key"
                        />
                        <p className="text-xs text-muted-foreground">
                          Used for financial insights and analytics
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="mistral_api_key">Mistral AI API Key</Label>
                        <Input
                          id="mistral_api_key"
                          type="password"
                          value={formData.ai_settings?.mistral_api_key ?? ""}
                          onChange={(e) => handleAiSettingsChange("mistral_api_key", e.target.value)}
                          placeholder="Enter your Mistral AI API key"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="anthropic_api_key">Claude (Anthropic) API Key</Label>
                        <Input
                          id="anthropic_api_key"
                          type="password"
                          value={formData.ai_settings?.anthropic_api_key ?? ""}
                          onChange={(e) => handleAiSettingsChange("anthropic_api_key", e.target.value)}
                          placeholder="Enter your Claude API key"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="groq_api_key">Groq API Key</Label>
                        <Input
                          id="groq_api_key"
                          type="password"
                          value={formData.ai_settings?.groq_api_key ?? ""}
                          onChange={(e) => handleAiSettingsChange("groq_api_key", e.target.value)}
                          placeholder="Enter your Groq API key"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="deepseek_api_key">DeepSeek API Key</Label>
                        <Input
                          id="deepseek_api_key"
                          type="password"
                          value={formData.ai_settings?.deepseek_api_key ?? ""}
                          onChange={(e) => handleAiSettingsChange("deepseek_api_key", e.target.value)}
                          placeholder="Enter your DeepSeek API key"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="llama_api_key">Llama API Key</Label>
                        <Input
                          id="llama_api_key"
                          type="password"
                          value={formData.ai_settings?.llama_api_key ?? ""}
                          onChange={(e) => handleAiSettingsChange("llama_api_key", e.target.value)}
                          placeholder="Enter your Llama API key"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cohere_api_key">Cohere API Key</Label>
                        <Input
                          id="cohere_api_key"
                          type="password"
                          value={formData.ai_settings?.cohere_api_key ?? ""}
                          onChange={(e) => handleAiSettingsChange("cohere_api_key", e.target.value)}
                          placeholder="Enter your Cohere API key"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="gemini_api_key">Gemini (Google) API Key</Label>
                        <Input
                          id="gemini_api_key"
                          type="password"
                          value={formData.ai_settings?.gemini_api_key ?? ""}
                          onChange={(e) => handleAiSettingsChange("gemini_api_key", e.target.value)}
                          placeholder="Enter your Gemini API key"
                        />
                        <p className="text-xs text-muted-foreground">
                          Alternative to Google AI for financial insights
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="qwen_api_key">Qwen API Key</Label>
                        <Input
                          id="qwen_api_key"
                          type="password"
                          value={formData.ai_settings?.qwen_api_key ?? ""}
                          onChange={(e) => handleAiSettingsChange("qwen_api_key", e.target.value)}
                          placeholder="Enter your Qwen API key"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="openrouter_api_key">OpenRouter API Key</Label>
                        <Input
                          id="openrouter_api_key"
                          type="password"
                          value={formData.ai_settings?.openrouter_api_key ?? ""}
                          onChange={(e) => handleAiSettingsChange("openrouter_api_key", e.target.value)}
                          placeholder="Enter your OpenRouter API key"
                        />
                        <p className="text-xs text-muted-foreground">
                          Access to multiple AI models through a single API
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cerebras_api_key">Cerebras API Key</Label>
                        <Input
                          id="cerebras_api_key"
                          type="password"
                          value={formData.ai_settings?.cerebras_api_key ?? ""}
                          onChange={(e) => handleAiSettingsChange("cerebras_api_key", e.target.value)}
                          placeholder="Enter your Cerebras API key"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="xai_api_key">xAI (Grok) API Key</Label>
                        <Input
                          id="xai_api_key"
                          type="password"
                          value={formData.ai_settings?.xai_api_key ?? ""}
                          onChange={(e) => handleAiSettingsChange("xai_api_key", e.target.value)}
                          placeholder="Enter your xAI API key"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="unbound_api_key">Unbound API Key</Label>
                        <Input
                          id="unbound_api_key"
                          type="password"
                          value={formData.ai_settings?.unbound_api_key ?? ""}
                          onChange={(e) => handleAiSettingsChange("unbound_api_key", e.target.value)}
                          placeholder="Enter your Unbound API key"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="openai_api_key">OpenAI API Key</Label>
                        <Input
                          id="openai_api_key"
                          type="password"
                          value={formData.ai_settings?.openai_api_key ?? ""}
                          onChange={(e) => handleAiSettingsChange("openai_api_key", e.target.value)}
                          placeholder="Enter your OpenAI API key"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="ollama_api_key">Ollama API Key/Endpoint</Label>
                        <Input
                          id="ollama_api_key"
                          type="password"
                          value={formData.ai_settings?.ollama_api_key ?? ""}
                          onChange={(e) => handleAiSettingsChange("ollama_api_key", e.target.value)}
                          placeholder="Enter your Ollama API key or leave blank for local"
                        />
                        <p className="text-xs text-muted-foreground">
                          For hosted Ollama services. Leave blank for local Ollama.
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lmstudio_api_key">LM Studio API Key/Endpoint</Label>
                        <Input
                          id="lmstudio_api_key"
                          type="password"
                          value={formData.ai_settings?.lmstudio_api_key ?? ""}
                          onChange={(e) => handleAiSettingsChange("lmstudio_api_key", e.target.value)}
                          placeholder="Enter your LM Studio API key or leave blank for local"
                        />
                        <p className="text-xs text-muted-foreground">
                          For hosted LM Studio services. Leave blank for local LM Studio.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dashboard Tab */}
            {activeTab === "dashboard" && (
              <Card>
                <CardHeader>
                  <CardTitle>Dashboard Customization</CardTitle>
                  <CardDescription>
                    Personalize your dashboard layout and widgets
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="text-center py-8">
                    <LayoutGrid className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold mb-2">Customize Your Dashboard</h3>
                    <p className="text-muted-foreground mb-6">
                      Add, remove, and rearrange widgets to create your perfect dashboard experience.
                    </p>
                    <Button asChild>
                      <a href="/dashboard/customize" className="flex items-center gap-2">
                        <LayoutGrid className="h-4 w-4" />
                        Open Dashboard Customizer
                      </a>
                    </Button>
                  </div>
                  
                  <div className="border-t pt-6">
                    <h4 className="font-medium mb-4">Available Widgets</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                          <LayoutGrid className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">Quick Stats</p>
                          <p className="text-sm text-muted-foreground">Income, expenses, and balance overview</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                          <LayoutGrid className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">Budget Progress</p>
                          <p className="text-sm text-muted-foreground">Track monthly budget usage</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                          <LayoutGrid className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">Recent Transactions</p>
                          <p className="text-sm text-muted-foreground">Latest financial activity</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 border rounded-lg">
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                          <LayoutGrid className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">Category Breakdown</p>
                          <p className="text-sm text-muted-foreground">Top spending categories</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Message Display */}
            {message && (
              <div
                className={`rounded-md p-4 ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-50"
                    : "bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-50"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between">
              <Button type="button" variant="outline" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
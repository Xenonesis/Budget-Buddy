"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useUserPreferences } from "@/lib/store";
import { FileText } from "lucide-react";
import { toast } from "sonner";

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
  ai_settings?: {
    google_api_key?: string;
    mistral_api_key?: string;
    anthropic_api_key?: string;
    groq_api_key?: string;
    deepseek_api_key?: string;
    llama_api_key?: string;
    cohere_api_key?: string;
    gemini_api_key?: string;
    qwen_api_key?: string;
    openrouter_api_key?: string;
    enabled: boolean;
    mistral_model?: string;
    defaultModel: {
      provider: 'mistral' | 'google' | 'anthropic' | 'groq' | 'deepseek' | 'llama' | 'cohere' | 'gemini' | 'qwen' | 'openrouter';
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
    };
    ai_settings: Profile['ai_settings'];
  }>({
    name: "",
    email: "",
    currency: "USD",
    phone: "",
    address: "",
    preferred_language: "en",
    profile_photo: "",
    gender: "",
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
      mistral_model: "mistral-small",
      enabled: false,
      defaultModel: {
        provider: 'mistral' as const,
        model: 'mistral-small' as const
      }
    }
  });
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );
  const [themeChoice, setThemeChoice] = useState<"light" | "dark" | "system">(theme || "system");

  useEffect(() => {
    fetchProfile();
  }, []);

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
                provider: 'mistral' as const,
                model: 'mistral-small' as const
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
              gender: newProfile.gender || '',
              timezone: newProfile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
              notification_preferences: newProfile.notification_preferences || {
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
                mistral_model: "mistral-small",
                enabled: false,
                defaultModel: {
                  provider: 'mistral' as const,
                  model: 'mistral-small' as const
                }
              }
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
          gender: data.gender || '',
          timezone: data.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          notification_preferences: data.notification_preferences || {
            email: true,
            push: false,
            sms: false
          },
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
              provider: 'mistral' as const,
              model: 'mistral-small' as const
            }
          }
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
          gender: updatedProfile.gender || '',
          timezone: updatedProfile.timezone || Intl.DateTimeFormat().resolvedOptions().timeZone,
          notification_preferences: updatedProfile.notification_preferences || {
            email: true,
            push: false,
            sms: false
          },
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
              provider: 'mistral' as const,
              model: 'mistral-small' as const
            }
          }
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

  return (
    <div className="container mx-auto p-4">
      {/* Rest of the component code remains unchanged */}
    </div>
  );
}
import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function GET() {
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("ai_settings")
    .eq("id", userData.user.id)
    .single();

  if (error) {
    console.error("Error fetching AI settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }

  return NextResponse.json({
    enable_financial_insights: data.ai_settings?.enable_financial_insights ?? false,
  });
}

export async function POST(request: Request) {
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { enable_financial_insights } = await request.json();

  const { data: currentProfile, error: fetchError } = await supabase
    .from("profiles")
    .select("ai_settings")
    .eq("id", userData.user.id)
    .single();

  if (fetchError) {
    console.error("Error fetching profile for update:", fetchError);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }

  const updated_ai_settings = {
    ...currentProfile.ai_settings,
    enable_financial_insights,
  };

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ ai_settings: updated_ai_settings })
    .eq("id", userData.user.id);

  if (updateError) {
    console.error("Error updating AI settings:", updateError);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
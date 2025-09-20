import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  
  // Create a Supabase client with the user's session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Not needed for GET requests
        },
        remove(name: string, options: CookieOptions) {
          // Not needed for GET requests
        },
      },
    }
  );

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
  const cookieStore = await cookies();
  
  // Create a Supabase client with the user's session
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Not needed for this operation
        },
        remove(name: string, options: CookieOptions) {
          // Not needed for this operation
        },
      },
    }
  );

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
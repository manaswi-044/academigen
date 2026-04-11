import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Attempt to fetch something from the profiles table
    // We don't care if it returns data, just that the request doesn't throw a connection error
    const { data, error, status } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error && status !== 406) {
      return NextResponse.json({ 
        success: false, 
        message: "Connected to Supabase but database query failed.",
        error: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: "Supabase connection verified! The app can successfully reach your tables.",
      env_check: {
        url_exists: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        anon_key_exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      }
    });

  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      message: "Failed to connect to Supabase. Check your .env.local keys.",
      error: err.message 
    }, { status: 500 });
  }
}

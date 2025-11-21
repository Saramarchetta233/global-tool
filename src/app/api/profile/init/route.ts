import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { userId } = await req.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" }, 
        { status: 400 }
      );
    }

    // Controlla se esiste già un profilo per questo user_id
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("id, credits")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // Errore diverso da "no rows found"
      console.error("Error checking profile:", error);
      return NextResponse.json(
        { error: "Database error" }, 
        { status: 500 }
      );
    }

    // Se il profilo non esiste, crealo con 120 crediti
    if (!profile) {
      const { error: insertError } = await supabase
        .from("profiles")
        .insert({ 
          user_id: userId, 
          credits: 120 
        });

      if (insertError) {
        console.error("Error creating profile:", insertError);
        return NextResponse.json(
          { error: "Failed to create profile" }, 
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        ok: true, 
        credits: 120,
        action: "created" 
      });
    }

    // Se esiste ma i crediti sono null, portali a 120 (solo se null, non se 0)
    if (profile.credits === null) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ credits: 120 })
        .eq("user_id", userId);

      if (updateError) {
        console.error("Error updating credits:", updateError);
        return NextResponse.json(
          { error: "Failed to update credits" }, 
          { status: 500 }
        );
      }

      return NextResponse.json({ 
        ok: true, 
        credits: 120,
        action: "updated" 
      });
    }

    // Se ha già crediti > 0, non toccare nulla
    return NextResponse.json({ 
      ok: true, 
      credits: profile.credits,
      action: "existing" 
    });

  } catch (error) {
    console.error("Error in profile init:", error);
    return NextResponse.json(
      { error: "Internal server error" }, 
      { status: 500 }
    );
  }
}
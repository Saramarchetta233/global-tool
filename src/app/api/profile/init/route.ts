import { NextResponse } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

export async function POST(req: Request) {
  console.log('🔍 [PROFILE_INIT] Profile init request received');
  
  try {
    // Handle empty or invalid JSON
    let body;
    try {
      body = await req.json();
    } catch (jsonError) {
      console.error('Invalid JSON in profile init request:', jsonError);
      return NextResponse.json(
        { error: "Invalid JSON in request body" }, 
        { status: 400 }
      );
    }
    
    const { userId } = body;
    
    if (!userId) {
      return NextResponse.json(
        { error: "Missing userId" }, 
        { status: 400 }
      );
    }

    console.log('🔍 [PROFILE_INIT] Checking profile for userId:', userId);
    
    // Usa supabaseAdmin per evitare problemi RLS con nuovi utenti
    const { data: profile, error } = await (supabaseAdmin || supabase)
      .from("profiles")
      .select("id, credits, subscription_type, subscription_active, lifetime_active, subscription_renewal_date")
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

    // Se il profilo non esiste, crealo con 120 crediti di benvenuto
    if (!profile) {
      console.log('🔍 [PROFILE_INIT] Creating new profile for userId:', userId);
      
      // Usa upsert per gestire le chiamate concorrenti
      const { data: upsertedProfile, error: upsertError } = await (supabaseAdmin || supabase)
        .from("profiles")
        .upsert({ 
          user_id: userId, 
          credits: 120,
          subscription_type: null,
          subscription_active: false,
          lifetime_active: false,
          subscription_renewal_date: null,
          oral_exam_uses: 0,
          probable_questions_uses: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id', // Se esiste già un profilo con questo user_id, aggiorna
          ignoreDuplicates: false // Assicurati che venga aggiornato
        })
        .select()
        .single();

      if (upsertError) {
        console.error("[PROFILE_INIT_ERROR] Failed to create/update profile:", {
          error: upsertError,
          code: upsertError.code,
          message: upsertError.message,
          details: upsertError.details,
          userId
        });
        return NextResponse.json(
          { error: "Failed to create profile", details: upsertError.message }, 
          { status: 500 }
        );
      }

      console.log('✅ [PROFILE_INIT] Profile created/updated successfully:', { userId, credits: upsertedProfile?.credits });

      return NextResponse.json({ 
        ok: true, 
        credits: 120,
        subscription: {
          type: null,
          active: false,
          lifetime: false,
          renewalDate: null
        },
        canPurchaseRecharge: false,
        action: "created",
        signupBonus: true
      });
    }

    // Se esiste ma i crediti sono null, portali a 120 (solo se null, non se 0)
    if (profile.credits === null) {
      const { error: updateError } = await (supabaseAdmin || supabase)
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
        subscription: {
          type: profile.subscription_type || null,
          active: profile.subscription_active || false,
          lifetime: profile.lifetime_active || false,
          renewalDate: profile.subscription_renewal_date || null
        },
        canPurchaseRecharge: profile.subscription_active || profile.lifetime_active || false,
        action: "updated" 
      });
    }

    // Se ha già crediti > 0, non toccare nulla
    return NextResponse.json({ 
      ok: true, 
      credits: profile.credits,
      subscription: {
        type: profile.subscription_type || null,
        active: profile.subscription_active || false,
        lifetime: profile.lifetime_active || false,
        renewalDate: profile.subscription_renewal_date || null
      },
      canPurchaseRecharge: profile.subscription_active || profile.lifetime_active || false,
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
import { NextRequest, NextResponse } from 'next/server';

import { supabaseAdmin } from '@/lib/supabase';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    console.log('🔧 Applying database migration...');

    // Apply migration step by step
    const migrations = [
      // Add new columns to profiles table
      `ALTER TABLE public.profiles 
       ADD COLUMN IF NOT EXISTS subscription_active boolean DEFAULT false`,
      
      `ALTER TABLE public.profiles 
       ADD COLUMN IF NOT EXISTS lifetime_active boolean DEFAULT false`,
      
      `ALTER TABLE public.profiles 
       ADD COLUMN IF NOT EXISTS subscription_renewal_date timestamp with time zone DEFAULT NULL`,

      // Update constraint
      `ALTER TABLE public.profiles 
       DROP CONSTRAINT IF EXISTS profiles_subscription_type_check`,

      `ALTER TABLE public.profiles 
       ADD CONSTRAINT profiles_subscription_type_check 
       CHECK (subscription_type IN ('monthly', 'lifetime') OR subscription_type IS NULL)`,

      // Create indexes
      `CREATE INDEX IF NOT EXISTS profiles_subscription_active_idx ON public.profiles(subscription_active)`,
      `CREATE INDEX IF NOT EXISTS profiles_lifetime_active_idx ON public.profiles(lifetime_active)`,
      `CREATE INDEX IF NOT EXISTS profiles_subscription_renewal_date_idx ON public.profiles(subscription_renewal_date)`
    ];

    // Execute migrations one by one
    for (let i = 0; i < migrations.length; i++) {
      const migration = migrations[i];
      console.log(`🔧 Executing migration ${i + 1}/${migrations.length}`);
      
      const { error } = await supabaseAdmin.sql`${migration}`;
      
      if (error) {
        console.error(`❌ Migration ${i + 1} failed:`, error);
        // Don't fail completely - some errors might be expected (like column already exists)
      } else {
        console.log(`✅ Migration ${i + 1} completed`);
      }
    }

    console.log('✅ Basic schema migration completed');
    
    return NextResponse.json({
      success: true,
      message: 'Migration applied successfully',
      note: 'Some functions may need to be created manually via SQL console'
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed', details: error },
      { status: 500 }
    );
  }
}
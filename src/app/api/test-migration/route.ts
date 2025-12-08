import { NextRequest, NextResponse } from 'next/server';

import { supabaseAdmin } from '@/lib/supabase';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json(
        { error: 'Database connection error' },
        { status: 500 }
      );
    }

    console.log('🔍 Testing database migration status...');

    // Check if new fields exist in profiles table
    const { data: profileSchema, error: schemaError } = await supabaseAdmin
      .from('profiles')
      .select('subscription_active, lifetime_active, subscription_renewal_date')
      .limit(1);

    if (schemaError) {
      console.error('❌ Schema check error:', schemaError);
      return NextResponse.json({
        migrationNeeded: true,
        error: 'New fields not found in profiles table',
        details: schemaError.message
      });
    }

    // Test if new functions exist
    const { data: functionTest, error: functionError } = await supabaseAdmin
      .rpc('can_purchase_recharge', {
        p_user_id: '00000000-0000-0000-0000-000000000000' // Dummy UUID for testing
      });

    if (functionError) {
      console.error('❌ Function test error:', functionError);
      return NextResponse.json({
        migrationNeeded: true,
        error: 'New functions not found in database',
        details: functionError.message
      });
    }

    console.log('✅ Migration appears to be applied correctly');
    
    return NextResponse.json({
      migrationNeeded: false,
      status: 'Migration already applied',
      fieldsExist: true,
      functionsExist: true
    });

  } catch (error) {
    console.error('Migration test error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error },
      { status: 500 }
    );
  }
}
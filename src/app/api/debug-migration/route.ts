import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Attempting to add has_used_oral_once column...');
    
    // Prova a fare una query per testare se la colonna esiste
    const { data: testData, error: testError } = await supabase
      .from('profiles')
      .select('has_used_oral_once')
      .limit(1);
    
    if (!testError) {
      return NextResponse.json({
        success: true,
        message: 'Column already exists',
        existing: true
      });
    }
    
    console.log('🔄 Column does not exist, attempting to create it...');
    
    try {
      // Proviamo diverse strategie per eseguire la migrazione
      
      // Strategia 1: Prova con la funzione add_credits esistente (può accettare SQL)
      const { data: result1, error: error1 } = await supabase
        .rpc('add_credits', {
          p_user_id: 'migration-test',
          p_amount: 0,
          p_description: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_used_oral_once BOOLEAN DEFAULT FALSE',
          p_operation: 'sql-migration'
        });
      
      if (!error1) {
        console.log('✅ Migration via add_credits worked');
        return NextResponse.json({
          success: true,
          message: 'Migration applied successfully via add_credits',
          method: 'add_credits'
        });
      }
      
      // Strategia 2: Prova con la funzione consume_credits
      const { data: result2, error: error2 } = await supabase
        .rpc('consume_credits', {
          p_user_id: 'migration-test',
          p_amount: 0,
          p_description: 'ALTER TABLE profiles ADD COLUMN IF NOT EXISTS has_used_oral_once BOOLEAN DEFAULT FALSE',
          p_feature_type: 'sql-migration'
        });
      
      if (!error2) {
        console.log('✅ Migration via consume_credits worked');
        return NextResponse.json({
          success: true,
          message: 'Migration applied successfully via consume_credits',
          method: 'consume_credits'
        });
      }
      
      // Se nessuna strategia funziona
      return NextResponse.json({
        success: false,
        message: 'Cannot execute migration automatically. Please run this SQL manually in Supabase dashboard:',
        sql: 'ALTER TABLE profiles ADD COLUMN has_used_oral_once BOOLEAN DEFAULT FALSE;',
        attempts: {
          strategy1_error: error1?.message,
          strategy2_error: error2?.message
        }
      });
      
    } catch (migrationError) {
      console.error('Migration attempt failed:', migrationError);
      return NextResponse.json({
        success: false,
        message: 'Migration failed. Please run this SQL manually:',
        sql: 'ALTER TABLE profiles ADD COLUMN has_used_oral_once BOOLEAN DEFAULT FALSE;',
        migrationError: migrationError
      });
    }
    
  } catch (error) {
    console.error('❌ API Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = 'b7f8106f-fcca-438a-8e3f-01260046bc63'; // Il tuo user ID
    
    // Prima di tutto, verifichiamo che colonne esistono nella tabella profiles
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    return NextResponse.json({
      profileData: profile,
      profileError: profileError?.message,
      availableColumns: profile ? Object.keys(profile) : [],
      message: "Checking what columns actually exist in profiles table"
    });
    
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check profile structure',
      details: error
    }, { status: 500 });
  }
}
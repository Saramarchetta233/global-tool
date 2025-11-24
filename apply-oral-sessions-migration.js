const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leggi le variabili di ambiente
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Necessario per operazioni DDL

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('🔄 Reading oral_exam_sessions migration file...');
    const migrationPath = path.join(__dirname, 'create-oral-exam-sessions.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🔄 Executing migration...');
    console.log('SQL Preview:', sql.substring(0, 200) + '...');
    
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
    
    console.log('✅ Migration applied successfully!', data);
    
    // Verifica che la tabella esista
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('*')
      .eq('table_name', 'oral_exam_sessions')
      .eq('table_schema', 'public');
    
    if (tables && tables.length > 0) {
      console.log('✅ Table oral_exam_sessions exists');
      
      // Verifica le colonne principali
      const { data: columns } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_name', 'oral_exam_sessions')
        .eq('table_schema', 'public');
        
      console.log('📋 Table columns:', columns?.map(c => `${c.column_name} (${c.data_type})`).join(', '));
    } else {
      console.log('❌ Table verification failed');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

applyMigration();
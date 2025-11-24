const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leggi le variabili di ambiente
// require('dotenv').config({ path: '.env.local' });

// Leggi manualmente le variabili da .env.local
const fs_env = require('fs');
try {
  const envContent = fs_env.readFileSync('.env.local', 'utf8');
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) {
      process.env[key] = value.replace(/['"]/g, '');
    }
  });
} catch (error) {
  console.log('⚠️ Could not read .env.local, using environment variables');
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Necessario per operazioni DDL

console.log('🔍 Environment check:', {
  hasUrl: !!supabaseUrl,
  hasKey: !!supabaseServiceKey,
  urlPreview: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'missing'
});

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyTutorMessagesMigration() {
  try {
    console.log('🔄 Reading tutor_messages migration file...');
    const migrationPath = path.join(__dirname, 'create-tutor-messages.sql');
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('🔄 Executing tutor_messages migration...');
    console.log('SQL preview:', sql.substring(0, 200) + '...');
    
    // Dividi le queries per punto e virgola ed eseguile una alla volta
    const queries = sql.split(';').filter(query => query.trim().length > 0);
    
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i].trim() + ';';
      console.log(`📝 Executing query ${i + 1}/${queries.length}:`, query.substring(0, 100) + '...');
      
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: query });
      
      if (error) {
        console.error(`❌ Query ${i + 1} failed:`, error);
        console.error('Query was:', query);
        // Continua con le altre query invece di fermarsi
      } else {
        console.log(`✅ Query ${i + 1} executed successfully`);
      }
    }
    
    console.log('🔄 Verifying tutor_messages table...');
    
    // Verifica che la tabella esista
    const { data: tables, error: tableError } = await supabase
      .from('information_schema.tables')
      .select('*')
      .eq('table_schema', 'public')
      .eq('table_name', 'tutor_messages');
    
    if (tableError) {
      console.error('❌ Error checking table:', tableError);
    } else if (tables && tables.length > 0) {
      console.log('✅ Table tutor_messages exists in public schema');
      
      // Verifica le colonne
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type')
        .eq('table_schema', 'public')
        .eq('table_name', 'tutor_messages');
      
      if (columnsError) {
        console.error('❌ Error checking columns:', columnsError);
      } else {
        console.log('✅ Table columns:', columns.map(c => `${c.column_name} (${c.data_type})`));
      }
    } else {
      console.log('❌ Table tutor_messages not found');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

applyTutorMessagesMigration();
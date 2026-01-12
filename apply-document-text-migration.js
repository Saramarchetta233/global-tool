const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Applicazione migrazione campi testo documento...');
console.log('📍 Database:', supabaseUrl);

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variabili ambiente mancanti');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    // Leggi il contenuto SQL
    const fs = require('fs');
    const migrationSQL = fs.readFileSync('./add-document-text-fields.sql', 'utf8');
    
    // Dividi le query SQL (rimuovi la query SELECT finale per ora)
    const queries = migrationSQL.split(';').filter(q => q.trim() && !q.includes('SELECT'));
    
    console.log(`📝 Esecuzione di ${queries.length} query...`);
    
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i].trim();
      if (!query) continue;
      
      console.log(`\n🔄 Query ${i + 1}/${queries.length}:`);
      console.log(query.substring(0, 100) + '...');
      
      const { data, error } = await supabase.rpc('exec_sql', { sql_query: query });
      
      if (error) {
        console.error(`❌ Errore nella query ${i + 1}:`, error);
        // Non fermarti se è un errore "already exists"
        if (!error.message?.includes('already exists')) {
          throw error;
        }
        console.log('⚠️  Campo già esistente, continuo...');
      } else {
        console.log(`✅ Query ${i + 1} completata`);
      }
    }
    
    // Ora verifica le colonne
    console.log('\n🔍 Verifica colonne create...');
    const { data: columns, error: checkError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', 'documents')
      .in('column_name', ['extracted_text', 'document_structure', 'processing_metadata']);
    
    if (checkError) {
      console.error('❌ Errore verifica:', checkError);
    } else {
      console.log('\n✅ Colonne trovate:');
      columns.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`);
      });
    }
    
    console.log('\n✅ Migrazione completata con successo!');
    
  } catch (error) {
    console.error('❌ Errore migrazione:', error);
    process.exit(1);
  }
}

runMigration();
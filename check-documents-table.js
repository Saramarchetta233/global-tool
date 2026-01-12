const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Verifica tabella documents...');
console.log('📍 Database:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTable() {
  try {
    // Check if documents table exists
    const { data: docs, error: docsError } = await supabase
      .from('documents')
      .select('id')
      .limit(1);
    
    if (docsError) {
      console.log('❌ Tabella documents non trovata:', docsError.message);
      console.log('\n📋 Per creare la tabella, esegui questo SQL in Supabase:');
      console.log('https://supabase.com/dashboard/project/ldycfecwxhqcrqzaxkkz/sql/new');
      console.log('\nCopia e incolla il contenuto di: create-documents-table.sql');
      return;
    }
    
    console.log('✅ Tabella documents esiste!');
    
    // Check for new columns
    const { data: colCheck, error: colError } = await supabase
      .from('documents')
      .select('id, extracted_text, document_structure, processing_metadata')
      .limit(1);
    
    if (colError) {
      console.log('\n⚠️  Le nuove colonne NON esistono ancora');
      console.log('Errore:', colError.message);
      console.log('\n📋 Per aggiungere le colonne, esegui questo SQL:');
      console.log('https://supabase.com/dashboard/project/ldycfecwxhqcrqzaxkkz/sql/new');
      console.log('\nCopia e incolla il contenuto di: add-document-text-fields.sql');
    } else {
      console.log('✅ Tutte le colonne esistono!');
    }
    
  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

checkTable();
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔧 Verifica colonne tabella tutor_sessions...');
console.log('📍 Database:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkColumns() {
  try {
    // Get a sample row to see all columns
    const { data, error } = await supabase
      .from('tutor_sessions')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Errore:', error.message);
      return;
    }
    
    console.log('✅ Tabella tutor_sessions trovata!');
    
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log('\n📋 Colonne esistenti:');
      columns.forEach(col => console.log(`  - ${col}`));
      
      // Check for specific columns we might need
      const hasProcessingMetadata = columns.includes('processing_metadata');
      const hasRiassuntoUltra = columns.includes('riassunto_ultra');
      
      console.log('\n🔍 Verifica colonne per riassunto ultra:');
      console.log(`  - processing_metadata: ${hasProcessingMetadata ? '✅ Esiste' : '❌ Manca'}`);
      console.log(`  - riassunto_ultra: ${hasRiassuntoUltra ? '✅ Esiste' : '❌ Manca'}`);
      
      if (!hasProcessingMetadata || !hasRiassuntoUltra) {
        console.log('\n📝 SQL per aggiungere colonne mancanti:');
        if (!hasProcessingMetadata) {
          console.log('ALTER TABLE public.tutor_sessions ADD COLUMN processing_metadata JSONB DEFAULT \'{}\';');
        }
        if (!hasRiassuntoUltra) {
          console.log('ALTER TABLE public.tutor_sessions ADD COLUMN riassunto_ultra TEXT;');
        }
      }
    } else {
      console.log('⚠️  Nessun dato trovato nella tabella');
    }
    
  } catch (error) {
    console.error('❌ Errore:', error);
  }
}

checkColumns();
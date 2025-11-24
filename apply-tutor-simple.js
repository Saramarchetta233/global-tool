const { createClient } = require('@supabase/supabase-js');

// Leggi le variabili di ambiente manualmente
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
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTutorTable() {
  try {
    console.log('🔄 Creating tutor_messages table...');
    
    // Semplice inserimento usando Supabase API direttamente
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS public.tutor_messages (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        message_content TEXT,
        response_content TEXT,
        cost INTEGER DEFAULT 0,
        was_free BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    // Proviamo a inserire direttamente un record per testare
    console.log('🔄 Inserting test record...');
    
    // Prima proviamo a ottenere l'ID dell'utente corrente
    const { data: userData, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.log('❌ No authenticated user, using fallback method...');
      
      // Proviamo a creare la tabella usando una query diretta
      const { data, error } = await supabase
        .from('tutor_messages') 
        .select('id')
        .limit(1);
      
      if (error && error.code === 'PGRST205') {
        console.log('❌ Table tutor_messages does not exist');
        console.log('📝 Please run this SQL manually in Supabase SQL Editor:');
        console.log('---');
        console.log(createTableSQL);
        console.log('---');
        process.exit(1);
      }
    } else {
      console.log('✅ User authenticated, testing table...');
      
      // Prova a fare una query semplice per verificare se la tabella esiste
      const { data, error } = await supabase
        .from('tutor_messages')
        .select('count')
        .limit(1);
        
      if (error) {
        if (error.code === 'PGRST205') {
          console.log('❌ Table tutor_messages does not exist');
          console.log('📝 Please run this SQL manually in Supabase SQL Editor:');
          console.log('---');
          console.log(createTableSQL);
          console.log('---');
          console.log('💡 Then run this script again to verify');
        } else {
          console.error('❌ Error:', error);
        }
        process.exit(1);
      } else {
        console.log('✅ Table tutor_messages exists and is accessible!');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

createTutorTable();
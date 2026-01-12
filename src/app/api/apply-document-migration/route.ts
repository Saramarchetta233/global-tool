import { NextRequest, NextResponse } from 'next/server';

import { supabaseAdmin } from '@/lib/supabase';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    if (!supabaseAdmin) {
      return NextResponse.json({ error: 'Admin client not configured' }, { status: 500 });
    }

    console.log('🔄 Applying document text fields migration...');
    
    // Since we can't execute DDL directly, we'll verify and guide the user
    const requiredColumns = ['extracted_text', 'document_structure', 'processing_metadata'];
    
    // Check if documents table exists and get its current schema
    const { data: existingDocs, error: tableError } = await supabaseAdmin
      .from('documents')
      .select('*')
      .limit(1);
    
    console.log('Table check:', { hasData: !!existingDocs, error: tableError?.message });
    
    if (tableError && tableError.message.includes('not found')) {
      // Table doesn't exist, need to create it first
      const createTableSQL = `
-- Execute this SQL in your Supabase SQL Editor FIRST:
-- Go to: https://supabase.com/dashboard/project/ldycfecwxhqcrqzaxkkz/sql/new

${require('fs').readFileSync('./create-documents-table.sql', 'utf8')}
`;
      
      return NextResponse.json({ 
        error: 'Documents table not found. Please create it first.',
        tableError: tableError.message,
        sqlToExecute: createTableSQL,
        instructions: 'Copy the SQL above and execute it in your Supabase SQL Editor'
      }, { status: 400 });
    }
    
    // Try to select the new columns to see if they exist
    const { data: checkColumns, error: columnsError } = await supabaseAdmin
      .from('documents')
      .select('id, extracted_text, document_structure, processing_metadata')
      .limit(1);
    
    const missingColumns = [];
    if (columnsError?.message.includes('column') || columnsError?.message.includes('does not exist')) {
      // Parse error to find missing columns
      requiredColumns.forEach(col => {
        if (columnsError.message.includes(col)) {
          missingColumns.push(col);
        }
      });
    }
    
    const results = {
      tableExists: !tableError,
      columnsExist: !columnsError,
      missingColumns: missingColumns.length > 0 ? missingColumns : 'All columns exist',
      manualSqlRequired: missingColumns.length > 0
    };

    console.log('Migration check results:', results);
    
    if (results.manualSqlRequired) {
      // Generate SQL for manual execution
      const migrationSQL = `
-- Execute this SQL in your Supabase SQL Editor:
-- Go to: https://supabase.com/dashboard/project/ldycfecwxhqcrqzaxkkz/sql/new

-- Add columns for full text and metadata
ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS extracted_text TEXT;

ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS document_structure JSONB;

ALTER TABLE public.documents 
ADD COLUMN IF NOT EXISTS processing_metadata JSONB DEFAULT '{}';

-- Add full-text search index
CREATE INDEX IF NOT EXISTS idx_documents_extracted_text_search 
ON public.documents 
USING gin(to_tsvector('italian', extracted_text));

-- Add comments for documentation
COMMENT ON COLUMN public.documents.extracted_text IS 'Testo completo estratto dal PDF tramite LlamaParse';
COMMENT ON COLUMN public.documents.document_structure IS 'Struttura del documento (capitoli, sezioni, etc) in formato JSON';
COMMENT ON COLUMN public.documents.processing_metadata IS 'Metadati di elaborazione (stato riassunto ultra, progress, etc)';
`;
      
      return NextResponse.json({ 
        success: false,
        message: 'Manual SQL execution required',
        results,
        sqlToExecute: migrationSQL,
        instructions: 'Copy the SQL above and execute it in your Supabase SQL Editor'
      }, { status: 200 });
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'All required columns already exist!',
      results
    });
    
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}
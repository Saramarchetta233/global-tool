// Test the improved prompts function
const { createImprovedSummaryPrompt } = require('./src/lib/improvedPrompts.ts');

console.log('🧪 Testing improved prompts...');

try {
  const testText = "Questo è un esempio di documento universitario. Il corso tratta di algoritmi e strutture dati. Gli argomenti principali includono: ordinamento, ricerca, alberi binari e grafi. Ogni argomento viene spiegato con esempi pratici e implementazioni.";
  
  const prompt = createImprovedSummaryPrompt({
    language: 'Italian',
    text: testText,
    targetLanguage: 'Italian',
    documentLength: testText.length
  });
  
  console.log('✅ Prompt generato con successo');
  console.log('📏 Lunghezza prompt:', prompt.length, 'caratteri');
  console.log('📋 Preview prompt (primi 500 chars):');
  console.log(prompt.substring(0, 500) + '...');
  
  // Check if it contains HTML formatting requirements
  const hasHtmlFormatting = prompt.includes('<div class="definizione">') && prompt.includes('📚');
  console.log('🎨 Contiene formattazione HTML avanzata:', hasHtmlFormatting ? '✅' : '❌');
  
  // Check if it mentions the Ultra button
  const hasUltraButton = prompt.includes('riassunto-ultra-cta') && prompt.includes('250 crediti');
  console.log('🚀 Contiene pulsante Ultra:', hasUltraButton ? '✅' : '❌');
  
} catch (error) {
  console.error('❌ Test failed:', error.message);
}
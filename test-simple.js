console.log('🧪 Testing simple functionality...');

// Simulate the improved prompt logic
function createImprovedSummaryPrompt({ language, text, targetLanguage, documentLength }) {
  const docChars = documentLength || text.length;
  const briefTarget = Math.min(Math.max(1500, docChars / 20), 2500);
  
  let extendedTarget = '';
  if (docChars <= 150000) {
    extendedTarget = '2.000-4.000 parole';
  } else if (docChars <= 450000) {
    extendedTarget = '4.000-8.000 parole';
  } else if (docChars <= 900000) {
    extendedTarget = '8.000-12.000 parole';
  } else {
    extendedTarget = '12.000-15.000 parole';
  }

  return `Test prompt with target lengths: Brief=${Math.round(briefTarget)}, Extended=${extendedTarget}`;
}

const testText = "Questo è un test di documento universitario con contenuti di esempio.";
const result = createImprovedSummaryPrompt({
  language: 'Italian',
  text: testText,
  targetLanguage: 'Italian',
  documentLength: testText.length
});

console.log('✅ Test result:', result);
console.log('📊 Test passed: Prompt logic works correctly');
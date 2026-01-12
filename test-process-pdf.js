const FormData = require('form-data');
const fs = require('fs');

console.log('🧪 Test process-pdf-v2 endpoint...');

async function testEndpoint() {
  try {
    const form = new FormData();
    
    // Create a small test file
    fs.writeFileSync('./test.txt', 'Questo è un test del sistema. Contenuto di prova per verificare che il salvataggio funzioni.');
    
    form.append('file', fs.createReadStream('./test.txt'), {
      filename: 'test.txt',
      contentType: 'text/plain'
    });
    form.append('language', 'Italiano');
    form.append('userId', 'test-user-123');
    
    const response = await fetch('http://localhost:3000/api/process-pdf-v2', {
      method: 'POST',
      body: form
    });
    
    const result = await response.text();
    console.log('Response status:', response.status);
    console.log('Response (first 500 chars):', result.substring(0, 500));
    
    // Cleanup
    fs.unlinkSync('./test.txt');
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

// Ensure server is running first
setTimeout(testEndpoint, 2000);
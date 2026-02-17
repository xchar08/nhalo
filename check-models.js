const https = require('https');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
let apiKey = process.env.CEREBRAS_API_KEY;
if (!apiKey) {
  try {
    const envPath = path.join(__dirname, '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const match = envContent.match(/CEREBRAS_API_KEY=(.*)/);
      if (match) {
        apiKey = match[1].trim();
      }
    }
  } catch (err) {
    console.error('Error reading .env.local:', err);
  }
}

if (!apiKey) {
  console.error('Error: CEREBRAS_API_KEY not found in environment or .env.local');
  process.exit(1);
}

const options = {
  hostname: 'api.cerebras.ai',
  path: '/v1/models',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
};

const req = https.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      try {
        const response = JSON.parse(data);
        console.log('Available Models:');
        response.data.forEach(model => {
          console.log(`- ${model.id}`);
        });
      } catch (e) {
        console.error('Error parsing response:', e);
        console.log('Raw response:', data);
      }
    } else {
      console.error(`Request failed with status code ${res.statusCode}`);
      console.error('Response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.end();

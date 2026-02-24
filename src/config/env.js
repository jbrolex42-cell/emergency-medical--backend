const requiredEnvVars = [
  'DATABASE_URL',
  'JWT_SECRET',
  'FRONTEND_URL'
];

const validateEnv = () => {
  const missing = requiredEnvVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
};

module.exports = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '24h',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  
  // SHA (Social Health Authority) Integration
  SHA_API_URL: process.env.SHA_API_URL || 'https://api.sha.go.ke/v1',
  SHA_API_KEY: process.env.SHA_API_KEY,
  SHA_CLIENT_ID: process.env.SHA_CLIENT_ID,
  
  // what3words for rural addressing
  WHAT3WORDS_API_KEY: process.env.WHAT3WORDS_API_KEY,
  
  // Twilio for SMS notifications
  TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
  TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
  TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER,
  
  validateEnv
};
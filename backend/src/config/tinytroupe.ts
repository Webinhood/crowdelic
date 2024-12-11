import dotenv from 'dotenv';

dotenv.config();

export const tinyTroupeConfig = {
  pythonPath: process.env.PYTHON_PATH || 'python3',
  scriptPath: process.env.TINYTROUPE_SCRIPT_PATH || './src/python/tinytroupe/bridge.py',
  apiKey: process.env.OPENAI_API_KEY || '',
  model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  cacheEnabled: process.env.CACHE_ENABLED === 'true',
  cacheDir: process.env.CACHE_DIR || './cache/tinytroupe',
  loggingLevel: process.env.LOGGING_LEVEL || 'info'
};

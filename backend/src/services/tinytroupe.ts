import { spawn } from 'child_process';
import path from 'path';
import { Test, Persona } from '../types';

interface TinyTroupeConfig {
  pythonPath: string;
  scriptPath: string;
  apiKey: string;
  model: string;
  cacheEnabled: boolean;
  cacheDir: string;
  loggingLevel: string;
}

class TinyTroupeService {
  private config: TinyTroupeConfig;

  constructor(config: Partial<TinyTroupeConfig> = {}) {
    this.config = {
      pythonPath: process.env.PYTHON_PATH || 'python3',
      scriptPath: process.env.TINYTROUPE_SCRIPT_PATH || path.join(__dirname, '../python/tinytroupe/bridge.py'),
      apiKey: process.env.OPENAI_API_KEY || '',
      model: process.env.OPENAI_MODEL || 'gpt-4',
      cacheEnabled: process.env.CACHE_ENABLED === 'true',
      cacheDir: process.env.CACHE_DIR || './cache/tinytroupe',
      loggingLevel: process.env.LOGGING_LEVEL || 'info',
      ...config
    };
  }

  async runTestSimulation(test: Test, personas: Persona[], onMessage?: (message: any) => void): Promise<any> {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(this.config.pythonPath, [
        this.config.scriptPath,
        '--test', JSON.stringify({ ...test, test_id: test.id }),
        '--personas', JSON.stringify(personas),
        '--config', JSON.stringify({
          api_key: this.config.apiKey,
          model: this.config.model,
          cache_enabled: this.config.cacheEnabled,
          cache_dir: this.config.cacheDir,
          logging_level: this.config.loggingLevel
        })
      ]);

      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        console.log('[TinyTroupe] Raw stdout data:', data.toString());
        const lines = data.toString().split('\n');
        for (const line of lines) {
          if (!line) continue;
          console.log('[TinyTroupe] Processing line:', line);

          // Primeiro tenta parsear como mensagem individual
          try {
            const message = JSON.parse(line);
            console.log('[TinyTroupe] Parsed message:', message);
            if (message.type === 'message' && onMessage) {
              console.log('[TinyTroupe] Calling onMessage with:', message);
              onMessage(message);
            }
          } catch (e) {
            // Se não for uma mensagem, verifica se é o resultado final
            console.log('[TinyTroupe] JSON parse failed, checking for result');
            const resultMatch = line.match(/__RESULT_START__(.+)__RESULT_END__/);
            if (resultMatch) {
              console.log('[TinyTroupe] Found result, extracting JSON');
              output = resultMatch[1];
            }
          }
        }
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error('[TinyTroupe] stderr:', data.toString());
        errorOutput += data.toString();
      });

      pythonProcess.on('close', (code) => {
        console.log('[TinyTroupe] Process closed with code:', code);
        console.log('[TinyTroupe] Final output:', output);
        console.log('[TinyTroupe] Error output:', errorOutput);
        
        if (code !== 0) {
          reject(new Error(`TinyTroupe simulation failed: ${errorOutput}`));
          return;
        }
        try {
          console.log('[TinyTroupe] Attempting to parse output');
          const results = JSON.parse(output);
          console.log('[TinyTroupe] Successfully parsed results:', results);
          resolve(results);
        } catch (error) {
          console.error('[TinyTroupe] Parse error:', error);
          console.error('[TinyTroupe] Failed to parse output:', output);
          reject(new Error('Failed to parse simulation output'));
        }
      });
    });
  }

  async generatePersonaTraits(basePersona: Partial<Persona>): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(this.config.pythonPath, [
        this.config.scriptPath,
        '--generate-traits',
        '--base-persona', JSON.stringify(basePersona),
        '--config', JSON.stringify({
          api_key: this.config.apiKey,
          model: this.config.model,
          cache_enabled: this.config.cacheEnabled,
          cache_dir: this.config.cacheDir,
          logging_level: this.config.loggingLevel
        })
      ]);

      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        console.log('[TinyTroupe] Raw stdout data:', data.toString());
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error('[TinyTroupe] stderr:', data.toString());
        errorOutput += data.toString();
      });

      pythonProcess.on('close', (code) => {
        console.log('[TinyTroupe] Process closed with code:', code);
        console.log('[TinyTroupe] Final output:', output);
        console.log('[TinyTroupe] Error output:', errorOutput);
        
        if (code !== 0) {
          reject(new Error(`Trait generation failed: ${errorOutput}`));
          return;
        }
        try {
          console.log('[TinyTroupe] Attempting to parse output');
          const traits = JSON.parse(output);
          console.log('[TinyTroupe] Successfully parsed traits:', traits);
          resolve(traits);
        } catch (error) {
          console.error('[TinyTroupe] Parse error:', error);
          console.error('[TinyTroupe] Failed to parse output:', output);
          reject(new Error('Failed to parse traits output'));
        }
      });
    });
  }

  async createTinyPerson(persona: Persona): Promise<any> {
    return new Promise((resolve, reject) => {
      const pythonProcess = spawn(this.config.pythonPath, [
        this.config.scriptPath,
        '--create-person',
        '--persona', JSON.stringify(persona),
        '--config', JSON.stringify({
          api_key: this.config.apiKey,
          model: this.config.model,
          cache_enabled: this.config.cacheEnabled,
          cache_dir: this.config.cacheDir,
          logging_level: this.config.loggingLevel
        })
      ]);

      let output = '';
      let errorOutput = '';

      pythonProcess.stdout.on('data', (data) => {
        console.log('[TinyTroupe] Raw stdout data:', data.toString());
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        console.error('[TinyTroupe] stderr:', data.toString());
        errorOutput += data.toString();
      });

      pythonProcess.on('close', (code) => {
        console.log('[TinyTroupe] Process closed with code:', code);
        console.log('[TinyTroupe] Final output:', output);
        console.log('[TinyTroupe] Error output:', errorOutput);
        
        if (code !== 0) {
          reject(new Error(`Person creation failed: ${errorOutput}`));
          return;
        }
        try {
          console.log('[TinyTroupe] Attempting to parse output');
          const person = JSON.parse(output);
          console.log('[TinyTroupe] Successfully parsed person:', person);
          resolve(person);
        } catch (error) {
          console.error('[TinyTroupe] Parse error:', error);
          console.error('[TinyTroupe] Failed to parse output:', output);
          reject(new Error('Failed to parse person output'));
        }
      });
    });
  }
}

export default TinyTroupeService;

import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente do arquivo .env
load_dotenv()

class Config:
    # Configurações do Flask
    DEBUG = True
    SECRET_KEY = os.getenv('FLASK_SECRET_KEY', 'dev_key_123')
    
    # Configurações do OpenAI
    OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
    OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')
    
    # Configurações do TinyTroupe
    TINYTROUPE_SCRIPT_PATH = os.getenv('TINYTROUPE_SCRIPT_PATH')
    PYTHON_PATH = os.getenv('PYTHON_PATH', 'python3')
    
    # Configurações de Cache
    CACHE_ENABLED = os.getenv('CACHE_ENABLED', 'true').lower() == 'true'
    CACHE_DIR = os.getenv('CACHE_DIR', './cache')
    
    # Configurações de Log
    LOGGING_LEVEL = os.getenv('LOGGING_LEVEL', 'info')

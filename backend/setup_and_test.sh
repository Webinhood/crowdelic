#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Setting up TinyTroupe integration test environment...${NC}"

# Create Python virtual environment
echo "Creating Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "Installing Python dependencies..."
pip install openai

# Install Node.js dependencies
echo "Installing Node.js dependencies..."
npm install typescript ts-node @types/node

# Set up environment variables
echo "Setting up environment variables..."
export OPENAI_API_KEY="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"
export PYTHON_PATH="$(which python3)"
export TINYTROUPE_SCRIPT_PATH="$(pwd)/src/scripts/tinytroupe_mock.py"
export CACHE_ENABLED="true"
export CACHE_DIR="./cache/tinytroupe"
export LOGGING_LEVEL="info"

# Make Python script executable
chmod +x src/scripts/tinytroupe_mock.py

# Run the test
echo -e "${GREEN}Running TinyTroupe integration test...${NC}"
npx ts-node src/tests/tinytroupe_test.ts

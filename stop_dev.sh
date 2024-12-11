#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${RED}Stopping Crowdelic Development Environment...${NC}"

# Stop backend
if [ -f logs/backend.pid ]; then
    echo -e "${GREEN}Stopping backend server...${NC}"
    kill $(cat logs/backend.pid) 2>/dev/null
    rm logs/backend.pid
fi

# Stop frontend
if [ -f logs/frontend.pid ]; then
    echo -e "${GREEN}Stopping frontend server...${NC}"
    kill $(cat logs/frontend.pid) 2>/dev/null
    rm logs/frontend.pid
fi

echo -e "${GREEN}All services stopped!${NC}"

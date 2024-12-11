#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to check if a port is in use
port_in_use() {
    lsof -i:"$1" >/dev/null 2>&1
}

echo -e "${BLUE}Starting Crowdelic Development Environment...${NC}"

# Check for required commands
for cmd in node npm lsof; do
    if ! command_exists "$cmd"; then
        echo -e "${RED}Error: $cmd is not installed${NC}"
        exit 1
    fi
done

# Kill any existing processes on the required ports
echo -e "${GREEN}Cleaning up existing processes...${NC}"
for port in 3000 5173 5174; do
    if port_in_use "$port"; then
        echo -e "${BLUE}Stopping process on port $port...${NC}"
        lsof -ti:"$port" | xargs kill -9 2>/dev/null
    fi
done

# Create logs directory
mkdir -p logs
rm -f logs/*.log logs/*.pid

# Install dependencies if needed
echo -e "${GREEN}Installing backend dependencies...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    npm install
fi

echo -e "${GREEN}Installing frontend dependencies...${NC}"
cd ../frontend
if [ ! -d "node_modules" ]; then
    npm install
fi

# Start backend
echo -e "${GREEN}Starting backend server...${NC}"
cd ../backend
npm run dev > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo $BACKEND_PID > ../logs/backend.pid

# Wait for backend to start
echo -e "${BLUE}Waiting for backend to start...${NC}"
sleep 5

# Check if backend is running
if ! port_in_use 3000; then
    echo -e "${RED}Error: Backend failed to start. Check logs/backend.log${NC}"
    exit 1
fi

# Start frontend
echo -e "${GREEN}Starting frontend server...${NC}"
cd ../frontend
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > ../logs/frontend.pid

# Wait for frontend to start and get the actual port
echo -e "${BLUE}Waiting for frontend to start...${NC}"
sleep 5

# Check frontend logs for the port
FRONTEND_PORT=$(grep -o "Local:.*http://localhost:[0-9]\+" ../logs/frontend.log | tail -n1 | grep -o "[0-9]\+$")

if [ -z "$FRONTEND_PORT" ]; then
    echo -e "${RED}Error: Frontend failed to start. Check logs/frontend.log${NC}"
    cat ../logs/frontend.log
    exit 1
fi

echo -e "\n${GREEN}Development environment is ready!${NC}"
echo -e "${BLUE}Frontend: http://localhost:${FRONTEND_PORT}${NC}"
echo -e "${BLUE}Backend API: http://localhost:3000${NC}"
echo -e "${BLUE}Logs: ./logs/frontend.log and ./logs/backend.log${NC}"
echo -e "${BLUE}To stop: ./stop_dev.sh${NC}\n"

# Show logs
echo -e "${GREEN}Showing logs (Ctrl+C to hide logs, services will keep running):${NC}"
tail -f logs/backend.log logs/frontend.log

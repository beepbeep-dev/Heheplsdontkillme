#!/bin/bash
# Start Cole's OS server + SSH tunnel to serveo.net

# Kill any existing server on 8080
fuser -k 8080/tcp 2>/dev/null

# Start the Node server in background
node index.js &
SERVER_PID=$!
echo "Server started (PID $SERVER_PID)"

sleep 1

echo ""
echo "Opening tunnel... your URL will appear below:"
echo ""

# Try serveo.net first, fall back to localhost.run
ssh -o StrictHostKeyChecking=no -o ServerAliveInterval=30 -R 80:localhost:8080 serveo.net || \
ssh -o StrictHostKeyChecking=no -R 80:localhost:8080 nokey@localhost.run

# Kill server when tunnel exits
kill $SERVER_PID 2>/dev/null

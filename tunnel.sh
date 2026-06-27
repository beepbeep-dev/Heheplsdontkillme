#!/bin/bash
# Start Cole's OS server + SSH tunnel

# Kill anything already on 8080
fuser -k 8080/tcp 2>/dev/null
sleep 0.5

# Start Node server in background
node index.js &
SERVER_PID=$!

# Wait for server to be ready
until curl -sf http://localhost:8080 > /dev/null 2>&1; do sleep 0.3; done

echo ""
echo "========================================="
echo "  Cole's OS is running!"
echo "  Your tunnel URL will appear below:"
echo "========================================="
echo ""

tunnel_url() {
  # Try serveo.net first (faster, more reliable)
  ssh -o StrictHostKeyChecking=no \
      -o ServerAliveInterval=20 \
      -o ExitOnForwardFailure=yes \
      -R 80:localhost:8080 serveo.net 2>&1 | while IFS= read -r line; do
    echo "$line"
    if echo "$line" | grep -q "https://"; then
      url=$(echo "$line" | grep -oP 'https://\S+')
      echo ""
      echo ">>> OPEN THIS URL: $url <<<"
      echo ""
    fi
  done
}

tunnel_url || {
  echo "serveo.net failed, trying localhost.run..."
  ssh -o StrictHostKeyChecking=no \
      -o ServerAliveInterval=20 \
      -R 80:localhost:8080 nokey@localhost.run
}

kill $SERVER_PID 2>/dev/null

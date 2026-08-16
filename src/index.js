import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import { gameManger } from "./gameManger.js";

const PORT = process.env.PORT || 3000;

// HTTP server for health checks
const server = createServer((req, res) => {
  if (req.url === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

// WebSocket server using the same HTTP server
const wss = new WebSocketServer({ server });

const game = new gameManger();

wss.on('connection', function connection(ws) {
  ws.on('error', console.error);

  ws.on('close', () => {
    game.removeUser(ws);
  });

  game.addNewUser(ws);
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

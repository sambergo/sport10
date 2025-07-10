import express, { Request, Response } from 'express';
import http from 'http';
import { initWebSocketServer } from './websocket';

const app = express();
const server = http.createServer(app);

// Initialize the WebSocket server
initWebSocketServer(server);

const PORT: string | number = process.env.PORT || 3001;

app.get('/', (req: Request, res: Response) => {
  res.send('Smart10 Backend is running!');
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

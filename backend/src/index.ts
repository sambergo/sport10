import express, { Request, Response } from 'express';
import http from 'http';
import path from 'path';
import { initWebSocketServer } from './websocket';
import { initDatabase } from './database'; // New import
import apiRoutes from './routes/api';

const app = express();
app.use(express.json());
const server = http.createServer(app);

// Initialize the database before starting the server
initDatabase().then(() => {
  // Initialize the WebSocket server
  initWebSocketServer(server);

  const PORT: string | number = process.env.PORT || 3001;

  // Serve static files from frontend build
  app.use(express.static(path.join(__dirname, '../../frontend/dist')));

  // API routes
  app.use('/api', apiRoutes);

  // Serve the React app for all other routes (SPA routing)
  app.use((req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
  });

  server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
    console.log(`Frontend served from: ${path.join(__dirname, '../../frontend/dist')}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

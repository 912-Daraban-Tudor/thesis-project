// server/src/app.js
import express from 'express';
import http from 'http'; // 🧠 for wrapping Express with socket.io
import cors from 'cors';
import dotenv from 'dotenv';
import { initSocket } from './socket.js'; // ✅ Import socket.io logic

import authRoutes from './routes/authRoute.js';
import locationRoutes from './routes/locationRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import chatRoutes from './routes/chatRoutes.js'; // Optional: placeholder for chatRoutes
import imageRoutes from './routes/imageRoutes.js'; // Optional: placeholder for imageRoutes
import transportRoutes from './routes/transportRoutes.js'; // Optional: placeholder for transportRoutes

dotenv.config();

const app = express();
const server = http.createServer(app); // 💡 Wrap app with HTTP server

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/transport', transportRoutes);
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server with WebSocket running on port ${PORT}`);
});

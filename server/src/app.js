// server/src/app.js
import express from 'express';
import http from 'http'; // 🧠 for wrapping Express with socket.io
import cors from 'cors';
import dotenv from 'dotenv';
import { initSocket } from './socket.js'; // ✅ Import socket.io logic
import helmet from 'helmet';
import compression from 'compression';

import authRoutes from './routes/authRoute.js';
import locationRoutes from './routes/locationRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import chatRoutes from './routes/chatRoutes.js'; // Optional: placeholder for chatRoutes
import imageRoutes from './routes/imageRoutes.js'; // Optional: placeholder for imageRoutes
import transportRoutes from './routes/transportRoutes.js'; // Optional: placeholder for transportRoutes
import geocodeRoutes from './routes/geocodeRoutes.js'; // Optional: placeholder for geocodeRoutes


dotenv.config();


const app = express();
const server = http.createServer(app); // 💡 Wrap app with HTTP server

app.use(helmet());
app.use(compression());

const allowedOrigins = [
  'http://localhost:3000',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/transport', transportRoutes);
app.use('/api/geocode', geocodeRoutes);
app.use((err, req, res, next) => {
  console.error('❌ Unexpected server error:', err.stack);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log('Running in', process.env.NODE_ENV, 'mode');
  console.log(`Server with WebSocket running on port ${PORT}`);
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoute.js';
import locationRoutes from './routes/locationRoutes.js';
import pool from './models/db.js'; // already here
import roomRoutes from './routes/roomRoutes.js'; // Import room routes
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Test database connection (optional now)
// pool.query('SELECT NOW()', (err, res) => {
//   if (err) console.error('DB Error:', err);
//   else console.log('DB Connected:', res.rows[0]);
// });

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes)
app.use('/api/rooms', roomRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

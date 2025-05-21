// server/src/socket.js
import jwt from 'jsonwebtoken';
import { Server } from 'socket.io';
import pool from './models/db.js'; // DB client
import dotenv from 'dotenv';
dotenv.config();

let io;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CLIENT_URL || 'http://localhost:3000',
            credentials: true,
        },
    });

    io.use((socket, next) => {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('Unauthorized'));

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded;
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        const userId = socket.user.id;
        socket.join(userId.toString());
        console.log(`User ${userId} connected to WebSocket`);

        // Listen for sending a message
        socket.on('send_message', async ({ recipientId, content }) => {
            try {
                // Make sure the conversation exists or create it
                const [id1, id2] = [userId, recipientId].sort((a, b) => a - b);
                let conversation = await pool.query(
                    'SELECT * FROM conversations WHERE user1_id = $1 AND user2_id = $2',
                    [id1, id2]
                );

                if (conversation.rows.length === 0) {
                    conversation = await pool.query(
                        'INSERT INTO conversations (user1_id, user2_id) VALUES ($1, $2) RETURNING *',
                        [id1, id2]
                    );
                }

                const conversationId = conversation.rows[0].id;

                // Insert message
                const result = await pool.query(
                    `INSERT INTO messages (conversation_id, sender_id, content)
           VALUES ($1, $2, $3)
           RETURNING *`,
                    [conversationId, userId, content]
                );

                const message = result.rows[0];

                // Update conversation timestamp
                await pool.query(
                    'UPDATE conversations SET last_message_at = NOW() WHERE id = $1',
                    [conversationId]
                );

                // Emit to sender and recipient
                io.to(userId.toString()).emit('new_message', { ...message, isMine: true });
                io.to(recipientId.toString()).emit('new_message', { ...message, isMine: false });
            } catch (err) {
                console.error('Error sending message via WebSocket:', err);
            }
        });

        socket.on('disconnect', () => {
            console.log(`User ${userId} disconnected`);
        });
    });
};

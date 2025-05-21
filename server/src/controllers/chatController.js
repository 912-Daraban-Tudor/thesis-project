// server/src/controllers/chatController.js
import pool from '../models/db.js';

export const getUserConversations = async (req, res) => {
    const userId = req.user.id;

    try {
        const result = await pool.query(`
      SELECT c.*, 
             u1.username AS user1_username, 
             u2.username AS user2_username
      FROM conversations c
      JOIN users u1 ON c.user1_id = u1.id
      JOIN users u2 ON c.user2_id = u2.id
      WHERE c.user1_id = $1 OR c.user2_id = $1
      ORDER BY c.last_message_at DESC
    `, [userId]);

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching conversations:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMessagesInConversation = async (req, res) => {
    const userId = req.user.id;
    const { conversationId } = req.params;

    try {
        // Ensure user is part of conversation
        const convCheck = await pool.query(`
      SELECT * FROM conversations
      WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)
    `, [conversationId, userId]);

        if (convCheck.rows.length === 0) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        const messages = await pool.query(`
      SELECT * FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
    `, [conversationId]);

        res.json(messages.rows);
    } catch (err) {
        console.error('Error fetching messages:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

export const sendMessageToUser = async (req, res) => {
    const senderId = req.user.id;
    const recipientId = parseInt(req.params.userId);
    const { content } = req.body;

    if (!content) return res.status(400).json({ message: 'Empty message' });

    try {
        const [id1, id2] = [senderId, recipientId].sort((a, b) => a - b);

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

        const result = await pool.query(
            `INSERT INTO messages (conversation_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING *`,
            [conversationId, senderId, content]
        );

        await pool.query(
            'UPDATE conversations SET last_message_at = NOW() WHERE id = $1',
            [conversationId]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

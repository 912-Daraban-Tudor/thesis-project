// server/src/routes/chatRoutes.js
import express from 'express';
import { verifyToken } from '../middleware/authMiddleware.js';
import {
    getUserConversations,
    getMessagesInConversation,
    sendMessageToUser,
} from '../controllers/chatController.js';

const router = express.Router();

router.use(verifyToken);

router.get('/conversations', getUserConversations);
router.get('/conversations/:conversationId/messages', getMessagesInConversation);
router.post('/conversations/:userId/messages', sendMessageToUser);

export default router;

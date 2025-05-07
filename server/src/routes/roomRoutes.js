import express from 'express';
import { addRoom, getRooms, updateRoom, deleteRoom } from '../controllers/roomController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, addRoom);
router.get('/', getRooms);
router.put('/:id', verifyToken, updateRoom);
router.delete('/:id', verifyToken, deleteRoom);

export default router;

import express from 'express';
import { addLocation, getLocationById, getLocations, addLocationWithRooms } from '../controllers/locationController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, addLocation);
router.get('/', getLocations);
router.get('/:id', getLocationById);
router.post('/with-rooms', verifyToken, addLocationWithRooms);


export default router;

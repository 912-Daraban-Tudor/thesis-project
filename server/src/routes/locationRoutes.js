import express from 'express';
import {
  addLocation,
  getLocationById,
  getLocations,
  addLocationWithRooms,
  getLocationsByUserIdJoined,
  updateLocationById,
  deleteLocationById,
  filterLocationsNearby
} from '../controllers/locationController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', verifyToken, addLocation);
router.get('/', getLocations);
router.get('/filter', verifyToken, filterLocationsNearby);
router.post('/with-rooms', verifyToken, addLocationWithRooms);
router.get('/myrooms', verifyToken, getLocationsByUserIdJoined); // ← move up BEFORE /:id
router.get('/:id', getLocationById); // ← keep this last!
router.put('/:id', verifyToken, updateLocationById);
router.delete('/:id', verifyToken, deleteLocationById);


export default router;

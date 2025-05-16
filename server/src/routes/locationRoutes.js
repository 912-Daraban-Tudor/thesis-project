import express from 'express';
import {
  addLocation,
  getLocationById,
  getLocations,
  addLocationWithRooms,
  getLocationsByUserIdJoined,
  updateLocationById,
  deleteLocationById,
  filterLocationsNearby,
  searchFilteredLocations
} from '../controllers/locationController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

//CREATE
router.post('/', verifyToken, addLocation);
router.post('/with-rooms', verifyToken, addLocationWithRooms);

//READ
router.get('/', getLocations);
router.get('/search', verifyToken, searchFilteredLocations); // ← keep this for search
router.get('/filter', verifyToken, filterLocationsNearby);
router.get('/myrooms', verifyToken, getLocationsByUserIdJoined); // ← move up BEFORE /:id
router.get('/:id', getLocationById); // ← keep this last!

//UPDATE
router.put('/:id', verifyToken, updateLocationById);

//DELETE
router.delete('/:id', verifyToken, deleteLocationById);


export default router;

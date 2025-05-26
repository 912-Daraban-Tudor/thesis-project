import express from 'express';
import { geocodeSearch } from '../controllers/geocodeController.js';

const router = express.Router();
router.get('/', geocodeSearch);

export default router;

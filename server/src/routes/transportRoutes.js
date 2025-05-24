import express from 'express';
import { getDistinctBusLines } from '../controllers/transportController.js';

const router = express.Router();

router.get('/lines', getDistinctBusLines);

export default router;

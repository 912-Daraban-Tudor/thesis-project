import express from 'express';
import parser from '../middleware/cloudinaryUpload.js';
const router = express.Router();

// POST /api/images
router.post('/', parser.array('images', 10), (req, res) => {
    const imageUrls = req.files.map(file => file.path); // Cloudinary URLs
    res.json({ images: imageUrls });
});

export default router;

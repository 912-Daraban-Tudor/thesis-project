import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'apartments',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [{ width: 1280, height: 720, crop: 'limit' }],
    },
});

const parser = multer({ storage });

export default parser;

import express from 'express';
import { registerUser, loginUser, getUserInfo } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
import { updateUserInfo } from '../controllers/authController.js';
const router = express.Router();

// POST /api/auth/register
router.post('/register', registerUser);
// POST /api/auth/login
router.post('/login', loginUser);
// GET /api/auth/me (protected route)
router.get('/me', verifyToken, getUserInfo);

router.put('/me', verifyToken, updateUserInfo);


router.get('/protected', verifyToken, (req, res) => {
    res.json({ message: `Hello ${req.user.username}, you accessed a protected route!` });
  });

export default router;




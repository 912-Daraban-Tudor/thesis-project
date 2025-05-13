import express from 'express';
import { registerUser, loginUser, getUserInfo, updateUserInfo, getPublicUserInfo } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
const router = express.Router();

// POST /api/auth/register
router.post('/register', registerUser);
// POST /api/auth/login
router.post('/login', loginUser);
// GET /api/auth/me (protected route)

router.get('/me', verifyToken, getUserInfo);
router.get('/:id', verifyToken, getPublicUserInfo); // For getting user info by ID
router.put('/me', verifyToken, updateUserInfo);

router.delete('/me', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});



router.get('/protected', verifyToken, (req, res) => {
  res.json({ message: `Hello ${req.user.username}, you accessed a protected route!` });
});

export default router;




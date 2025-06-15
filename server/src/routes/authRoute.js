import express from 'express';
import { registerUser, loginUser, getUserInfo, updateUserInfo, getPublicUserInfo, getUserByUsername, getUserById } from '../controllers/authController.js';
import { verifyToken } from '../middleware/authMiddleware.js';
const router = express.Router();

//POST
router.post('/register', registerUser);
router.post('/login', loginUser);

//GET
router.get('/me', verifyToken, getUserInfo);
router.get('/:id', verifyToken, getPublicUserInfo);
router.get('/user-by-id/:id', getUserById);
router.get('/user-by-username/:username', getUserByUsername);
router.get('/protected', verifyToken, (req, res) => {
  res.json({ message: `Hello ${req.user.username}, you accessed a protected route!` });
});

//PUT
router.put('/me', verifyToken, updateUserInfo);


//DELETE
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



export default router;




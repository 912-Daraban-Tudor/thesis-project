import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../models/db.js';

export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;


    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email address." });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long." });
    }

    const existingUser = await pool.query(
      'SELECT * FROM users WHERE email = $1 OR username = $2',
      [email, username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Email or username already in use." });
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    await pool.query(
      'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3)',
      [username, email, passwordHash]
    );

    res.status(201).json({ message: "User registered successfully." });

  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};


export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '4h' }
    );

    res.json({ token });

  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};


export const getUserInfo = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from the token

    const userResult = await pool.query(
      'SELECT id, username, email, created_at, gender, profile_picture_url FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(userResult.rows[0]);

  } catch (error) {
    console.error("Error in getUserInfo:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};

export const getPublicUserInfo = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const userResult = await pool.query(
      'SELECT id, username, gender, profile_picture_url, created_at  FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(userResult.rows[0]);

  } catch (error) {
    console.error("Error in getPublicUserInfo:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};


export const updateUserInfo = async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, profilePictureUrl, gender } = req.body;

    if (!username) {
      return res.status(400).json({ message: "Username is required." });
    }

    const allowedGenders = ['male', 'female', 'other', null, undefined];
    if (!allowedGenders.includes(gender)) {
      return res.status(400).json({ message: "Invalid gender value." });
    }

    // Check if username is taken by another user
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE username = $1 AND id <> $2',
      [username, userId]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ message: "Username already in use by another account." });
    }
    // Update user info
    await pool.query(
      'UPDATE users SET username = $1, gender = $2, profile_picture_url = $3 WHERE id = $4',
      [username, gender || null, profilePictureUrl, userId]
    );

    res.json({ message: "User info updated successfully." });
  } catch (error) {
    console.error("Error in updateUserInfo:", error);
    res.status(500).json({ message: "Server error. Please try again." });
  }
};



export const getUserByUsername = async (req, res) => {
  const { username } = req.params;
  try {
    const result = await pool.query('SELECT id, username FROM users WHERE LOWER(username) = LOWER($1)', [username]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};


export const getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT id, username FROM users WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'User not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

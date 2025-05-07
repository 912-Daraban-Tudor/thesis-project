import pool from '../models/db.js';

// Add room
export const addRoom = async (req, res) => {
  try {
    const { location_id, description, price, balcony, sex_preference } = req.body;

    if (!location_id || !price) {
      return res.status(400).json({ message: 'Location ID and price are required.' });
    }

    const result = await pool.query(
      'INSERT INTO rooms (location_id, description, price, balcony, sex_preference) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [location_id, description, price, balcony, sex_preference]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding room:', err);
    res.status(500).json({ message: 'Server error while adding room.' });
  }
};

// Get rooms (optionally filter by location or availability)
export const getRooms = async (req, res) => {
  try {
    const { location_id } = req.query;
    let query = 'SELECT * FROM rooms';
    let params = [];

    if (location_id) {
      query += ' WHERE location_id = $1';
      params.push(location_id);
    } 

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching rooms:', err);
    res.status(500).json({ message: 'Server error while fetching rooms.' });
  }
};

// Update room
export const updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, price, balcony, sex_preference } = req.body;

    const result = await pool.query(
      'UPDATE rooms SET description = $1, price = $2, balcony = $3, sex_preference = $4 WHERE id = $5 RETURNING *',
      [description, price, balcony, sex_preference, id]
    );

    if (result.rowCount === 0) return res.status(404).json({ message: 'Room not found.' });

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating room:', err);
    res.status(500).json({ message: 'Server error while updating room.' });
  }
};

// Delete room
export const deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM rooms WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) return res.status(404).json({ message: 'Room not found.' });

    res.json({ message: 'Room deleted.' });
  } catch (err) {
    console.error('Error deleting room:', err);
    res.status(500).json({ message: 'Server error while deleting room.' });
  }
};


export const getRoomById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('SELECT * FROM rooms WHERE id = $1', [id]);

    if (result.rows.length === 0) return res.status(404).json({ message: 'Room not found.' });

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching room:', err);
    res.status(500).json({ message: 'Server error while fetching room.' });
  }
}
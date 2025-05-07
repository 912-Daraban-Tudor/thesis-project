import pool from '../models/db.js';
import axios from 'axios';


export const addLocation = async (req, res) => {
  try {
    const { name, description, latitude, longitude } = req.body;
    const userId = req.user.id;

    if (!name || !latitude || !longitude) {
      return res.status(400).json({ message: 'Name, latitude, and longitude are required.' });
    }

    const result = await pool.query(
      'INSERT INTO locations (name, description, latitude, longitude, created_by) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, latitude, longitude, userId]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error adding location:', err);
    res.status(500).json({ message: 'Server error while adding location.' });
  }
};

export const addLocationWithRooms = async (req, res) => {
    try {
      const { apartment, rooms } = req.body;
      const { name, address, latitude, longitude, floor, has_centrala, has_parking, year_built, number_of_rooms, description } = apartment;
      const userId = req.user.id;
  
      console.log('Received apartment:', apartment);
      console.log('Received rooms:', rooms);
  
      const locResult = await pool.query(
        `INSERT INTO locations (name, address, latitude, longitude, floor, has_centrala, has_parking, year_built, number_of_rooms, description, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id`,
        [name, address, latitude, longitude, floor, has_centrala, has_parking, year_built, number_of_rooms, description, userId]
      );
  
      const locationId = locResult.rows[0].id;
  
      for (const room of rooms) {
        await pool.query(
          `INSERT INTO rooms (location_id, price, description, balcony, sex_preference)
           VALUES ($1, $2, $3, $4, $5)`,
          [locationId, room.price, room.description, room.balcony, room.sex_preference]
        );
      }
  
      res.status(201).json({ message: 'Apartment and rooms created successfully.' });
    } catch (err) {
      console.error('Error creating apartment with rooms:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  };
  

export const getLocations = async (req, res) => {
  try {
    const result = await pool.query(`
        SELECT l.*, 
          (SELECT COUNT(*) FROM rooms WHERE location_id = l.id) AS room_count,
          (SELECT MIN(price) FROM rooms WHERE location_id = l.id) AS price
        FROM locations l
      `);      
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching locations:', err);
    res.status(500).json({ message: 'Server error while fetching locations.' });
  }
};



export const getLocationById = async (req, res) => {
    try {
      const { id } = req.params;
  
      const locationResult = await pool.query('SELECT * FROM locations WHERE id = $1', [id]);
      if (locationResult.rows.length === 0) {
        return res.status(404).json({ message: 'Location not found.' });
      }
  
      const location = locationResult.rows[0];
  
      const roomsResult = await pool.query('SELECT * FROM rooms WHERE location_id = $1', [id]);
  
      res.json({ location, rooms: roomsResult.rows });
    } catch (err) {
      console.error('Error fetching location by ID:', err);
      res.status(500).json({ message: 'Server error.' });
    }
  };
  
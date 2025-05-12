import pool from '../models/db.js';


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


export const getLocationsByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    // Get all locations created by the user
    const locationsResult = await pool.query(
      'SELECT * FROM locations WHERE created_by = $1',
      [userId]
    );

    const locations = locationsResult.rows;
    const locationsWithRooms = [];

    // For each location, fetch its rooms
    for (const location of locations) {
      const roomsResult = await pool.query(
        'SELECT * FROM rooms WHERE location_id = $1',
        [location.id]
      );

      locationsWithRooms.push({
        location,
        rooms: roomsResult.rows,
      });
    }

    res.json(locationsWithRooms);
  } catch (err) {
    console.error('Error fetching locations by user ID:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};



export const getLocationsByUserIdJoined = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await pool.query(
      `
        SELECT 
          l.id AS location_id,
          l.name AS location_name,
          l.created_by,
          l.address,
          l.description AS location_description,
          l.has_centrala,
          l.has_parking,
          l.floor,
          l.year_built,
          l.number_of_rooms,
  
          r.id AS room_id,
          r.description AS room_description,
          r.sex_preference,
          r.balcony,
          r.price
  
        FROM locations l
        JOIN rooms r ON l.id = r.location_id
        WHERE l.created_by = $1
        `,
      [userId]
    );

    const locationsMap = {};

    result.rows.forEach(row => {
      const locationId = row.location_id;

      if (!locationsMap[locationId]) {
        locationsMap[locationId] = {
          location: {
            id: row.location_id,
            name: row.location_name,
            created_by: row.created_by,
            address: row.address,
            description: row.location_description,
            has_centrala: row.has_centrala,
            has_parking: row.has_parking,
            floor: row.floor,
            year_built: row.year_built,
            number_of_rooms: row.number_of_rooms,
          },
          rooms: [],
        };
      }

      locationsMap[locationId].rooms.push({
        id: row.room_id,
        description: row.room_description,
        sex_preference: row.sex_preference,
        balcony: row.balcony,
        price: row.price,
      });
    });

    const locationsWithRooms = Object.values(locationsMap);

    res.json(locationsWithRooms);
  } catch (err) {
    console.error('Error fetching locations by user ID with JOIN:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};



export const updateLocationById = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      address,
      description,
      has_centrala,
      has_parking,
      floor,
      year_built,
      number_of_rooms,
      rooms, // array of { id, name, sex_preference, balcony, price }
    } = req.body;

    // Update location
    await pool.query(
      `UPDATE locations
         SET name = $1, address = $2, description = $3, has_centrala = $4, has_parking = $5,
             floor = $6, year_built = $7, number_of_rooms = $8
         WHERE id = $9`,
      [name, address, description, has_centrala, has_parking, floor, year_built, number_of_rooms, id]
    );

    // Update rooms
    for (const room of rooms) {
      await pool.query(
        `UPDATE rooms
           SET description = $1, sex_preference = $2, balcony = $3, price = $4
           WHERE id = $5`,
        [room.description, room.sex_preference, room.balcony, room.price, room.id]
      );
    }

    res.json({ message: 'Location and rooms updated successfully.' });
  } catch (err) {
    console.error('Error updating location and rooms:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};



export const deleteLocationById = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete rooms first (foreign key constraint)
    await pool.query(`DELETE FROM rooms WHERE location_id = $1`, [id]);

    // Then delete location
    await pool.query(`DELETE FROM locations WHERE id = $1`, [id]);

    res.json({ message: 'Location and its rooms deleted successfully.' });
  } catch (err) {
    console.error('Error deleting location and rooms:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

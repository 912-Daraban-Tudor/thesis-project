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
        SELECT 
          l.*, 
          (
            SELECT json_agg(r.*)
            FROM rooms r
            WHERE r.location_id = l.id
          ) AS rooms
        FROM locations l
      `);
    res.json(result.rows);
    console.log('Locations:', result.rows);
    console.log('Locations:', result.rows[1]);
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

// locationController.js
export const filterLocationsNearby = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: 'Latitude and longitude must be numbers.' });
    }


    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required.' });
    }

    const result = await pool.query('SELECT * FROM locations');
    const all = result.rows;

    const filtered = all.filter(loc => {
      const dx = 111.32 * (loc.latitude - lat);
      const dy = 40075 * Math.cos((lat * Math.PI) / 180) * (loc.longitude - lng) / 360;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= 1;
    });

    const final = filtered.length >= 5 ? filtered : all;

    res.json(final);
  } catch (err) {
    console.error('Error filtering locations:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

function parseSearchParams(query) {
  return {
    latNum: parseFloat(query.lat),
    lngNum: parseFloat(query.lng),
    priceMin: parseInt(query.priceMin) || 0,
    priceMax: parseInt(query.priceMax) || 2000,
    floorMin: parseInt(query.floorMin) || 0,
    floorMax: parseInt(query.floorMax) || 10,
    yearBuiltMin: parseInt(query.yearBuiltMin) || 1900,
    yearBuiltMax: parseInt(query.yearBuiltMax) || new Date().getFullYear(),
    has_parking: query.has_parking === 'true',
    has_centrala: query.has_centrala === 'true',
    roomCount: query.roomCount,
    numberOfRooms: query.numberOfRooms,
    sortBy: query.sortBy || '',
    sortOrder: query.sortOrder || 'asc',
  };
}
function buildSearchQueryWithCoordinates(params, applyFilters) {
  const {
    latNum, lngNum,
    priceMin, priceMax,
    floorMin, floorMax,
    yearBuiltMin, yearBuiltMax,
    has_parking, has_centrala,
    roomCount, numberOfRooms,
  } = params;

  let query = `
    SELECT 
      l.*,
      (
        SELECT json_agg(r.*)
        FROM rooms r
        WHERE r.location_id = l.id
      ) AS rooms,
      SQRT(
        POWER(111.32 * (l.latitude - $1), 2) + 
        POWER(40075 * COS(RADIANS($2)) * (l.longitude - $3) / 360, 2)
      ) AS distance_km
    FROM locations l
  `;

  const values = [latNum, latNum, lngNum];
  let paramIndex = 4;
  const conditions = [`SQRT(POWER(111.32 * (l.latitude - $1), 2) + POWER(40075 * COS(RADIANS($2)) * (l.longitude - $3) / 360, 2)) < 1`];

  if (applyFilters) {
    conditions.push(`
      EXISTS (
        SELECT 1 FROM rooms r 
        WHERE r.location_id = l.id 
        AND r.price BETWEEN $${paramIndex} AND $${paramIndex + 1}
      )
    `);
    values.push(priceMin, priceMax);
    paramIndex += 2;

    conditions.push(`l.floor BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
    values.push(floorMin, floorMax);
    paramIndex += 2;

    conditions.push(`l.year_built BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
    values.push(yearBuiltMin, yearBuiltMax);
    paramIndex += 2;

    if (has_parking) conditions.push(`l.has_parking = true`);
    if (has_centrala) conditions.push(`l.has_centrala = true`);

    if (roomCount) {
      const counts = roomCount.split(',').map(Number).filter(n => !isNaN(n));
      if (counts.length) {
        const placeholders = counts.map(() => `$${paramIndex++}`).join(',');
        conditions.push(`(SELECT COUNT(*) FROM rooms r WHERE r.location_id = l.id) IN (${placeholders})`);
        values.push(...counts);
      }
    }

    if (numberOfRooms) {
      const totals = numberOfRooms.split(',').map(Number).filter(n => !isNaN(n));
      if (totals.length) {
        const placeholders = totals.map(() => `$${paramIndex++}`).join(',');
        conditions.push(`l.number_of_rooms IN (${placeholders})`);
        values.push(...totals);
      }
    }
  }

  if (conditions.length) {
    query += ` WHERE ` + conditions.join(' AND ');
  }

  // if (sortBy === 'price') {
  //   query += ` ORDER BY (SELECT MIN(price) FROM rooms r WHERE r.location_id = l.id) ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
  // } else if (sortBy === 'distance' && hasCoords) {
  //   query += ` ORDER BY distance_km ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
  // }


  return { query, values };
}

function buildSearchQueryWithoutCoordinates(params) {
  const {
    priceMin, priceMax,
    floorMin, floorMax,
    yearBuiltMin, yearBuiltMax,
    has_parking, has_centrala,
    roomCount, numberOfRooms,
  } = params;

  let query = `
    SELECT 
      l.*,
      (
        SELECT json_agg(r.*)
        FROM rooms r
        WHERE r.location_id = l.id
      ) AS rooms
    FROM locations l
  `;

  const values = [];
  let paramIndex = 1;
  const conditions = [];

  conditions.push(`
    EXISTS (
      SELECT 1 FROM rooms r 
      WHERE r.location_id = l.id 
      AND r.price BETWEEN $${paramIndex} AND $${paramIndex + 1}
    )
  `);
  values.push(priceMin, priceMax);
  paramIndex += 2;

  conditions.push(`l.floor BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
  values.push(floorMin, floorMax);
  paramIndex += 2;

  conditions.push(`l.year_built BETWEEN $${paramIndex} AND $${paramIndex + 1}`);
  values.push(yearBuiltMin, yearBuiltMax);
  paramIndex += 2;

  if (has_parking) conditions.push(`l.has_parking = true`);
  if (has_centrala) conditions.push(`l.has_centrala = true`);

  if (roomCount) {
    const counts = roomCount.split(',').map(Number).filter(n => !isNaN(n));
    if (counts.length) {
      const placeholders = counts.map(() => `$${paramIndex++}`).join(',');
      conditions.push(`(SELECT COUNT(*) FROM rooms r WHERE r.location_id = l.id) IN (${placeholders})`);
      values.push(...counts);
    }
  }

  if (numberOfRooms) {
    const totals = numberOfRooms.split(',').map(Number).filter(n => !isNaN(n));
    if (totals.length) {
      const placeholders = totals.map(() => `$${paramIndex++}`).join(',');
      conditions.push(`l.number_of_rooms IN (${placeholders})`);
      values.push(...totals);
    }
  }

  if (conditions.length > 0) {
    query += ` WHERE ` + conditions.join(' AND ');
  }


  return { query, values };
}

export const searchFilteredLocations = async (req, res) => {
  try {
    const params = parseSearchParams(req.query);
    const hasCoords = !isNaN(params.latNum) && !isNaN(params.lngNum);

    if (hasCoords) {
      const { query, values } = buildSearchQueryWithCoordinates(params, true);
      const result = await pool.query(query, values);

      if (result.rows.length >= 1) {
        return res.json(result.rows);
      }

      // fallback without filters
      const fallback = buildSearchQueryWithCoordinates(params, false);
      const fallbackResult = await pool.query(fallback.query, fallback.values);
      return res.json(fallbackResult.rows);
    } else {
      const { query, values } = buildSearchQueryWithoutCoordinates(params);
      const result = await pool.query(query, values);
      return res.json(result.rows);
    }

  } catch (err) {
    console.error('❌ Error in searchFilteredLocations:', err);
    res.status(500).json({ message: 'Server error during location search.' });
  }
};

import pool from '../models/db.js';


export const addLocation = async (req, res) => {
  try {
    const { name, description, latitude, longitude } = req.body;
    const userId = req.user.id;

    if (!name || !latitude || !longitude) {
      return res.status(400).json({ message: 'Name, latitude, and longitude are required.' });
    }

    const result = await pool.query(
      `INSERT INTO locations (
         name, description, latitude, longitude, created_by, geom
       ) VALUES (
         $1, $2, $3, $4, $5, ST_SetSRID(ST_MakePoint($4, $3), 4326)
       )
       RETURNING *`,
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
    const {
      name,
      description,
      latitude,
      longitude,
      has_centrala,
      has_parking,
      floor,
      year_built,
      address,
      number_of_rooms,
      rooms,
      images // array of URLs from Cloudinary
    } = req.body;

    const userId = req.user.id;

    const locationResult = await pool.query(
      `INSERT INTO locations (
         name, description, latitude, longitude, has_centrala, has_parking,
         floor, year_built, address, number_of_rooms, created_by, geom
       ) VALUES (
         $1, $2, $3, $4, $5, $6,
         $7, $8, $9, $10, $11, ST_SetSRID(ST_MakePoint($4, $3), 4326)
       )
       RETURNING id`,
      [
        name, description, latitude, longitude, has_centrala, has_parking,
        floor, year_built, address, number_of_rooms, userId
      ]
    );

    const locationId = locationResult.rows[0].id;

    // Insert rooms
    for (const room of rooms) {
      await pool.query(
        `INSERT INTO rooms (location_id, description, price, balcony, sex_preference)
         VALUES ($1, $2, $3, $4, $5)`,
        [locationId, room.description, room.price, room.balcony, room.sex_preference]
      );
    }

    // Insert image URLs into location_images table
    for (const url of images || []) {
      await pool.query(
        `INSERT INTO location_images (location_id, image_url)
         VALUES ($1, $2)`,
        [locationId, url]
      );
    }

    res.status(201).json({ message: 'Location added successfully', locationId });

  } catch (err) {
    console.error('Error adding location with rooms:', err);
    res.status(500).json({ message: 'Server error' });
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
    const imagesResult = await pool.query('SELECT image_url FROM location_images WHERE location_id = $1', [id]);

    res.json({
      location,
      rooms: roomsResult.rows,
      images: imagesResult.rows.map(row => row.image_url),
    });
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
      rooms,       // array of { id, description, sex_preference, balcony, price }
      images = [], // ✅ Cloudinary URLs (new + existing)
    } = req.body;

    // 1. Update location
    await pool.query(
      `UPDATE locations
         SET name = $1, address = $2, description = $3, has_centrala = $4, has_parking = $5,
             floor = $6, year_built = $7, number_of_rooms = $8
         WHERE id = $9`,
      [name, address, description, has_centrala, has_parking, floor, year_built, number_of_rooms, id]
    );

    // 2. Update each room (assumes IDs exist)
    for (const room of rooms) {
      await pool.query(
        `UPDATE rooms
           SET description = $1, sex_preference = $2, balcony = $3, price = $4
           WHERE id = $5`,
        [room.description, room.sex_preference, room.balcony, room.price, room.id]
      );
    }

    // 3. Replace images
    await pool.query(`DELETE FROM location_images WHERE location_id = $1`, [id]);

    for (const url of images) {
      await pool.query(
        `INSERT INTO location_images (location_id, image_url) VALUES ($1, $2)`,
        [id, url]
      );
    }

    res.json({ message: 'Location, rooms, and images updated successfully.' });

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
    const radiusMeters = parseFloat(req.query.radius) || 1000; // default to 1000 meters

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ message: 'Latitude and longitude must be valid numbers.' });
    }

    const result = await pool.query(
      `SELECT *
       FROM locations
       WHERE ST_DWithin(
         geom,
         ST_SetSRID(ST_MakePoint($1, $2), 4326),
         $3
       )`,
      [lng, lat, radiusMeters]
    );

    const filtered = result.rows;

    // fallback: return all if fewer than 5
    if (filtered.length >= 5) {
      return res.json(filtered);
    } else {
      const allResult = await pool.query('SELECT * FROM locations');
      return res.json(allResult.rows);
    }

  } catch (err) {
    console.error('Error filtering locations with PostGIS:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

// Revised backend functions for full bus line filtering

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
    sortBy: query.sort || '',
    sortOrder: query.order || 'asc',
    busLineProximity: query.busLineProximity || null,
    universityLat: parseFloat(query.universityLat),
    universityLng: parseFloat(query.universityLng),
    sex_preference: query.sex_preference || null,
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
    sortBy, sortOrder,
    busLineProximity,
    universityLat,
    universityLng,
    sex_preference
  } = params;

  let query = `
  SELECT 
    l.*,
    (
      SELECT json_agg(r.*)
      FROM rooms r
      WHERE r.location_id = l.id
    ) AS rooms,
    ST_Distance(
      l.geom::geography,
      ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography
    ) AS distance_km
  FROM locations l
`;

  const values = [lngNum, latNum];
  let paramIndex = 3;
  const conditions = [
    `ST_DWithin(
    l.geom::geography,
    ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
    1000
  )`
  ];

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
    if (sex_preference) {
      conditions.push(`
    EXISTS (
      SELECT 1 FROM rooms r
      WHERE r.location_id = l.id
      AND r.sex_preference = $${paramIndex}
    )
  `);
      values.push(sex_preference);
      paramIndex++;
    }


    if (busLineProximity) {
      conditions.push(`
        EXISTS (
          SELECT 1 FROM rutelinii rl
          WHERE rl.linia = $${paramIndex}
          AND ST_DWithin(rl.geom::geography, l.geom::geography, 300)
        )
      `);
      values.push(busLineProximity);
      paramIndex++;
    }

    if (!isNaN(universityLat) && !isNaN(universityLng)) {
    conditions.push(`
      EXISTS (
        SELECT 1 FROM rutelinii rl
        WHERE ST_DWithin(
          rl.geom::geography,
          ST_SetSRID(ST_MakePoint($${paramIndex}, $${paramIndex + 1}), 4326)::geography,
          300
        )
        AND ST_DWithin(
          rl.geom::geography,
          l.geom::geography,
          300
        )
      )
    `);
    values.push(universityLng, universityLat);
    paramIndex += 2;
  }
  }

  if (conditions.length) {
    query += ` WHERE ` + conditions.join(' AND ');
  }

  if (sortBy === 'price') {
    query += ` ORDER BY (SELECT MIN(price) FROM rooms r WHERE r.location_id = l.id) ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
  } else if (sortBy === 'distance') {
    query += ` ORDER BY distance_km ${sortOrder === 'desc' ? 'DESC' : 'ASC'}`;
  }

  return { query, values };
}

function buildSearchQueryWithoutCoordinates(params) {
  const {
    priceMin, priceMax,
    floorMin, floorMax,
    yearBuiltMin, yearBuiltMax,
    has_parking, has_centrala,
    roomCount, numberOfRooms,
    busLineProximity,
    universityLat,
    universityLng,
    sex_preference
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
  if (sex_preference) {
    conditions.push(`
    EXISTS (
      SELECT 1 FROM rooms r
      WHERE r.location_id = l.id
      AND r.sex_preference = $${paramIndex}
    )
  `);
    values.push(sex_preference);
    paramIndex++;
  }


  if (busLineProximity) {
    conditions.push(`
      EXISTS (
        SELECT 1 FROM rutelinii rl
        WHERE rl.linia = $${paramIndex}
        AND ST_DWithin(rl.geom::geography, l.geom::geography, 300)
      )
    `);
    values.push(busLineProximity);
    paramIndex++;
  }

  if (!isNaN(universityLat) && !isNaN(universityLng)) {
    conditions.push(`
      EXISTS (
        SELECT 1 FROM rutelinii rl
        WHERE ST_DWithin(
          rl.geom::geography,
          ST_SetSRID(ST_MakePoint($${paramIndex}, $${paramIndex + 1}), 4326)::geography,
          300
        )
        AND ST_DWithin(
          rl.geom::geography,
          l.geom::geography,
          300
        )
      )
    `);
    values.push(universityLng, universityLat);
    paramIndex += 2;
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
        return res.json({ fallback: false, data: result.rows });
      }

      const fallback = buildSearchQueryWithCoordinates(params, false);
      const fallbackResult = await pool.query(fallback.query, fallback.values);
      return res.json({ fallback: true, data: fallbackResult.rows });
    } else {
      const { query, values } = buildSearchQueryWithoutCoordinates(params);
      const result = await pool.query(query, values);
      return res.json({ fallback: false, data: result.rows });
    }

  } catch (err) {
    console.error('Error in searchFilteredLocations:', err);
    res.status(500).json({ message: 'Server error during location search.' });
  }
};

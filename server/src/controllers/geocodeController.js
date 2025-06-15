import axios from 'axios';
import pool from '../models/db.js';

export const geocodeSearch = async (req, res) => {
    try {
        const { query } = req.query;
        const apiKey = process.env.GOOGLE_API_KEY;
        const searchQuery = `${query}, Cluj-Napoca`;

        const geoResponse = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
            params: { address: searchQuery, key: apiKey },
        });

        if (
            geoResponse.data.status !== 'OK' ||
            !geoResponse.data.results?.length
        ) {
            return res.status(404).json({ message: 'No results from Google' });
        }

        const result = geoResponse.data.results[0];
        const { formatted_address, geometry } = result;
        const { lat, lng } = geometry.location;

        const busQuery = await pool.query(`
      SELECT DISTINCT linia
      FROM rutelinii
      WHERE ST_DWithin(
        geom::geography,
        ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography,
        200
      )
    `, [lng, lat]);

        const connectedLines = busQuery.rows.map(row => row.linia);

        res.json({
            formatted_address,
            location: { lat, lng },
            connectedLines,
        });

    } catch (err) {
        console.error('Geocoding error:', err);
        res.status(500).json({ error: 'Failed to fetch location or lines' });
    }
};

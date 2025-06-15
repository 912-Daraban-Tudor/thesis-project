import pool from '../models/db.js';

export const getBusLines = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT DISTINCT linia, explicit
      FROM rutelinii
      ORDER BY linia
    `);

    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching bus lines:', err);
    res.status(500).json({ message: 'Failed to fetch bus lines' });
  }
};
export const getDistinctBusLines = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT linia
      FROM (
        SELECT DISTINCT linia
        FROM rutelinii
      ) AS sub
      LEFT JOIN LATERAL (
        SELECT CAST((regexp_matches(sub.linia, '^[0-9]+'))[1] AS INTEGER) AS prefix
      ) AS match ON true
      ORDER BY
        COALESCE(match.prefix, 10000),
        linia
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching bus lines:', err);
    res.status(500).json({ message: 'Server error.' });
  }
};

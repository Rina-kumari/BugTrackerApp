import pool from '../config/db.js';

export const recordActivity = async (userId, action, entityType, entityId, metadata) => {
  try {
    const description = metadata?.description || null;
    
    await pool.query(
      `INSERT INTO activities (user_id, action, entity_type, entity_id, description, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, action, entityType, entityId, description, JSON.stringify(metadata)]
    );
  } catch (error) {
    console.error('Error recording activity:', error);
  }
};


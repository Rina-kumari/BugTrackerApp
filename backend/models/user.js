import pool from "../config/db.js";

const User = {
  async create({ email, password, name, role = 'member' }) {
    const query = `
      INSERT INTO users (email, password, name, role)
      VALUES ($1, $2, $3, $4)
      RETURNING id, email, name, role, last_login, created_at, updated_at
    `;
    const values = [email.toLowerCase().trim(), password, name.trim(), role];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async findByEmail(email) {
    const query = `
      SELECT id, email, name, role, last_login, created_at, updated_at
      FROM users
      WHERE email = $1
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  },

  async findByEmailWithPassword(email) {
    const query = `
      SELECT id, email, password, name, role, last_login, created_at, updated_at
      FROM users
      WHERE email = $1
    `;
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  },

  async updateLastLogin(userId) {
    const query = `
      UPDATE users 
      SET last_login = $1 
      WHERE id = $2
      RETURNING id, email, name, role, last_login, created_at, updated_at
    `;
    const result = await pool.query(query, [new Date(), userId]);
    return result.rows[0] || null;
  },

  async findAll() {
    const query = `
      SELECT id, email, name, role, created_at
      FROM users
      ORDER BY name ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  },
};

export default User;
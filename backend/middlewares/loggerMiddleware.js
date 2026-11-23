import pool from '../config/db.js';

export const logAuditAction = async (userId, action, details) => {
  try {
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [userId || null, action, details]
    );
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
};

export const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`
    );
  });
  next();
};

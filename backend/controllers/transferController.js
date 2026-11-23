import pool from '../config/db.js';
import { logAuditAction } from '../middlewares/loggerMiddleware.js';

export const getTransfers = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*,
             sb.name AS source_base_name,
             db.name AS destination_base_name,
             et.name AS equipment_name,
             et.category
      FROM transfers t
      JOIN bases sb ON t.source_base_id = sb.id
      JOIN bases db ON t.destination_base_id = db.id
      JOIN equipment_types et ON t.equipment_type_id = et.id
      ORDER BY t.timestamp DESC
    `);
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const createTransfer = async (req, res) => {
  const { sourceBaseId, destinationBaseId, equipmentTypeId, quantity } = req.body;
  const userId = req.user.id;

  if (!sourceBaseId || !destinationBaseId || !equipmentTypeId || !quantity || Number(quantity) <= 0) {
    return res.status(400).json({ error: 'Valid sourceBaseId, destinationBaseId, equipmentTypeId, and quantity are required' });
  }

  if (Number(sourceBaseId) === Number(destinationBaseId)) {
    return res.status(400).json({ error: 'Source and destination bases must be different' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const transferQuery = `
      INSERT INTO transfers (source_base_id, destination_base_id, equipment_type_id, quantity, initiated_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const transferRes = await client.query(transferQuery, [
      Number(sourceBaseId),
      Number(destinationBaseId),
      Number(equipmentTypeId),
      Number(quantity),
      userId,
    ]);

    const details = `Transferred ${quantity} items (Type ${equipmentTypeId}) from base ${sourceBaseId} to base ${destinationBaseId}`;
    await client.query(
      'INSERT INTO audit_logs (user_id, action, details) VALUES ($1, $2, $3)',
      [userId, 'TRANSFER', details]
    );

    await client.query('COMMIT');
    return res.status(201).json({
      message: 'Transfer completed successfully',
      transfer: transferRes.rows[0],
    });
  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(500).json({ error: `Transfer failed: ${err.message}` });
  } finally {
    client.release();
  }
};

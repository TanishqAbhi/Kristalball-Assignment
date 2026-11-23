import pool from '../config/db.js';
import { logAuditAction } from '../middlewares/loggerMiddleware.js';

export const getPurchases = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, b.name AS base_name, et.name AS equipment_name, et.category
      FROM purchases p
      JOIN bases b ON p.base_id = b.id
      JOIN equipment_types et ON p.equipment_type_id = et.id
      ORDER BY p.purchase_date DESC
    `);
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const createPurchase = async (req, res) => {
  const { baseId, equipmentTypeId, quantity } = req.body;
  if (!baseId || !equipmentTypeId || !quantity || Number(quantity) <= 0) {
    return res.status(400).json({ error: 'baseId, equipmentTypeId, and positive quantity are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO purchases (base_id, equipment_type_id, quantity, created_by)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [Number(baseId), Number(equipmentTypeId), Number(quantity), req.user.id]
    );

    const details = `Purchased ${quantity} units of equipment #${equipmentTypeId} for base #${baseId}`;
    await logAuditAction(req.user.id, 'PURCHASE', details);

    return res.status(201).json({ purchase: result.rows[0] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

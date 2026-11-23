import pool from '../config/db.js';
import { logAuditAction } from '../middlewares/loggerMiddleware.js';

export const getDashboardMetrics = async (req, res) => {
  try {
    let { baseId, equipmentTypeId, startDate, endDate } = req.query;

    // Enforce base scope for non-admins
    if (req.user && req.user.role !== 'ADMIN') {
      baseId = req.user.base_id;
    }

    const query = `
      WITH purchase_summary AS (
        SELECT COALESCE(SUM(quantity), 0)::INT AS total_purchases
        FROM purchases
        WHERE ($1::INT IS NULL OR base_id = $1)
          AND ($2::INT IS NULL OR equipment_type_id = $2)
          AND ($3::TIMESTAMP IS NULL OR purchase_date >= $3)
          AND ($4::TIMESTAMP IS NULL OR purchase_date <= $4)
      ),
      transfer_in_summary AS (
        SELECT COALESCE(SUM(quantity), 0)::INT AS total_transfer_in
        FROM transfers
        WHERE ($1::INT IS NULL OR destination_base_id = $1)
          AND ($2::INT IS NULL OR equipment_type_id = $2)
          AND ($3::TIMESTAMP IS NULL OR timestamp >= $3)
          AND ($4::TIMESTAMP IS NULL OR timestamp <= $4)
      ),
      transfer_out_summary AS (
        SELECT COALESCE(SUM(quantity), 0)::INT AS total_transfer_out
        FROM transfers
        WHERE ($1::INT IS NULL OR source_base_id = $1)
          AND ($2::INT IS NULL OR equipment_type_id = $2)
          AND ($3::TIMESTAMP IS NULL OR timestamp >= $3)
          AND ($4::TIMESTAMP IS NULL OR timestamp <= $4)
      ),
      assigned_summary AS (
        SELECT COALESCE(SUM(quantity), 0)::INT AS total_assigned
        FROM assignments_expenditures
        WHERE record_type = 'ASSIGNMENT'
          AND ($1::INT IS NULL OR base_id = $1)
          AND ($2::INT IS NULL OR equipment_type_id = $2)
          AND ($3::TIMESTAMP IS NULL OR created_at >= $3)
          AND ($4::TIMESTAMP IS NULL OR created_at <= $4)
      ),
      expended_summary AS (
        SELECT COALESCE(SUM(quantity), 0)::INT AS total_expended
        FROM assignments_expenditures
        WHERE record_type = 'EXPENDITURE'
          AND ($1::INT IS NULL OR base_id = $1)
          AND ($2::INT IS NULL OR equipment_type_id = $2)
          AND ($3::TIMESTAMP IS NULL OR created_at >= $3)
          AND ($4::TIMESTAMP IS NULL OR created_at <= $4)
      )
      SELECT
        0::INT AS opening_balance,
        p.total_purchases,
        ti.total_transfer_in,
        to_out.total_transfer_out,
        (p.total_purchases + ti.total_transfer_in - to_out.total_transfer_out)::INT AS net_movement,
        a.total_assigned,
        e.total_expended,
        ((p.total_purchases + ti.total_transfer_in - to_out.total_transfer_out) - a.total_assigned - e.total_expended)::INT AS closing_balance
      FROM purchase_summary p, transfer_in_summary ti, transfer_out_summary to_out, assigned_summary a, expended_summary e;
    `;

    const result = await pool.query(query, [
      baseId ? Number(baseId) : null,
      equipmentTypeId ? Number(equipmentTypeId) : null,
      startDate || null,
      endDate || null,
    ]);

    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getReferenceData = async (req, res) => {
  try {
    const [basesRes, typesRes, auditRes] = await Promise.all([
      pool.query('SELECT * FROM bases ORDER BY id ASC'),
      pool.query('SELECT * FROM equipment_types ORDER BY id ASC'),
      pool.query(`
        SELECT al.id, al.action, al.details, al.created_at, u.username
        FROM audit_logs al
        LEFT JOIN users u ON al.user_id = u.id
        ORDER BY al.created_at DESC
        LIMIT 50
      `),
    ]);
    return res.json({
      bases: basesRes.rows,
      equipmentTypes: typesRes.rows,
      auditLogs: auditRes.rows,
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const getAssignmentsAndExpenditures = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT ae.*, b.name AS base_name, et.name AS equipment_name, et.category
      FROM assignments_expenditures ae
      JOIN bases b ON ae.base_id = b.id
      JOIN equipment_types et ON ae.equipment_type_id = et.id
      ORDER BY ae.created_at DESC
    `);
    return res.json(result.rows);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

export const createAssignmentOrExpenditure = async (req, res) => {
  const { baseId, equipmentTypeId, recordType, assignedTo, quantity } = req.body;
  if (!baseId || !equipmentTypeId || !recordType || !quantity || Number(quantity) <= 0) {
    return res.status(400).json({ error: 'Valid baseId, equipmentTypeId, recordType, and quantity are required' });
  }

  try {
    const insertRes = await pool.query(
      `INSERT INTO assignments_expenditures (base_id, equipment_type_id, record_type, assigned_to, quantity, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        Number(baseId),
        Number(equipmentTypeId),
        recordType,
        assignedTo || (recordType === 'EXPENDITURE' ? 'Operational Consumption' : 'Unassigned'),
        Number(quantity),
        recordType === 'EXPENDITURE' ? 'EXPENDED' : 'ACTIVE',
        req.user.id,
      ]
    );

    const details = `${recordType}: ${quantity} unit(s) of equipment #${equipmentTypeId} at base #${baseId} (${assignedTo || 'N/A'})`;
    await logAuditAction(req.user.id, recordType, details);

    return res.status(201).json({ record: insertRes.rows[0] });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};

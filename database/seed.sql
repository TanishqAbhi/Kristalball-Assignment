-- Sample Bases
INSERT INTO bases (name, location) VALUES
  ('All Bases (Global)', 'Command HQ'),
  ('Fort Alpha (Base A)', 'Northern Sector'),
  ('Base B1 / Bravo Ops', 'Eastern Sector')
ON CONFLICT DO NOTHING;

-- Sample Equipment Types
INSERT INTO equipment_types (name, category) VALUES
  ('M4 Carbine', 'WEAPON'),
  ('Humvee', 'VEHICLE'),
  ('5.56mm Ammo', 'AMMUNITION')
ON CONFLICT DO NOTHING;

-- Sample Users (password for all demo users: 'Password@123', bcrypt hash placeholder)
INSERT INTO users (username, password_hash, role, base_id) VALUES
  ('admin_cmd', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ADMIN', 1),
  ('cmd_alpha', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'BASE_COMMANDER', 2),
  ('log_b1', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'LOGISTICS_OFFICER', 3)
ON CONFLICT (username) DO NOTHING;

-- Sample Purchases
INSERT INTO purchases (base_id, equipment_type_id, quantity, purchase_date, created_by) VALUES
  (2, 1, 150, NOW() - INTERVAL '10 days', 1),
  (2, 2, 20, NOW() - INTERVAL '8 days', 1),
  (2, 3, 25000, NOW() - INTERVAL '7 days', 1),
  (3, 1, 100, NOW() - INTERVAL '6 days', 1),
  (3, 2, 12, NOW() - INTERVAL '5 days', 1);

-- Sample Transfers
INSERT INTO transfers (source_base_id, destination_base_id, equipment_type_id, quantity, status, timestamp, initiated_by) VALUES
  (2, 3, 1, 25, 'COMPLETED', NOW() - INTERVAL '3 days', 2),
  (2, 3, 3, 5000, 'COMPLETED', NOW() - INTERVAL '2 days', 2);

-- Sample Assignments & Expenditures
INSERT INTO assignments_expenditures (base_id, equipment_type_id, record_type, assigned_to, quantity, status, created_by) VALUES
  (2, 1, 'ASSIGNMENT', 'Sgt. Vance - Recon Squad', 15, 'ACTIVE', 2),
  (2, 3, 'EXPENDITURE', 'Range Training Drill #4', 4500, 'EXPENDED', 2),
  (3, 1, 'ASSIGNMENT', 'Lt. Torres - Bravo Unit', 10, 'ACTIVE', 1);

-- Sample Audit Logs
INSERT INTO audit_logs (user_id, action, details) VALUES
  (1, 'PURCHASE', 'Purchased 150 units of equipment #1 at base #2'),
  (2, 'TRANSFER', 'Transferred 25 items (Type 1) from base 2 to base 3'),
  (2, 'ASSIGNMENT', 'Assigned 15 items (Type 1) to Sgt. Vance - Recon Squad at base 2');

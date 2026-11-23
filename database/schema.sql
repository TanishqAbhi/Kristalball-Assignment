-- Bases Table
CREATE TABLE IF NOT EXISTS bases (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  location VARCHAR(150) NOT NULL
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(30) NOT NULL CHECK (role IN ('ADMIN', 'BASE_COMMANDER', 'LOGISTICS_OFFICER')),
  base_id INT REFERENCES bases(id) ON DELETE SET NULL
);

-- Equipment Categories / Types
CREATE TABLE IF NOT EXISTS equipment_types (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL, -- e.g., 'M4 Carbine', 'Humvee', '5.56mm Ammo'
  category VARCHAR(50) NOT NULL -- 'WEAPON', 'VEHICLE', 'AMMUNITION'
);

-- Purchases Table
CREATE TABLE IF NOT EXISTS purchases (
  id SERIAL PRIMARY KEY,
  base_id INT NOT NULL REFERENCES bases(id),
  equipment_type_id INT NOT NULL REFERENCES equipment_types(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT REFERENCES users(id)
);

-- Transfers Table
CREATE TABLE IF NOT EXISTS transfers (
  id SERIAL PRIMARY KEY,
  source_base_id INT NOT NULL REFERENCES bases(id),
  destination_base_id INT NOT NULL REFERENCES bases(id),
  equipment_type_id INT NOT NULL REFERENCES equipment_types(id),
  quantity INT NOT NULL CHECK (quantity > 0),
  status VARCHAR(20) DEFAULT 'COMPLETED', -- 'PENDING', 'IN_TRANSIT', 'COMPLETED'
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  initiated_by INT REFERENCES users(id),
  CHECK (source_base_id <> destination_base_id)
);

-- Assignments & Expenditures Table
CREATE TABLE IF NOT EXISTS assignments_expenditures (
  id SERIAL PRIMARY KEY,
  base_id INT NOT NULL REFERENCES bases(id),
  equipment_type_id INT NOT NULL REFERENCES equipment_types(id),
  record_type VARCHAR(20) NOT NULL CHECK (record_type IN ('ASSIGNMENT', 'EXPENDITURE')),
  assigned_to VARCHAR(120),
  quantity INT NOT NULL CHECK (quantity > 0),
  status VARCHAR(20) DEFAULT 'ACTIVE', -- 'ACTIVE', 'EXPENDED'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INT REFERENCES users(id)
);

-- System Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  action VARCHAR(50) NOT NULL, -- 'PURCHASE', 'TRANSFER', 'ASSIGNMENT', 'EXPENDITURE'
  details TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for high-query fields
CREATE INDEX IF NOT EXISTS idx_purchases_base_eq ON purchases(base_id, equipment_type_id);
CREATE INDEX IF NOT EXISTS idx_transfers_source_eq ON transfers(source_base_id, equipment_type_id);
CREATE INDEX IF NOT EXISTS idx_transfers_dest_eq ON transfers(destination_base_id, equipment_type_id);
CREATE INDEX IF NOT EXISTS idx_assign_exp_base_eq ON assignments_expenditures(base_id, equipment_type_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);

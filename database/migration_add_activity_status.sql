USE planyourfit;

ALTER TABLE activities
  ADD COLUMN IF NOT EXISTS status ENUM('planned', 'completed', 'cancelled') NOT NULL DEFAULT 'planned' AFTER search_radius_km;

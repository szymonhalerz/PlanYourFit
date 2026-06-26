USE planyourfit;

ALTER TABLE users ADD COLUMN IF NOT EXISTS monthly_activity_goal TINYINT UNSIGNED NOT NULL DEFAULT 12 AFTER preferred_radius_km;

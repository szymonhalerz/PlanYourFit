USE planyourfit;

ALTER TABLE users ADD COLUMN IF NOT EXISTS default_postal_code VARCHAR(6) NULL AFTER default_location;
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_location_lat DECIMAL(10,7) NULL AFTER default_postal_code;
ALTER TABLE users ADD COLUMN IF NOT EXISTS default_location_lng DECIMAL(10,7) NULL AFTER default_location_lat;
ALTER TABLE activities ADD COLUMN IF NOT EXISTS postal_code VARCHAR(6) NULL AFTER location_address;

USE planyourfit;

ALTER TABLE swimming_details ADD COLUMN IF NOT EXISTS weather_summary_json JSON NULL AFTER selected_place_id;
ALTER TABLE swimming_details ADD COLUMN IF NOT EXISTS recommendation_status ENUM('good', 'warning', 'bad', 'unknown') NOT NULL DEFAULT 'unknown' AFTER weather_summary_json;
ALTER TABLE swimming_details ADD COLUMN IF NOT EXISTS recommendation_reason TEXT NULL AFTER recommendation_status;

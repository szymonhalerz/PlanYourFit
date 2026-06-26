CREATE DATABASE IF NOT EXISTS planyourfit CHARACTER SET utf8mb4 COLLATE utf8mb4_polish_ci;
USE planyourfit;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(80) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  default_location VARCHAR(255) NULL,
  default_postal_code VARCHAR(6) NULL,
  default_location_lat DECIMAL(10,7) NULL,
  default_location_lng DECIMAL(10,7) NULL,
  preferred_radius_km TINYINT UNSIGNED NOT NULL DEFAULT 25,
  monthly_activity_goal TINYINT UNSIGNED NOT NULL DEFAULT 12,
  theme ENUM('light', 'dark', 'system') NOT NULL DEFAULT 'system',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email),
  CONSTRAINT chk_users_radius CHECK (preferred_radius_km BETWEEN 1 AND 50),
  CONSTRAINT chk_users_activity_goal CHECK (monthly_activity_goal BETWEEN 1 AND 100)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS activities (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNSIGNED NOT NULL,
  activity_type ENUM('basketball', 'running', 'swimming') NOT NULL,
  title VARCHAR(120) NOT NULL,
  activity_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  location_lat DECIMAL(10,7) NULL,
  location_lng DECIMAL(10,7) NULL,
  location_address VARCHAR(255) NOT NULL,
  postal_code VARCHAR(6) NULL,
  note TEXT NULL,
  search_radius_km TINYINT UNSIGNED NOT NULL DEFAULT 25,
  status ENUM('planned', 'completed', 'cancelled') NOT NULL DEFAULT 'planned',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_activities_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_activity_time CHECK (end_time > start_time),
  CONSTRAINT chk_activity_radius CHECK (search_radius_km BETWEEN 1 AND 50),
  KEY idx_activities_user_id (user_id),
  KEY idx_activities_date (activity_date),
  KEY idx_activities_type (activity_type),
  KEY idx_activities_user_date (user_id, activity_date)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS basketball_details (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  activity_id BIGINT UNSIGNED NOT NULL,
  court_type ENUM('outdoor', 'indoor') NOT NULL,
  selected_place_id VARCHAR(190) NULL,
  weather_summary_json JSON NULL,
  recommendation_status ENUM('good', 'warning', 'bad', 'unknown') NOT NULL DEFAULT 'unknown',
  recommendation_reason TEXT NULL,
  UNIQUE KEY uq_basketball_activity (activity_id),
  CONSTRAINT fk_basketball_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS running_details (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  activity_id BIGINT UNSIGNED NOT NULL,
  target_distance_km DECIMAL(6,2) NOT NULL,
  actual_distance_km DECIMAL(6,2) NULL,
  pace_min_per_km DECIMAL(5,2) NULL,
  estimated_duration_minutes SMALLINT UNSIGNED NULL,
  route_geojson JSON NULL,
  weather_summary_json JSON NULL,
  recommendation_status ENUM('good', 'warning', 'bad', 'unknown') NOT NULL DEFAULT 'unknown',
  UNIQUE KEY uq_running_activity (activity_id),
  CONSTRAINT fk_running_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS swimming_details (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  activity_id BIGINT UNSIGNED NOT NULL,
  selected_place_id VARCHAR(190) NULL,
  weather_summary_json JSON NULL,
  recommendation_status ENUM('good', 'warning', 'bad', 'unknown') NOT NULL DEFAULT 'unknown',
  recommendation_reason TEXT NULL,
  UNIQUE KEY uq_swimming_activity (activity_id),
  CONSTRAINT fk_swimming_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS places_cache (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  external_place_id VARCHAR(190) NOT NULL,
  place_type ENUM('hall', 'pool') NOT NULL,
  name VARCHAR(190) NOT NULL,
  address VARCHAR(255) NULL,
  phone VARCHAR(50) NULL,
  website VARCHAR(500) NULL,
  opening_hours_json JSON NULL,
  rating DECIMAL(2,1) NULL,
  lat DECIMAL(10,7) NOT NULL,
  lng DECIMAL(10,7) NOT NULL,
  raw_json JSON NULL,
  cached_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_places_external_id (external_place_id),
  KEY idx_places_type (place_type),
  KEY idx_places_location (lat, lng)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS weather_cache (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  lat DECIMAL(10,7) NOT NULL,
  lng DECIMAL(10,7) NOT NULL,
  forecast_date DATE NOT NULL,
  forecast_hour TINYINT UNSIGNED NOT NULL,
  raw_json JSON NOT NULL,
  cached_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  KEY idx_weather_location_date (lat, lng, forecast_date, forecast_hour),
  KEY idx_weather_cached_at (cached_at)
) ENGINE=InnoDB;

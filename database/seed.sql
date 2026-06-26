USE planyourfit;

-- Jedyne konto pokazowe: demo@planyourfit.pl / Demo1234!
-- Hasło jest sprawdzane jawnie w API; kolumna pozostaje tylko dla zgodności schematu.
-- Ponowne uruchomienie seeda odtwarza czysty, przewidywalny stan prezentacyjny.
DELETE FROM users;
ALTER TABLE users AUTO_INCREMENT = 1;

INSERT INTO users (id, name, email, password_hash, default_location, default_postal_code, default_location_lat, default_location_lng, preferred_radius_km, monthly_activity_goal, theme)
VALUES (1, 'Maja', 'demo@planyourfit.pl', 'DEMO-BEZ-ZABEZPIECZEN', 'Warszawa', '00-001', 52.2297, 21.0122, 25, 12, 'light')
;

INSERT INTO activities (id, user_id, activity_type, title, activity_date, start_time, end_time, location_lat, location_lng, location_address, postal_code, note)
VALUES
  (101, 1, 'running', 'Poranny bieg', DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY), '07:30', '08:15', 52.2319, 21.0067, 'Park Saski, Warszawa', '00-102', 'Spokojne tempo, druga strefa'),
  (102, 1, 'basketball', 'Koszykówka ze znajomymi', DATE_ADD(CURRENT_DATE, INTERVAL 3 DAY), '18:00', '19:30', 52.2200, 21.0100, 'Hala Sportowa Arena', '00-001', 'Rezerwacja potwierdzona'),
  (103, 1, 'swimming', 'Regeneracja na basenie', DATE_ADD(CURRENT_DATE, INTERVAL 5 DAY), '10:00', '11:00', 52.2400, 21.0200, 'Pływalnia Fala', '00-001', 'Technika kraula')
ON DUPLICATE KEY UPDATE title = VALUES(title);

INSERT INTO running_details (activity_id, target_distance_km, actual_distance_km, pace_min_per_km, estimated_duration_minutes, recommendation_status)
VALUES (101, 7.00, 6.92, 6.00, 42, 'good')
ON DUPLICATE KEY UPDATE target_distance_km = VALUES(target_distance_km);

INSERT INTO basketball_details (activity_id, court_type, selected_place_id, recommendation_status, recommendation_reason)
VALUES (102, 'indoor', 'demo-hall-1', 'good', 'Trening na hali jest niezależny od pogody.')
ON DUPLICATE KEY UPDATE court_type = VALUES(court_type);

INSERT INTO swimming_details (activity_id, selected_place_id)
VALUES (103, 'demo-pool-1')
ON DUPLICATE KEY UPDATE selected_place_id = VALUES(selected_place_id);

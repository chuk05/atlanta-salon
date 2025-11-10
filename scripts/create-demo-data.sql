-- scripts/create-demo-data.sql
-- Date: 2024-01-01
-- Purpose: Create demo users for testing

-- Create demo users (passwords are all 'password')
INSERT INTO auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user) VALUES
('00000000-0000-0000-0000-000000000000', '11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'admin@atlantasalon.com', '$2a$10$N1ifSIdbNJ5Lx.WcMS.1.uSD.1Z.1e5kO6cC.Zb.6l.WsmYy8rQaK', '2024-01-01 00:00:00+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2024-01-01 00:00:00+00', '2024-01-01 00:00:00+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false),
('00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'staff@atlantasalon.com', '$2a$10$N1ifSIdbNJ5Lx.WcMS.1.uSD.1Z.1e5kO6cC.Zb.6l.WsmYy8rQaK', '2024-01-01 00:00:00+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2024-01-01 00:00:00+00', '2024-01-01 00:00:00+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false),
('00000000-0000-0000-0000-000000000000', '33333333-3333-3333-3333-333333333333', 'authenticated', 'authenticated', 'customer@atlantasalon.com', '$2a$10$N1ifSIdbNJ5Lx.WcMS.1.uSD.1Z.1e5kO6cC.Zb.6l.WsmYy8rQaK', '2024-01-01 00:00:00+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{}', NULL, '2024-01-01 00:00:00+00', '2024-01-01 00:00:00+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false)
ON CONFLICT (id) DO NOTHING;

-- Create profiles for demo users
INSERT INTO profiles (id, email, full_name, role) VALUES
('11111111-1111-1111-1111-111111111111', 'admin@atlantasalon.com', 'Admin User', 'admin'),
('22222222-2222-2222-2222-222222222222', 'staff@atlantasalon.com', 'Staff User', 'staff'),
('33333333-3333-3333-3333-333333333333', 'customer@atlantasalon.com', 'Customer User', 'customer')
ON CONFLICT (id) DO NOTHING;

-- Create staff record for staff user
INSERT INTO staff (user_id, specialization, bio) VALUES
('22222222-2222-2222-2222-222222222222', 'hair', 'Experienced hair stylist with 5 years of experience')
ON CONFLICT (user_id) DO NOTHING;

-- Assign staff to services
INSERT INTO staff_services (staff_id, service_id) 
SELECT 
  (SELECT id FROM staff WHERE user_id = '22222222-2222-2222-2222-222222222222'),
  id 
FROM services 
WHERE category = 'hair'
ON CONFLICT (staff_id, service_id) DO NOTHING;

-- Set working hours for staff
INSERT INTO working_hours (staff_id, day_of_week, start_time, end_time, is_active) VALUES
((SELECT id FROM staff WHERE user_id = '22222222-2222-2222-2222-222222222222'), 1, '09:00', '17:00', true),
((SELECT id FROM staff WHERE user_id = '22222222-2222-2222-2222-222222222222'), 2, '09:00', '17:00', true),
((SELECT id FROM staff WHERE user_id = '22222222-2222-2222-2222-222222222222'), 3, '09:00', '17:00', true),
((SELECT id FROM staff WHERE user_id = '22222222-2222-2222-2222-222222222222'), 4, '09:00', '17:00', true),
((SELECT id FROM staff WHERE user_id = '22222222-2222-2222-2222-222222222222'), 5, '09:00', '17:00', true)
ON CONFLICT (staff_id, day_of_week) DO NOTHING;
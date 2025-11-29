-- Setup script for testing authentication
-- Run this AFTER creating a user in Supabase Auth
-- Replace 'YOUR_SUPABASE_USER_UUID' with the actual UUID from Supabase

-- Example: Create a test hospital
INSERT INTO hospital (name, address, contact_number, specializations)
VALUES 
  ('Test Hospital 1', '123 Main St', '555-0101', 'General, Emergency'),
  ('Test Hospital 2', '456 Oak Ave', '555-0102', 'Cardiology, Surgery')
ON CONFLICT DO NOTHING
RETURNING hospital_id;

-- Example: Create SysAdmin user (replace UUID with actual Supabase user UUID)
-- First, create the user in Supabase Auth dashboard, then run:
/*
INSERT INTO users (user_id, name, email, role, hospital_id, permissions, is_active)
VALUES (
  'YOUR_SUPABASE_USER_UUID',  -- Replace with UUID from Supabase Auth
  'System Administrator',
  'admin@test.com',
  'SysAdmin',
  NULL,
  'view_dashboard,manage_users,manage_hospitals,manage_inventory,view_reports,invite_management,system_config',
  true
)
ON CONFLICT (user_id) DO NOTHING;
*/

-- Check existing hospitals
SELECT hospital_id, name FROM hospital;

-- Check existing users
SELECT user_id, email, role, hospital_id FROM users;


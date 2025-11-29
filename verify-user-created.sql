-- Verify that the SysAdmin user was created successfully
-- Run this query to check if your user exists in the database

SELECT 
    user_id,
    name,
    email,
    role,
    hospital_id,
    is_active,
    created_at
FROM users
WHERE email = 'admin@test.com';

-- If you see a row with your user data, the INSERT was successful!
-- You should see:
-- - user_id: 1f1f8472-22ae-4ae1-b1f8-024ed33f7f2b (or your UUID)
-- - name: System Administrator
-- - email: admin@test.com
-- - role: SysAdmin
-- - hospital_id: NULL
-- - is_active: true


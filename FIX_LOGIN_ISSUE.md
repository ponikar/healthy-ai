# Fix Login Issue - Step by Step

## Problem
Getting 400 Bad Request error when trying to login. This means the user doesn't exist in Supabase Auth.

## Solution: Create User in Supabase Auth

### Step 1: Go to Supabase Dashboard
1. Open: https://supabase.com/dashboard
2. Select your project

### Step 2: Create User
1. Click **"Authentication"** in left sidebar
2. Click **"Users"** tab
3. Click **"Add User"** button (top right)
4. Select **"Create new user"**

### Step 3: Fill User Details
- **Email**: `admin@test.com` (must match your database)
- **Password**: `Test1234!` (or your chosen password)
- **✅ Check "Auto Confirm User"** (IMPORTANT!)
- Click **"Create User"**

### Step 4: Copy the UUID
- After creation, you'll see the user in the list
- **Copy the UUID** (it's in the "UID" column)
- It should look like: `1f1f8472-22ae-4ae1-b1f8-024ed33f7f2b`

### Step 5: Verify UUID Matches Database
Run this SQL to check your database user:

```sql
SELECT user_id, email, role FROM users WHERE email = 'admin@test.com';
```

**The UUID in Supabase Auth MUST match the `user_id` in your database!**

If they don't match:
- Update your database entry with the correct UUID from Supabase
- OR delete the database entry and create a new one with the correct UUID

### Step 6: Try Login Again
1. Go to: `http://localhost:3000/auth/login`
2. Enter:
   - Email: `admin@test.com`
   - Password: `Test1234!` (the password you set in Supabase)
3. Click "Sign In with Email"
4. **You should now be redirected to `/dashboard`**

## What You'll See After Login

### Dashboard Page Shows:
1. **Header**: "Welcome, System Administrator (SysAdmin)"
2. **User Information Card**: Your email, role, permissions
3. **Quick Actions Card**: Links to other pages
4. **Invitations Section** (at the bottom):
   - "Invite User" button (top right)
   - List of pending invitations
   - Can manage invitations here

### To Invite Management:
1. Scroll to "Invitations" section
2. Click **"Invite User"** button
3. Fill form:
   - Email: `manager@hospital.com`
   - Role: Select "Management"
   - Hospital: Optional (can leave blank)
4. Click "Send Invitation"
5. Copy the invitation link from the toast notification
6. Share with the management user

## Troubleshooting

### Still Getting 400 Error?
- ✅ Check user exists in Supabase Auth
- ✅ Check email matches exactly (case-sensitive)
- ✅ Check password is correct
- ✅ Check "Auto Confirm User" was checked
- ✅ Check UUID matches between Supabase and database

### Login Works But Dashboard Shows Login Page?
- The user might not exist in your database
- Run: `SELECT * FROM users WHERE email = 'admin@test.com';`
- If no results, create the database entry with the correct UUID

### Dashboard Shows But No Invitations Section?
- Check your role in database: `SELECT role FROM users WHERE email = 'admin@test.com';`
- Should be `SysAdmin` or `Management`
- If not, update it: `UPDATE users SET role = 'SysAdmin' WHERE email = 'admin@test.com';`


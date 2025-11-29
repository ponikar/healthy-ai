# Testing Guide for Supabase Authentication

This guide will walk you through testing the authentication system step by step.

## Prerequisites

1. **Supabase Account** - Sign up at https://supabase.com (free tier works)
2. **Node.js** - Ensure you have Node.js installed
3. **PostgreSQL Database** - Your existing database connection

## Step 1: Set Up Supabase Project

1. Go to https://supabase.com and create a new project
2. Wait for the project to be created (takes ~2 minutes)
3. Go to **Settings** → **API**
4. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)
   - **service_role key** (starts with `eyJ...`) - Keep this secret!

## Step 2: Install Dependencies

```bash
cd healthy-ai
npm install @supabase/supabase-js @supabase/ssr --legacy-peer-deps
```

## Step 3: Configure Environment Variables

Create a `.env` file in the `healthy-ai` directory (or update existing one):

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Database (existing)
DATABASE_URL=your-postgres-connection-string

# App URL (for invitation links)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

**Important:** Replace the placeholder values with your actual Supabase credentials.

## Step 4: Run Database Migration

Update your database schema:

```bash
npm run db:push
```

This will create:
- Updated `users` table with UUID primary key
- New `invitations` table
- Updated role enum

## Step 5: Create Your First SysAdmin User

Since we need a SysAdmin to invite others, we'll create one manually first.

### Option A: Using Supabase Dashboard (Recommended)

1. Go to Supabase Dashboard → **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Enter:
   - Email: `admin@test.com`
   - Password: `Test1234!`
   - Auto Confirm User: ✅ (checked)
4. Copy the **User UID** (UUID)

### Option B: Using SQL (Alternative)

Run this SQL in your database (replace `USER_UUID_FROM_SUPABASE` with the UUID from Supabase):

```sql
INSERT INTO users (user_id, name, email, role, hospital_id, permissions, is_active)
VALUES (
  'USER_UUID_FROM_SUPABASE',  -- Replace with actual UUID from Supabase
  'System Admin',
  'admin@test.com',
  'SysAdmin',
  NULL,
  'view_dashboard,manage_users,manage_hospitals,manage_inventory,view_reports,invite_management,system_config',
  true
);
```

## Step 6: Start the Development Server

```bash
npm run dev
```

The app should start at `http://localhost:3000`

## Step 7: Test the Authentication Flow

### Test 1: Login as SysAdmin

1. Navigate to `http://localhost:3000/auth/login`
2. Enter:
   - Email: `admin@test.com`
   - Password: `Test1234!`
3. Click **Login**
4. You should be redirected to the home page

### Test 2: Create a Test Hospital (if needed)

Before inviting Management, you might need a hospital in the database:

```sql
INSERT INTO hospital (name, address, contact_number)
VALUES ('Test Hospital', '123 Test St', '123-456-7890')
RETURNING hospital_id;
```

Note the `hospital_id` for the next step.

### Test 3: Invite a Management User

1. Create a test page or use tRPC directly to test invitations
2. Or create a simple test page at `src/app/test-invite/page.tsx`:

```tsx
"use client";

import { InviteUserForm } from "~/components/auth/InviteUserForm";
import { InvitationsList } from "~/components/auth/InvitationsList";

export default function TestInvitePage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Test Invitations</h1>
      <div className="space-y-8">
        <InviteUserForm hospitalId={1} />
        <InvitationsList hospitalId={1} />
      </div>
    </div>
  );
}
```

3. Navigate to `/test-invite` (while logged in as SysAdmin)
4. Click **Invite User**
5. Fill in:
   - Email: `management@test.com`
   - Role: `Management`
   - Hospital ID: `1` (or your test hospital ID)
6. Click **Send Invitation**
7. Copy the invitation link from the success toast

### Test 4: Accept Invitation

1. Open the invitation link in an incognito/private window
2. You should see the "Accept Invitation" page
3. Fill in:
   - Name: `Test Manager`
   - Password: `Test1234!`
   - Confirm Password: `Test1234!`
4. Click **Accept Invitation**
5. You should be automatically logged in

### Test 5: Test Role-Based Access

1. Log in as Management user
2. Try to invite a Doctor:
   - Email: `doctor@test.com`
   - Role: `Doctor`
   - Hospital ID: `1`
3. Verify the invitation is created
4. Try to invite another Management user (should fail - only SysAdmin can do this)

### Test 6: Test Hospital Scoping

1. Create another hospital in the database
2. As Management user from Hospital 1, try to invite staff to Hospital 2
3. Should fail with "You can only invite staff to your own hospital"

## Step 8: Test Using tRPC Playground (Optional)

You can also test the API directly using tRPC:

1. Navigate to `http://localhost:3000/api/trpc` (if tRPC playground is enabled)
2. Or use the tRPC client in your code

## Common Issues & Solutions

### Issue: "Invalid API key" error

**Solution:** 
- Double-check your `.env` file has the correct Supabase keys
- Ensure `NEXT_PUBLIC_` prefix is on client-side variables
- Restart the dev server after changing `.env`

### Issue: "User not found" after login

**Solution:**
- Ensure the user exists in both Supabase Auth AND your `users` table
- Check that `user_id` in `users` table matches the UUID from Supabase Auth

### Issue: Invitation link doesn't work

**Solution:**
- Check the token in the URL matches the database
- Verify invitation hasn't expired (7 days default)
- Check invitation status is "pending"

### Issue: "Cannot read properties of undefined" in middleware

**Solution:**
- Ensure `src/server/supabase/server.ts` exists
- Check that environment variables are loaded correctly
- Restart the dev server

### Issue: Database migration fails

**Solution:**
- Check your `DATABASE_URL` is correct
- Ensure you have permissions to create tables
- Check for existing conflicting tables

## Quick Test Checklist

- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Dependencies installed
- [ ] Database migration successful
- [ ] First SysAdmin user created
- [ ] Can login as SysAdmin
- [ ] Can invite Management user
- [ ] Management user can accept invitation
- [ ] Management user can invite Doctor/Nurse
- [ ] Role-based restrictions work
- [ ] Hospital scoping works

## Next Steps After Testing

1. Set up email service for sending invitation emails (instead of showing link in toast)
2. Add password reset functionality
3. Create user management dashboard
4. Add user profile pages
5. Implement logout functionality
6. Add protected route redirects

## Testing with Different Roles

### SysAdmin Tests
- ✅ Can invite Management
- ✅ Can see all hospitals
- ✅ Can manage all users
- ❌ Cannot invite Doctor/Nurse directly (should go through Management)

### Management Tests
- ✅ Can invite Doctor and Nurse
- ✅ Can only invite to their own hospital
- ✅ Can see their hospital's invitations
- ❌ Cannot invite other Management users
- ❌ Cannot access other hospitals

### Doctor/Nurse Tests
- ✅ Can view forecasts
- ✅ Can view patient flow
- ❌ Cannot invite users
- ❌ Cannot access other hospitals

## Debugging Tips

1. **Check Supabase Auth logs:**
   - Go to Supabase Dashboard → Authentication → Logs

2. **Check database:**
   ```sql
   SELECT * FROM users;
   SELECT * FROM invitations;
   ```

3. **Check browser console:**
   - Open DevTools → Console for client-side errors

4. **Check server logs:**
   - Look at terminal where `npm run dev` is running

5. **Test API directly:**
   - Use tRPC or create test API routes

Happy testing! 🚀


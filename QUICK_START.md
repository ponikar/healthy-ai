# Quick Start Testing Guide

## 🚀 Fast Track Setup (5 minutes)

### 1. Install Dependencies
```bash
npm install @supabase/supabase-js @supabase/ssr --legacy-peer-deps
```

### 2. Create Supabase Project
1. Go to https://supabase.com → Sign up/Login
2. Click "New Project"
3. Fill in project details (use free tier)
4. Wait ~2 minutes for setup

### 3. Get Your Keys
1. In Supabase Dashboard → **Settings** → **API**
2. Copy these values:
   - **Project URL**
   - **anon/public key**
   - **service_role key** (⚠️ Keep secret!)

### 4. Update .env File
Create/update `.env` in `healthy-ai/` directory:

```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=your-existing-db-url
NODE_ENV=development
```

### 5. Run Migration
```bash
npm run db:push
```

### 6. Create First SysAdmin User

**Option A: Using Supabase Dashboard (Easiest)**
1. Supabase Dashboard → **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Email: `admin@test.com`
4. Password: `Test1234!`
5. ✅ Check "Auto Confirm User"
6. Click **Create User**
7. **Copy the User UID** (UUID)

**Option B: Using SQL**
Run this in your database (replace `UUID_HERE` with the UUID from step above):

```sql
INSERT INTO users (user_id, name, email, role, hospital_id, permissions, is_active)
VALUES (
  'UUID_HERE',
  'System Admin',
  'admin@test.com',
  'SysAdmin',
  NULL,
  'view_dashboard,manage_users,manage_hospitals,manage_inventory,view_reports,invite_management,system_config',
  true
);
```

### 7. Create a Test Hospital (Optional)
```sql
INSERT INTO hospital (name, address, contact_number)
VALUES ('Test Hospital', '123 Test St', '555-0100')
RETURNING hospital_id;
```

### 8. Start the App
```bash
npm run dev
```

### 9. Test Login
1. Go to http://localhost:3000/auth/login
2. Login with:
   - Email: `admin@test.com`
   - Password: `Test1234!`
3. Should redirect to home page

### 10. Test Invitations
1. Go to http://localhost:3000/test-invite
2. Click **Invite User**
3. Fill form:
   - Email: `manager@test.com`
   - Role: `Management`
   - Hospital ID: `1` (or your test hospital ID)
4. Click **Send Invitation**
5. Copy the invitation link from the success message
6. Open link in incognito window
7. Fill the form to accept invitation
8. Should auto-login after acceptance

## ✅ Verification Checklist

- [ ] Can login as SysAdmin
- [ ] Can see test-invite page
- [ ] Can send invitation
- [ ] Can see invitation in list
- [ ] Can accept invitation
- [ ] New user can login

## 🐛 Common Issues

**"Invalid API key"**
→ Check `.env` file has correct keys
→ Restart dev server after changing `.env`

**"User not found" after login**
→ User must exist in BOTH Supabase Auth AND your `users` table
→ Check UUID matches

**Invitation link doesn't work**
→ Check token in URL matches database
→ Verify invitation hasn't expired

## 📚 Next Steps

- Read full `TESTING_GUIDE.md` for detailed testing
- Read `SUPABASE_AUTH_SETUP.md` for architecture details
- Set up email service for invitations
- Add password reset functionality

## 🆘 Need Help?

1. Check browser console for errors
2. Check terminal where `npm run dev` is running
3. Check Supabase Dashboard → Authentication → Logs
4. Verify database tables exist: `SELECT * FROM users; SELECT * FROM invitations;`


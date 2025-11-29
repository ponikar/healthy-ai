# Complete User Flow Guide

This document explains the step-by-step flow of how the invitation system works from start to finish.

## 🎯 Overview

The system works in this order:
1. **Initial Setup**: Create first SysAdmin user (one-time setup)
2. **SysAdmin invites Management**: Hospital administrators
3. **Management invites Staff**: Doctors and Nurses
4. **Staff uses the system**: Access dashboard with their permissions

---

## 📋 Step-by-Step Flow

### **STEP 1: Initial Setup (One-Time)**

**Problem**: You need a SysAdmin to start inviting others, but you need someone to create the first SysAdmin.

**Solution**: Manual setup (one-time only)

#### 1.1 Create User in Supabase Auth
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" → "Create new user"
3. Enter:
   - Email: `admin@test.com`
   - Password: `Test1234!`
   - ✅ Check "Auto Confirm User"
4. Click "Create User"
5. **Copy the User UUID** (you'll need this)

#### 1.2 Create User in Database
Run this SQL in your database (replace `UUID_HERE` with the UUID from step 1.1):

```sql
INSERT INTO users (user_id, name, email, role, hospital_id, permissions, is_active)
VALUES (
  'UUID_HERE',  -- Replace with UUID from Supabase
  'System Administrator',
  'admin@test.com',
  'SysAdmin',
  NULL,
  'view_dashboard,manage_users,manage_hospitals,manage_inventory,view_reports,invite_management,system_config',
  true
);
```

#### 1.3 Create Test Hospitals (Optional)
```sql
INSERT INTO hospital (name, address, contact_number)
VALUES 
  ('City General Hospital', '123 Main St', '555-0101'),
  ('Regional Medical Center', '456 Oak Ave', '555-0102')
RETURNING hospital_id;
```

**✅ Now you have a SysAdmin user!**

---

### **STEP 2: Login as SysAdmin**

1. Go to: `http://localhost:3000` (or your app URL)
2. Click "Login" card
3. Enter credentials:
   - Email: `admin@test.com`
   - Password: `Test1234!`
4. Click "Sign In with Email"
5. **You'll be redirected to `/dashboard`**

---

### **STEP 3: Dashboard View (After Login)**

Once logged in as SysAdmin, you'll see:

```
┌─────────────────────────────────────────┐
│  Dashboard                    [Logout] │
│  Welcome, System Administrator         │
│  (SysAdmin)                             │
├─────────────────────────────────────────┤
│  User Information    │  Quick Actions  │
│  Email: admin@...    │  [Manage Inv...]│
│  Role: SysAdmin      │  [Test JWT...]  │
│  Permissions: ...    │  [Go to Home]   │
├─────────────────────────────────────────┤
│  Invitations                             │
│  ┌───────────────────────────────────┐ │
│  │ Pending Invitations  [Invite User]│ │
│  │                                    │ │
│  │ No pending invitations            │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Key Section**: The "Invitations" card at the bottom!

---

### **STEP 4: SysAdmin Invites Hospital Management**

1. **Scroll down** to the "Invitations" section on the dashboard
2. Click the **"Invite User"** button (top right of Invitations card)
3. A dialog/form opens:

```
┌─────────────────────────────────────┐
│  Invite User                         │
│  ─────────────────────────────────── │
│  Email: [________________]           │
│  Role:  [Management ▼]               │
│  Hospital: [Select hospital ▼]       │
│         (Optional - can leave blank) │
│  ─────────────────────────────────── │
│  [Cancel]  [Send Invitation]         │
└─────────────────────────────────────┘
```

4. Fill the form:
   - **Email**: `manager@hospital.com`
   - **Role**: Select "Management" (only option)
   - **Hospital**: Select a hospital OR leave blank
5. Click "Send Invitation"
6. **A toast notification appears** with the invitation link:
   ```
   ✅ Invitation sent successfully!
   Invitation link: http://localhost:3000/auth/accept-invitation?token=abc123...
   ```
7. **Copy this link** and share it with the management user

---

### **STEP 5: Management User Accepts Invitation**

1. Management user receives the invitation link
2. Clicks the link: `http://localhost:3000/auth/accept-invitation?token=abc123...`
3. Sees the "Create an account" page:

```
┌─────────────────────────────────────┐
│  Create an account                   │
│  Enter your details below...         │
│  ─────────────────────────────────── │
│  Full Name: [________________]       │
│  Password:  [________________]       │
│  Confirm:   [________________]       │
│  ─────────────────────────────────── │
│  [Create Account]                    │
└─────────────────────────────────────┘
```

4. Fills the form:
   - **Full Name**: `John Manager`
   - **Password**: `SecurePass123!`
   - **Confirm Password**: `SecurePass123!`
5. Clicks "Create Account"
6. **Account is created and user is automatically logged in**
7. **Redirected to dashboard**

---

### **STEP 6: Management User's Dashboard**

Now logged in as Management, they see:

```
┌─────────────────────────────────────────┐
│  Dashboard                    [Logout] │
│  Welcome, John Manager                  │
│  (Management)                           │
├─────────────────────────────────────────┤
│  User Information    │  Quick Actions  │
│  Email: manager@...  │  [Manage Inv...]│
│  Role: Management    │  [Test JWT...]  │
│  Hospital ID: 1      │  [Go to Home]   │
├─────────────────────────────────────────┤
│  Invitations                             │
│  ┌───────────────────────────────────┐ │
│  │ Pending Invitations  [Invite User]│ │
│  │                                    │ │
│  │ No pending invitations            │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**Note**: They can now invite Doctors and Nurses!

---

### **STEP 7: Management Invites Staff (Doctor/Nurse)**

1. Management user scrolls to "Invitations" section
2. Clicks **"Invite User"** button
3. Form opens (different from SysAdmin's form):

```
┌─────────────────────────────────────┐
│  Invite User                         │
│  ─────────────────────────────────── │
│  Email: [________________]           │
│  Role:  [Doctor ▼]                   │
│         [Nurse ▼]                    │
│  This user will be assigned to       │
│  your hospital.                      │
│  ─────────────────────────────────── │
│  [Cancel]  [Send Invitation]         │
└─────────────────────────────────────┘
```

**Key Differences**:
- Only "Doctor" and "Nurse" roles available
- No hospital selection (automatically uses their hospital)
- Shows message: "This user will be assigned to your hospital"

4. Fill the form:
   - **Email**: `doctor@hospital.com`
   - **Role**: Select "Doctor" or "Nurse"
5. Click "Send Invitation"
6. **Copy the invitation link** and share it

---

### **STEP 8: Staff Accepts Invitation**

1. Staff member clicks invitation link
2. Sees "Create an account" page (same as Management)
3. Fills name and password
4. Clicks "Create Account"
5. **Account created and logged in**
6. **Redirected to dashboard**

---

### **STEP 9: Staff Dashboard**

Staff (Doctor/Nurse) see:

```
┌─────────────────────────────────────────┐
│  Dashboard                    [Logout] │
│  Welcome, Dr. Smith                     │
│  (Doctor)                               │
├─────────────────────────────────────────┤
│  User Information    │  Quick Actions  │
│  Email: doctor@...    │  [Test JWT...]  │
│  Role: Doctor        │  [Go to Home]   │
│  Hospital ID: 1       │                  │
└─────────────────────────────────────────┘
```

**Note**: They DON'T see the "Invitations" section (can't invite anyone)

---

## 🔍 Troubleshooting

### "I only see login page on dashboard"

**This means you're not logged in!**

**Solutions**:
1. Make sure you completed Step 1 (Initial Setup)
2. Go to `/auth/login` and log in with your SysAdmin credentials
3. After login, you should be redirected to `/dashboard`
4. If you see login page on dashboard, check:
   - Are you logged in? (Check browser cookies)
   - Is your user in the database? (Run SQL query to check)
   - Is your Supabase session valid?

### "I don't see Invitations section"

**This means**:
- You're not logged in as SysAdmin or Management
- OR you're logged in as Doctor/Nurse (they can't see it)

**Solutions**:
- Check your role in the database
- Log out and log back in
- Make sure you completed the initial setup correctly

### "Invite User button doesn't work"

**Check**:
- Are you logged in?
- Is your role SysAdmin or Management?
- Check browser console for errors
- Check network tab for API errors

---

## 🎬 Quick Start Checklist

- [ ] Created SysAdmin user in Supabase Auth
- [ ] Created SysAdmin user in database
- [ ] Created at least one hospital (optional)
- [ ] Logged in as SysAdmin
- [ ] Can see Dashboard with Invitations section
- [ ] Can click "Invite User" button
- [ ] Can see invitation form
- [ ] Can send invitation
- [ ] Can see invitation link in toast notification

---

## 📍 Important URLs

- **Home**: `http://localhost:3000/`
- **Login**: `http://localhost:3000/auth/login`
- **Dashboard**: `http://localhost:3000/dashboard`
- **Accept Invitation**: `http://localhost:3000/auth/accept-invitation?token=xxx`

---

## 💡 Tips

1. **Always check your role** - Different roles see different things
2. **Copy invitation links** - They're shown in toast notifications
3. **Invitations expire in 7 days** - Send new ones if expired
4. **One invitation per email** - Can't have multiple pending invitations for same email
5. **Hospital assignment** - Management can only invite to their own hospital


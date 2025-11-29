# Supabase Authentication Setup Guide

This document explains the authentication system built for the Healthcare Crisis Management platform.

## Overview

The system uses **Supabase Auth** for authentication with role-based access control (RBAC) and an invitation system for multi-tenant hospital management.

## Architecture

### Roles

1. **SysAdmin** - System administrators
   - Can invite Management users
   - Can access all hospitals
   - Full system access

2. **Management** - Hospital administrators
   - Can invite Doctor and Nurse users
   - Manages their hospital's staff and resources
   - Hospital-scoped access

3. **Doctor** - Medical doctors
   - View forecasts and patient flow
   - Hospital-scoped access

4. **Nurse** - Nursing staff
   - View forecasts and patient flow
   - Manage patient intake
   - Hospital-scoped access

### Database Schema

#### Users Table
- `user_id` (UUID) - Primary key, syncs with Supabase `auth.users.id`
- `name` - User's full name
- `email` - Unique email address
- `role` - User role (ENUM)
- `hospital_id` - Foreign key to hospital (nullable for SysAdmin)
- `permissions` - CSV string of permissions
- `is_active` - Account status

#### Invitations Table
- `invitation_id` - Primary key
- `email` - Invited email
- `role` - Role to assign
- `hospital_id` - Hospital assignment (for Doctor/Nurse)
- `invited_by` - User who sent invitation
- `token` - Unique invitation token
- `status` - pending | accepted | expired
- `expires_at` - Expiration timestamp

## Setup Instructions

### 1. Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr --legacy-peer-deps
```

### 2. Environment Variables

Add to your `.env` file:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# App URL (for invitation links)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Supabase Setup

1. Create a Supabase project at https://supabase.com
2. Get your project URL and API keys from Settings > API
3. Enable Email authentication in Authentication > Providers
4. Configure email templates for invitations (optional)

### 4. Database Migration

Run the database migration to create the new tables:

```bash
npm run db:push
```

## Usage

### Invitation Flow

1. **SysAdmin invites Management:**
   ```typescript
   // SysAdmin can invite Management users
   // hospital_id is optional (can create hospital admins)
   await trpc.auth.inviteUser.mutate({
     email: "admin@hospital.com",
     role: "Management",
     hospital_id: 1, // optional
   });
   ```

2. **Management invites Staff:**
   ```typescript
   // Management can invite Doctor/Nurse
   // hospital_id is required and must match their hospital
   await trpc.auth.inviteUser.mutate({
     email: "doctor@hospital.com",
     role: "Doctor",
     hospital_id: 1, // required
   });
   ```

3. **User accepts invitation:**
   - User receives invitation link: `/auth/accept-invitation?token=xxx`
   - User fills form with name and password
   - Account is created in Supabase Auth and users table
   - User is automatically logged in

### Authentication

#### Login
```typescript
// Client-side
const supabase = createSupabaseBrowser();
await supabase.auth.signInWithPassword({
  email: "user@example.com",
  password: "password",
});
```

#### Get Current User
```typescript
// Server-side
import { getCurrentUser } from "~/server/auth";
const user = await getCurrentUser();
```

#### Protected Routes
```typescript
// tRPC procedure
export const myRouter = createTRPCRouter({
  myProtectedRoute: protectedProcedure.query(({ ctx }) => {
    // ctx.user is guaranteed to be non-null
    return { userId: ctx.user.id };
  }),
});
```

### Role-Based Access Control

```typescript
import { requireRole, requirePermission } from "~/server/auth/rbac";

// In tRPC router
export const myRouter = createTRPCRouter({
  adminOnly: protectedProcedure.query(({ ctx }) => {
    const user = requireRole(ctx.user, ["SysAdmin"]);
    // user is guaranteed to be SysAdmin
  }),

  manageUsers: protectedProcedure.mutation(({ ctx }) => {
    requirePermission(ctx.user, "manage_users");
    // User has manage_users permission
  }),
});
```

### Components

#### Invite User Form
```tsx
import { InviteUserForm } from "~/components/auth/InviteUserForm";

<InviteUserForm 
  hospitalId={hospitalId} 
  onSuccess={() => console.log("Invited!")} 
/>
```

#### Invitations List
```tsx
import { InvitationsList } from "~/components/auth/InvitationsList";

<InvitationsList hospitalId={hospitalId} />
```

## Permissions System

Each role has default permissions:

- **SysAdmin**: `view_dashboard,manage_users,manage_hospitals,manage_inventory,view_reports,invite_management,system_config`
- **Management**: `view_dashboard,manage_users,manage_inventory,view_reports,invite_staff,view_forecasts,manage_schedules`
- **Doctor**: `view_dashboard,view_forecasts,view_patient_flow,view_reports`
- **Nurse**: `view_dashboard,view_forecasts,view_patient_flow,manage_patient_intake`

## Security Features

1. **Token-based invitations** - Secure, time-limited invitation tokens
2. **Role-based access control** - Enforced at the API level
3. **Hospital scoping** - Users can only access their assigned hospital
4. **Permission checks** - Fine-grained permission system
5. **Session management** - Handled by Supabase Auth

## Next Steps

1. Set up email service for sending invitation emails
2. Add password reset functionality
3. Implement user profile management
4. Add audit logging for user actions
5. Set up rate limiting for authentication endpoints

## Troubleshooting

### "User not found" after login
- Ensure user exists in both Supabase Auth and your `users` table
- Check that `user_id` matches Supabase `auth.users.id`

### Invitation not working
- Verify token hasn't expired (7 days default)
- Check invitation status is "pending"
- Ensure email matches invitation email

### Permission denied errors
- Verify user has correct role
- Check permissions CSV includes required permission
- Ensure hospital_id matches for hospital-scoped operations


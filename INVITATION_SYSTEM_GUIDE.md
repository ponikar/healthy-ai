# Invitation System Guide

This guide explains how the invitation system works for SysAdmin and Hospital Management.

## Overview

The invitation system allows:
- **SysAdmin** to invite Hospital Management users
- **Hospital Management** to invite Doctor and Nurse staff

## How It Works

### 1. SysAdmin Invites Hospital Management

**Steps:**
1. SysAdmin logs into the dashboard
2. Navigates to the "Invitations" section
3. Clicks "Invite User" button
4. Fills out the form:
   - **Email**: The email address of the management user
   - **Role**: Select "Management" (only option available for SysAdmin)
   - **Hospital** (Optional): 
     - Can select an existing hospital from the dropdown
     - Can leave blank for general admin (not assigned to a specific hospital)
5. Clicks "Send Invitation"
6. System generates an invitation link and displays it
7. SysAdmin shares the invitation link with the management user

**What happens:**
- An invitation record is created in the database
- An invitation link is generated: `/auth/accept-invitation?token=xxx`
- The invitation expires in 7 days

### 2. Hospital Management Invites Staff (Doctor/Nurse)

**Steps:**
1. Management user logs into the dashboard
2. Navigates to the "Invitations" section
3. Clicks "Invite User" button
4. Fills out the form:
   - **Email**: The email address of the staff member
   - **Role**: Select either "Doctor" or "Nurse" (only options available for Management)
   - **Hospital**: Automatically set to the management user's hospital (cannot be changed)
5. Clicks "Send Invitation"
6. System generates an invitation link and displays it
7. Management shares the invitation link with the staff member

**What happens:**
- An invitation record is created with the management user's hospital_id
- An invitation link is generated
- The staff member will be automatically assigned to the management user's hospital

### 3. User Accepts Invitation

**Steps:**
1. User receives the invitation link (via email or direct sharing)
2. Clicks the link: `/auth/accept-invitation?token=xxx`
3. Fills out the account creation form:
   - **Full Name**: Their name
   - **Password**: Must be at least 8 characters
   - **Confirm Password**: Must match password
4. Clicks "Create Account"
5. System creates:
   - Supabase Auth account
   - User record in the database with assigned role and hospital
6. User is automatically logged in and redirected to the dashboard

## Access Control

### Role-Based Permissions

- **SysAdmin**:
  - Can invite: Management only
  - Can see: All pending invitations
  - Can assign: Any hospital or no hospital

- **Management**:
  - Can invite: Doctor and Nurse only
  - Can see: Only invitations for their hospital
  - Must assign: Their own hospital (automatic)

- **Doctor/Nurse**:
  - Cannot invite anyone
  - Cannot see invitations

## Dashboard Features

### For SysAdmin and Management:

1. **Invitations Section**:
   - View all pending invitations
   - See invitation details (email, role, created date, expiry date)
   - Revoke invitations
   - Send new invitations

2. **Invitation Form**:
   - Role selection filtered based on user's role
   - Hospital selection (for SysAdmin only when inviting Management)
   - Automatic hospital assignment (for Management inviting staff)

## Technical Details

### API Endpoints

- `auth.inviteUser`: Send an invitation
- `auth.acceptInvitation`: Accept an invitation and create account
- `auth.getInvitations`: Get list of pending invitations
- `auth.revokeInvitation`: Cancel an invitation
- `hospital.getAll`: Get all hospitals (SysAdmin only)

### Database Tables

- **invitations**: Stores invitation records
  - `email`: Invited email
  - `role`: Role to assign
  - `hospital_id`: Hospital assignment (nullable)
  - `token`: Unique invitation token
  - `status`: pending | accepted | expired
  - `expires_at`: Expiration timestamp

- **users**: Stores user accounts
  - `user_id`: UUID (syncs with Supabase Auth)
  - `email`: User email
  - `role`: User role
  - `hospital_id`: Hospital assignment

## Example Workflow

1. **Initial Setup**:
   - SysAdmin creates first SysAdmin user manually (see QUICK_START.md)
   - SysAdmin creates hospitals in the database

2. **Invite Hospital Management**:
   - SysAdmin → Dashboard → Invitations → Invite User
   - Enter management email, select "Management" role
   - Optionally select a hospital
   - Share invitation link

3. **Management Accepts**:
   - Management clicks invitation link
   - Creates account with name and password
   - Gets access to dashboard

4. **Management Invites Staff**:
   - Management → Dashboard → Invitations → Invite User
   - Enter staff email, select "Doctor" or "Nurse"
   - Hospital is automatically set
   - Share invitation link

5. **Staff Accepts**:
   - Staff clicks invitation link
   - Creates account
   - Gets access to dashboard with hospital-scoped permissions

## Notes

- Invitations expire after 7 days
- Each email can only have one pending invitation at a time
- Users cannot invite themselves
- Hospital Management can only invite staff to their own hospital
- SysAdmin can create Management users without hospital assignment (general admins)


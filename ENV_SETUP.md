# Environment Variables Setup

## Supabase Keys Mapping

Based on the keys you showed, here's what goes where:

### Your Keys:
- **Publishable key**: `sb_publishable_0Qq8rWdGDeAnGhrGQoOq1g_k1umDSUZ`
- **Secret key**: `sb_secret_AuQOr...` (full key needed)

### Environment Variables Needed:

```env
# Supabase Project URL (get from Supabase Dashboard → Settings → API)
SUPABASE_URL=https://your-project-id.supabase.co

# Secret Key (for server-side admin operations)
# This is your "sb_secret_..." key (the full key, not just the prefix)
SUPABASE_SERVICE_ROLE_KEY=sb_secret_AuQOr...your-full-secret-key-here

# Public URL (same as SUPABASE_URL, but exposed to client)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Publishable/Anon Key (for client-side)
# This is your "sb_publishable_..." key
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_0Qq8rWdGDeAnGhrGQoOq1g_k1umDSUZ

# Your existing database
DATABASE_URL=your-postgres-connection-string

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Node environment
NODE_ENV=development
```

## Where to Find Standard Supabase Keys

If the keys you're seeing are different, here's where to find the standard ones:

1. **Go to Supabase Dashboard**
2. **Settings** → **API**
3. You should see:
   - **Project URL** → Use for `SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Use for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → Use for `SUPABASE_SERVICE_ROLE_KEY`

## Key Format Differences

Your keys use `sb_publishable_...` and `sb_secret_...` format, which might be:
- Supabase CLI keys
- Newer Supabase API format
- Different Supabase service

**Standard format** is usually:
- `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (JWT format)

## How to Use Your Keys

### Option 1: Use the keys you have (if compatible)

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sb_secret_AuQOr...full-key
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_0Qq8rWdGDeAnGhrGQoOq1g_k1umDSUZ
```

### Option 2: Get standard keys from Dashboard

1. Go to Supabase Dashboard
2. Settings → API
3. Copy the standard keys (anon and service_role)

## Important Notes

1. **Publishable key** = Safe for browser (client-side)
   - Goes in `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Can be exposed in client code

2. **Secret key** = Server-only (never expose!)
   - Goes in `SUPABASE_SERVICE_ROLE_KEY`
   - Only use in server-side code
   - Has admin privileges

3. **Project URL** = Your Supabase project URL
   - Format: `https://xxxxx.supabase.co`
   - Used for both server and client

## Testing Your Keys

After setting up `.env`, test if keys work:

```bash
npm run dev
```

If you see errors about invalid keys, check:
- Keys are complete (not truncated)
- Project URL is correct
- Keys match the format Supabase expects

## Security Checklist

- [ ] Secret key is NOT in client code
- [ ] Secret key is NOT committed to git
- [ ] `.env` is in `.gitignore`
- [ ] Publishable key is safe to expose (has RLS enabled)


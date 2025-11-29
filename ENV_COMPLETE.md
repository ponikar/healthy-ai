# Complete Environment Setup

## Your Supabase Project Details

- **Project Reference**: `udhnguenrxokakumwsup`
- **Project URL**: `https://udhnguenrxokakumwsup.supabase.co`
- **Region**: AWS ap-southeast-1

## Environment Variables

Create a `.env` file in the `healthy-ai` directory with these values:

```env
# Supabase Configuration
SUPABASE_URL=https://udhnguenrxokakumwsup.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkaG5ndWVucnhva2FrdW13c3VwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzQ4MzE4MywiZXhwIjoyMDc5MDU5MTgzfQ.qT6p1WtdrqWi4uV12u6S_yujprsV_RY5IwM3LNGG6Yc

# Client-side (exposed to browser)
NEXT_PUBLIC_SUPABASE_URL=https://udhnguenrxokakumwsup.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkaG5ndWVucnhva2FrdW13c3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0ODMxODMsImV4cCI6MjA3OTA1OTE4M30.9KqiG7NDUFGxA7ax8Sc-yN_R0ODxfGQ4cU0xbHHAC3U

# Database Connection
# ⚠️ REPLACE [YOUR-PASSWORD] with your actual database password
DATABASE_URL=postgresql://postgres.udhnguenrxokakumwsup:[YOUR-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true

# Direct connection for migrations (optional but recommended)
DIRECT_URL=postgresql://postgres.udhnguenrxokakumwsup:[YOUR-PASSWORD]@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

## Important Steps

### 1. Get Your Database Password

You need to replace `[YOUR-PASSWORD]` with your actual Supabase database password:

1. Go to Supabase Dashboard
2. **Settings** → **Database**
3. Look for **Database Password** or reset it if needed
4. Copy the password

### 2. Update .env File

Replace `[YOUR-PASSWORD]` in both `DATABASE_URL` and `DIRECT_URL` with your actual password.

### 3. Security Notes

- ✅ **anon key** (NEXT_PUBLIC_SUPABASE_ANON_KEY) - Safe to expose in browser
- ⚠️ **service_role key** (SUPABASE_SERVICE_ROLE_KEY) - **NEVER expose in client code!**
- ⚠️ **Database password** - **NEVER commit to git!**

### 4. Verify .gitignore

Make sure `.env` is in your `.gitignore`:

```gitignore
.env
.env.local
.env*.local
```

## Key Mapping

| What You Have | Environment Variable | Usage |
|--------------|---------------------|-------|
| `anon public` (JWT) | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client-side auth |
| `service_role` (JWT) | `SUPABASE_SERVICE_ROLE_KEY` | Server-side admin |
| Project URL | `SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_URL` | API endpoint |
| Database URL | `DATABASE_URL` | Connection pooling |
| Direct URL | `DIRECT_URL` | Migrations |

## Alternative Keys (If Needed)

You also have these keys, but the JWT format above is recommended:

- **Publishable**: `sb_publishable_0Qq8rWdGDeAnGhrGQoOq1g_k1umDSUZ`
- **Secret**: `sb_secret_AuQOrgKlxUF8No0BFiV-SQ_ZuArjTdR`

If the JWT keys don't work, you can try these instead, but the JWT format is standard for Supabase.

## Next Steps

1. ✅ Create `.env` file with the values above
2. ✅ Replace `[YOUR-PASSWORD]` with actual password
3. ✅ Verify `.env` is in `.gitignore`
4. ✅ Run `npm run dev` to test
5. ✅ Follow `QUICK_START.md` for testing

## Testing

After setting up `.env`:

```bash
npm run dev
```

If you see errors:
- Check database password is correct
- Verify keys are complete (not truncated)
- Check Project URL is correct


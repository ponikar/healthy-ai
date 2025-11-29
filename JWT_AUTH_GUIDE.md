# JWT Token Authentication Guide

## Overview

Supabase Auth **already uses JWT tokens** automatically. However, we've added explicit JWT utilities for:
- Getting tokens for API calls
- Validating tokens in API routes
- Using tokens in external services
- Testing token functionality

## How Supabase JWT Works

1. **Automatic Token Management**: When you login with Supabase, it automatically:
   - Creates JWT access tokens
   - Stores them in HTTP-only cookies
   - Refreshes them automatically
   - Validates them on each request

2. **Token Structure**: Supabase JWTs contain:
   - User ID
   - Email
   - Session metadata
   - Expiration time

## Using JWT Tokens

### Client-Side (React Components)

```typescript
import { getClientAccessToken, authenticatedFetch } from "~/lib/auth/client-jwt";

// Get current user's token
const token = await getClientAccessToken();

// Make authenticated API call
const response = await authenticatedFetch("/api/some-endpoint", {
  method: "POST",
  body: JSON.stringify({ data: "..." }),
});
```

### Server-Side (API Routes)

```typescript
import { extractTokenFromHeader, getUserFromToken } from "~/server/auth/jwt";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const token = extractTokenFromHeader(authHeader);
  
  if (!token) {
    return NextResponse.json({ error: "No token" }, { status: 401 });
  }
  
  const user = await getUserFromToken(token);
  if (!user) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
  
  // Use user data
  return NextResponse.json({ user });
}
```

### API Endpoints

#### Get Current Token
```bash
GET /api/auth/token
# Returns: { token, expires_at, user }
```

#### Verify Token
```bash
GET /api/auth/verify
Headers: Authorization: Bearer <token>
# Returns: { id, email, name, role, hospital_id }
```

## Testing JWT Tokens

1. **Login first**: Go to `/auth/login`
2. **Test tokens**: Go to `/test-jwt`
3. **Get token**: Click "Get My JWT Token"
4. **Verify token**: Click "Verify Token"

## Token Flow

```
1. User logs in → Supabase creates JWT
2. JWT stored in cookies (automatic)
3. Middleware validates JWT on each request
4. getCurrentUser() extracts user from JWT
5. API routes can use token from headers
```

## Security Notes

1. **Tokens are automatically refreshed** by Supabase
2. **Tokens expire** after 1 hour (default)
3. **HTTP-only cookies** prevent XSS attacks
4. **Tokens are validated** on every request via middleware

## When to Use Explicit JWT Functions

Use explicit JWT functions when:
- ✅ Making API calls to external services
- ✅ Building REST API endpoints
- ✅ Integrating with mobile apps
- ✅ Testing token functionality
- ✅ Creating API keys for services

**Don't need explicit functions for:**
- ❌ Regular web app usage (Supabase handles it)
- ❌ tRPC calls (automatic via context)
- ❌ Server Components (automatic via getCurrentUser)

## Example: External API Integration

```typescript
// Get token
const token = await getClientAccessToken();

// Call external API
const response = await fetch("https://external-api.com/data", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

## Example: Protected API Route

```typescript
// app/api/protected/route.ts
import { extractTokenFromHeader, getUserFromToken } from "~/server/auth/jwt";

export async function GET(request: NextRequest) {
  const token = extractTokenFromHeader(
    request.headers.get("Authorization")
  );
  
  const user = await getUserFromToken(token ?? "");
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  return NextResponse.json({ data: "Protected data", user });
}
```

## Testing Checklist

- [ ] Can login and get JWT token
- [ ] Token can be verified
- [ ] Token works in API routes
- [ ] Token expires correctly
- [ ] Token refresh works automatically
- [ ] Invalid tokens are rejected

## Troubleshooting

**"No token available"**
→ User must be logged in first
→ Check Supabase session is active

**"Invalid token"**
→ Token may have expired
→ Try logging in again

**"Token not found in header"**
→ Ensure Authorization header format: `Bearer <token>`
→ Check token extraction function


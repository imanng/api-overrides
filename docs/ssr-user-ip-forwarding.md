# Task: Support User IP Forwarding for SSR Customer Apps

Update `api-overrides` so overrides still match the real end-user IP when requests come from a customer app's SSR/server runtime.

## Problem

Today `api-overrides` determines the client IP from request headers like:

- `x-forwarded-for`
- `x-real-ip`
- `x-vercel-forwarded-for`

This works when the browser calls `api-overrides` directly.

When a customer Next.js app calls `api-overrides` during SSR, the request comes from the customer server. In that case, `api-overrides` sees the server/platform IP, not the browser user's IP, so per-user-IP override matching breaks.

## Desired Architecture

```txt
Browser user
  -> Customer Next.js SSR/proxy
     -> forwards real user IP to api-overrides
        -> api-overrides matches override by real user IP
```

The customer app will send:

```txt
x-override-client-ip: <real user ip>
x-override-proxy-secret: <shared secret>
```

`api-overrides` should trust `x-override-client-ip` only when the secret is valid.

## Required Changes In `api-overrides`

### 1. Update `lib/get-client-ip.ts`

Add support for trusted forwarded user IP.

Behavior:

1. If `OVERRIDE_PROXY_SECRET` is configured and request header `x-override-proxy-secret` matches it:
   - Prefer `x-override-client-ip`
   - Normalize it with existing `normalizeIP`
2. Otherwise fall back to existing behavior:
   - `x-forwarded-for`
   - `x-real-ip`
   - `x-vercel-forwarded-for`

Do not trust `x-override-client-ip` without the valid secret.

### 2. Strip Internal Headers Before Proxying

In proxy routes, remove internal headers before sending the request to the upstream/base API:

- `x-override-client-ip`
- `x-override-proxy-secret`

Relevant files:

- `app/api/proxy/[...path]/route.ts`
- `app/api/proxy/[key]/[...path]/route.ts`

This prevents leaking the shared secret or internal client IP header to customer/base APIs.

### 3. Consider Rejecting Override Creation Without IP

Currently override creation can store `ipAddress: null` if no client IP is detected, creating a global override. Update create/import behavior to reject missing client IP unless there is an intentional existing global override feature.

Relevant files:

- `app/api/overrides/route.ts`
- `app/api/overrides/import/route.ts`

Return `400` with:

```json
{ "error": "Unable to determine client IP address" }
```

### 4. Add Environment Documentation

Update `.env.example` and `README.md` with:

```env
OVERRIDE_PROXY_SECRET=""
```

Explain that customer SSR/proxy integrations should set this same secret and forward:

```txt
x-override-client-ip
x-override-proxy-secret
```

### 5. Keep Existing Direct Browser Behavior

Direct browser requests should continue working exactly as before via the normal forwarded IP headers.

## Verification

Run:

```bash
pnpm lint
pnpm build
```

Also manually check that:

- Valid secret plus `x-override-client-ip` uses the forwarded user IP.
- Invalid or missing secret ignores `x-override-client-ip`.
- Existing `x-forwarded-for` behavior still works.
- Internal override headers are not sent to upstream APIs.

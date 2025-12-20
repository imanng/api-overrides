# API Overrides

A Next.js application that allows you to configure API overrides to intercept and modify API responses. When a request matches an override, it returns the override data; otherwise, it proxies the request to your main API.

## Features

- **Web UI** for configuring overrides and main API settings
- **Proxy API** endpoint that other applications can request
- **Full request matching** (method, path, headers, body)
- **Override management** - Create, read, update, and delete overrides
- **Main API configuration** with authentication headers and timeout settings

## Prerequisites

- Node.js 18+
- pnpm (or npm/yarn)
- PostgreSQL database (Vercel Postgres recommended for Vercel deployments)

## Installation

### Step 1: Clone the repository

```bash
git clone <your-repo-url>
cd api-overrides
```

### Step 2: Install dependencies

```bash
pnpm install
```

### Step 3: Set up PostgreSQL database

The project uses Prisma with PostgreSQL. You can use:

- **Vercel Postgres** (recommended for Vercel deployments)
- **Any PostgreSQL database** (Supabase, Neon, Railway, etc.)

#### Option A: Vercel Postgres (Recommended)

1. Create a new project on [Vercel](https://vercel.com)
2. Go to your project → Storage → Create Database → Postgres
3. Copy the connection string

#### Option B: Other PostgreSQL providers

Create a PostgreSQL database with any provider and get the connection string.

#### Configure environment variables

Create a `.env` file in the root directory:

```bash
# PostgreSQL connection string
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# Base APIs configuration (format: name1:url1,name2:url2)
BASE_APIS="production:https://api.example.com,staging:https://staging-api.example.com"
```

#### Run migrations

```bash
# Generate Prisma client
pnpm db:generate

# Create and apply migrations
pnpm prisma migrate dev

# For production, apply migrations
pnpm db:migrate
```

### Step 4: Start the development server

```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Usage

### Configuration

Base APIs are configured via the `BASE_APIS` environment variable. The format is:

```
BASE_APIS=name1:url1,name2:url2
```

**Example:**

```bash
BASE_APIS="production:https://api.example.com,staging:https://staging-api.example.com"
```

Each API is specified as `name:url` where:

- `name` is a unique identifier/key for the API
- `url` is the base URL of the API

Multiple APIs are separated by commas. The first API in the list is used as the default.

### Web UI

1. **View Base APIs**:

   - Navigate to the "Configuration" tab
   - View your configured base APIs (read-only)
   - Base APIs are configured via the `BASE_APIS` environment variable

2. **Create Overrides**:

   - Go to the "Overrides" tab
   - Click "+ New Override"
   - Fill in the form:
     - **HTTP Method**: GET, POST, PUT, PATCH, or DELETE
     - **Path**: URL path to match (e.g., `/api/users/123`)
     - **Headers** (optional): JSON object of headers to match
     - **Request Body** (optional): JSON body to match
     - **Response Status Code**: HTTP status code to return
     - **Response Headers** (optional): JSON object of response headers
     - **Response Body**: The response data to return (JSON or text)
   - Click "Create"

3. **Edit/Delete Overrides**:
   - Click "Edit" on any override card to modify it
   - Click "Delete" to remove an override

### API Endpoint

Once configured, you can make requests to the proxy endpoint using the base API key:

```
/api/proxy/[base-api-key]/your/path/here
```

**Example:**

```bash
# GET request (using base API key "production-api")
curl http://localhost:3000/api/proxy/production-api/api/users/123

# POST request with body (using base API key "staging-api")
curl -X POST http://localhost:3000/api/proxy/staging-api/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John"}'
```

The proxy will:

1. Find the base API by the key in the URL path
2. Check for a matching override (method, path, headers, body)
3. If match found: return the override response
4. If no match: proxy the request to the specified base API

**Note:** The base API key must match a configured base API. If the key doesn't exist, you'll receive a 404 error.

## Use Cases

### 1. Mobile App Development

API Overrides is perfect for mobile app development where you need to test different API responses without modifying your backend or app code.

**Setup:**

1. Configure your production API as a base API:

   ```bash
   BASE_APIS="production:https://api.example.com"
   ```

2. Deploy API Overrides to a public URL (e.g., `https://api-overrides.vercel.app`)

3. Update your mobile app's API base URL to point to the proxy:

   ```swift
   // iOS (Swift)
   let baseURL = "https://api-overrides.vercel.app/api/proxy/production"
   ```

   ```kotlin
   // Android (Kotlin)
   val baseURL = "https://api-overrides.vercel.app/api/proxy/production"
   ```

**Benefits:**

- Test error scenarios (404, 500, etc.) without backend changes
- Simulate slow responses by creating overrides with delayed responses
- Test edge cases with custom response data
- Share override configurations with your team
- Switch between production and staging APIs easily

**Example:**

Create an override for `/api/users/123` that returns a 404 error to test your app's error handling:

- **Method**: GET
- **Path**: `/api/users/123`
- **Response Status**: 404
- **Response Body**: `{"error": "User not found"}`

### 2. Web App Development

API Overrides works seamlessly with web applications, supporting both server-side requests and client-side requests from any SPA framework.

#### 1. Server Requests

Use API Overrides in server-side code, such as Next.js Server Components, API Routes, Server Actions, or any server-side rendering framework:

```typescript
// app/api/users/[id]/route.ts
const API_OVERRIDES_URL = "https://api-overrides.vercel.app";
const API_TOKEN = "your-api-token";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const proxyUrl = `${API_OVERRIDES_URL}/api/proxy/production/api/users/${params.id}`;

  const response = await fetch(proxyUrl, {
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
    },
  });

  return response;
}
```

```typescript
// app/users/[id]/page.tsx (Server Component)
const API_OVERRIDES_URL = "https://api-overrides.vercel.app";
const API_TOKEN = "your-api-token";

async function getUser(id: string) {
  const proxyUrl = `${API_OVERRIDES_URL}/api/proxy/production/api/users/${id}`;

  const res = await fetch(proxyUrl, {
    headers: {
      Authorization: `Bearer ${API_TOKEN}`,
    },
    cache: "no-store", // or use revalidate for ISR
  });

  return res.json();
}

export default async function UserPage({ params }: { params: { id: string } }) {
  const user = await getUser(params.id);
  return <div>{user.name}</div>;
}
```

```typescript
// app/actions.ts (Server Actions)
"use server";

const API_OVERRIDES_URL = "https://api-overrides.vercel.app";
const API_TOKEN = "your-api-token";

export async function createUser(formData: FormData) {
  const proxyUrl = `${API_OVERRIDES_URL}/api/proxy/production/api/users`;

  const response = await fetch(proxyUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_TOKEN}`,
    },
    body: JSON.stringify({
      name: formData.get("name"),
      email: formData.get("email"),
    }),
  });

  return response.json();
}
```

#### 2. Client Requests

Use API Overrides in client-side code from any SPA framework (React, Vue, Angular, Svelte, etc.) or Next.js Client Components:

**Next.js Client Components:**

```typescript
// app/components/UserProfile.tsx (Client Component)
"use client";

import { useEffect, useState } from "react";

const API_OVERRIDES_URL = "https://api-overrides.vercel.app";
const API_TOKEN = "your-api-token";

export default function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const proxyUrl = `${API_OVERRIDES_URL}/api/proxy/production/api/users/${userId}`;

      const response = await fetch(proxyUrl, {
        headers: {
          Authorization: `Bearer ${API_TOKEN}`,
        },
      });

      const data = await response.json();
      setUser(data);
    };

    fetchUser();
  }, [userId]);

  return <div>{user?.name}</div>;
}
```

**React (with Fetch API):**

```typescript
// lib/api-client.ts (Reusable client)
const API_OVERRIDES_URL = "https://api-overrides.vercel.app";

export async function fetchFromProxy(path: string, options?: RequestInit) {
  const proxyUrl = `${API_OVERRIDES_URL}/api/proxy/production${path}`;

  return fetch(proxyUrl, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });
}

// Usage in components
const response = await fetchFromProxy("/api/users/123");
const user = await response.json();
```

**React (with Axios):**

```typescript
import axios from "axios";

const API_OVERRIDES_URL = "https://api-overrides.vercel.app";
const API_TOKEN = "your-api-token";

const apiClient = axios.create({
  baseURL: `${API_OVERRIDES_URL}/api/proxy/production`,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${API_TOKEN}`,
  },
});

// Usage
const response = await apiClient.get("/api/users/123");
```

**Vue:**

```typescript
const API_OVERRIDES_URL = "https://api-overrides.vercel.app";
const API_TOKEN = "your-api-token";

export async function fetchUser(userId: string) {
  const response = await fetch(
    `${API_OVERRIDES_URL}/api/proxy/production/api/users/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${API_TOKEN}`,
      },
    }
  );

  return response.json();
}
```

**Angular:**

```typescript
import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ApiService {
  // Use environment.ts for configuration
  private baseUrl = "https://api-overrides.vercel.app/api/proxy/production";

  constructor(private http: HttpClient) {}

  getUser(id: string) {
    return this.http.get(`${this.baseUrl}/api/users/${id}`);
  }
}
```

**Benefits:**

- Test API responses during development without backend changes
- Simulate different API states (loading, error, success)
- Share override configurations across team members
- Test both SSR and client-side rendering scenarios
- Use the same proxy URL for both server and client requests
- Works with any HTTP client library (fetch, axios, etc.)

## API Routes

### Override Management

- `GET /api/overrides` - List all overrides
- `POST /api/overrides` - Create a new override
- `GET /api/overrides/[id]` - Get a specific override
- `PUT /api/overrides/[id]` - Update an override
- `DELETE /api/overrides/[id]` - Delete an override
- `GET /api/overrides/export` - Export all overrides as JSON
- `POST /api/overrides/import` - Import overrides from JSON

### Configuration

- `GET /api/config` - Get API configuration (read-only, for backward compatibility)
- `GET /api/base-apis` - List all base APIs (read-only, from BASE_APIS environment variable)
- `GET /api/base-apis/[id]` - Get a specific base API (read-only)
- `GET /api/base-apis/export` - Export base APIs as JSON

**Note:** Base APIs are configured via the `BASE_APIS` environment variable. The API endpoints are read-only and cannot be used to modify configurations.

### Proxy

- `GET /api/proxy/[key]/[...path]` - Proxy endpoint with base API key (handles all HTTP methods)
- `GET /api/proxy/[...path]` - Legacy proxy endpoint (uses default routing, handles all HTTP methods)

## Override Matching

Overrides are matched based on:

1. **HTTP Method** - Must match exactly (case-insensitive)
2. **Path** - Must match exactly (normalized, trailing slashes removed)
3. **Headers** (optional) - If specified in override, request must include all matching headers
4. **Request Body** (optional) - If specified in override, request body must match exactly (deep equality)

The first matching override is returned. If no override matches, the request is proxied to the main API.

## Database Schema

The application uses the following models:

- **Override**: Stores override rules and responses
- **ApiConfig**: Legacy model (deprecated, kept for backward compatibility)
- **BaseApi**: Legacy model (deprecated, base APIs now configured via `BASE_APIS` environment variable)

You can view and edit the schema in `prisma/schema.prisma`.

**Note:** Base APIs are now configured via the `BASE_APIS` environment variable instead of the database. The `BaseApi` and `ApiConfig` models are kept for backward compatibility but are no longer actively used for configuration.

## Development

### Database Management

```bash
# View database in Prisma Studio
pnpm prisma studio

# Create a new migration
pnpm prisma migrate dev --name migration_name

# Apply migrations to production
pnpm db:migrate

# Generate Prisma client
pnpm db:generate
```

### Project Structure

```
api-overrides/
├── app/
│   ├── api/
│   │   ├── config/          # API configuration endpoints
│   │   ├── overrides/        # Override CRUD endpoints
│   │   └── proxy/            # Proxy endpoint
│   ├── components/           # React components
│   ├── page.tsx              # Main UI page
│   └── layout.tsx            # Root layout
├── lib/
│   ├── prisma.ts             # Prisma client
│   ├── matching.ts           # Request matching logic
│   └── proxy.ts              # Proxy utility
├── types/                    # TypeScript type definitions
├── prisma/
│   └── schema.prisma         # Database schema
└── README.md
```

## Deploying to Vercel

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Create Vercel Project

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (default)
   - **Build Command**: `pnpm build` (or `npm run build`)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `pnpm install` (or `npm install`)

### Step 3: Set up Vercel Postgres

1. In your Vercel project dashboard, go to **Storage**
2. Click **Create Database** → **Postgres**
3. Choose a name and region
4. The connection string will be automatically added as an environment variable

### Step 4: Configure Environment Variables

In your Vercel project settings → **Environment Variables**, add:

- `DATABASE_URL`: Your PostgreSQL connection string
  - **If using Vercel Postgres**: The connection string is automatically provided
  - **If using another PostgreSQL provider**: Use your PostgreSQL connection string

### Step 5: Run Database Migrations

After deployment, run migrations on your production database:

```bash
# Using Vercel CLI
npx vercel env pull .env.production
pnpm prisma migrate deploy

# Or using direct connection
DATABASE_URL="your-production-url" pnpm prisma migrate deploy
```

Alternatively, you can run migrations automatically during build by adding a build script.

### Step 6: Deploy

Vercel will automatically deploy on every push to your main branch. You can also trigger manual deployments from the dashboard.

### Local Production Build

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## Troubleshooting

### Prisma Client Import Error

If you see a TypeScript error about `PrismaClient` not being exported:

1. Run `pnpm db:generate` to regenerate the client
2. Restart your TypeScript server/IDE

### Database Connection Error

If you get a database connection error:

- Verify your `DATABASE_URL` environment variable is set correctly
- Check that your PostgreSQL database is running and accessible
- For Vercel deployments, ensure `DATABASE_URL` points to your database
- Verify network access if using a hosted database (check IP whitelist if applicable)

### Proxy Not Working

- Verify the base API URL is configured correctly in `BASE_APIS` environment variable
- Check that the base URL is accessible from your server
- Ensure the base API key in the proxy URL matches a configured base API
- Review network connectivity and firewall settings

## License

MIT

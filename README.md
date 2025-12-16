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
- SQLite (included with Node.js)

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

### Step 3: Set up the database

The project uses Prisma with SQLite. The database will be automatically created when you run migrations.

```bash
# Generate Prisma client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev
```

This will create a `dev.db` SQLite database file in your project root.

### Step 4: Configure environment variables

Create a `.env` file in the root directory (if it doesn't exist):

```bash
# Database URL for Prisma
DATABASE_URL="file:./dev.db"
```

The `.env` file should already exist from the Prisma setup. If not, create it with the DATABASE_URL above.

### Step 5: Start the development server

```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000)

## Usage

### Web UI

1. **Configure Main API**:

   - Navigate to the "Configuration" tab
   - Enter your main API base URL (e.g., `https://api.example.com`)
   - Optionally add authentication headers (JSON format)
   - Set request timeout (default: 30000ms)
   - Click "Save Configuration"

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

Once configured, you can make requests to the proxy endpoint:

```
/api/proxy/your/path/here
```

**Example:**

```bash
# GET request
curl http://localhost:3000/api/proxy/api/users/123

# POST request with body
curl -X POST http://localhost:3000/api/proxy/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "John"}'
```

The proxy will:

1. Check for a matching override (method, path, headers, body)
2. If match found: return the override response
3. If no match: proxy the request to your main API (configured in the UI)

## API Routes

### Override Management

- `GET /api/overrides` - List all overrides
- `POST /api/overrides` - Create a new override
- `GET /api/overrides/[id]` - Get a specific override
- `PUT /api/overrides/[id]` - Update an override
- `DELETE /api/overrides/[id]` - Delete an override

### Configuration

- `GET /api/config` - Get main API configuration
- `PUT /api/config` - Update main API configuration

### Proxy

- `GET /api/proxy/[...path]` - Proxy endpoint (handles all HTTP methods)

## Override Matching

Overrides are matched based on:

1. **HTTP Method** - Must match exactly (case-insensitive)
2. **Path** - Must match exactly (normalized, trailing slashes removed)
3. **Headers** (optional) - If specified in override, request must include all matching headers
4. **Request Body** (optional) - If specified in override, request body must match exactly (deep equality)

The first matching override is returned. If no override matches, the request is proxied to the main API.

## Database Schema

The application uses two main models:

- **Override**: Stores override rules and responses
- **ApiConfig**: Stores main API configuration

You can view and edit the schema in `prisma/schema.prisma`.

## Development

### Database Management

```bash
# View database in Prisma Studio
pnpm prisma studio

# Create a new migration
pnpm prisma migrate dev --name migration_name

# Reset database (WARNING: deletes all data)
pnpm prisma migrate reset
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

## Building for Production

```bash
# Build the application
pnpm build

# Start production server
pnpm start
```

## Troubleshooting

### Prisma Client Import Error

If you see a TypeScript error about `PrismaClient` not being exported:

1. Run `pnpm prisma generate` to regenerate the client
2. Restart your TypeScript server/IDE

### Database Locked Error

If you get a "database is locked" error:

- Make sure no other process is using the database
- Close Prisma Studio if it's open
- Restart the development server

### Proxy Not Working

- Verify the main API base URL is configured correctly
- Check that the base URL is accessible from your server
- Review the timeout settings if requests are timing out

## License

MIT

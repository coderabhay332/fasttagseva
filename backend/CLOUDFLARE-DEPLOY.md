# Cloudflare Workers Deployment Guide

## Quick Start

### 1. Install Dependencies
```powershell
npm install
```

### 2. Login to Cloudflare
```powershell
npx wrangler login
```

### 3. Set Secrets (Required)
```powershell
# Set your environment variables as secrets
wrangler secret put MONGODB_URI
wrangler secret put JWT_ACCESS_SECRET          # Generate: openssl rand -base64 32
wrangler secret put JWT_REFRESH_SECRET         # Generate: openssl rand -base64 32
wrangler secret put JWT_RESET_PASSWORD_SECRET  # Generate: openssl rand -base64 32
wrangler secret put RAZORPAY_KEY_ID
wrangler secret put RAZORPAY_KEY_SECRET
wrangler secret put RAZORPAY_WEBHOOK_SECRET
wrangler secret put EMAIL_USER
wrangler secret put EMAIL_PASS                 # Use Resend API key or app password
wrangler secret put FRONTEND_BASE_URL
wrangler secret put BASE_URL
```

### 4. Deploy
```powershell
# Quick deploy
npx wrangler deploy

# Or use the script
.\deploy-cf.ps1
```

### 5. Local Development
```powershell
npx wrangler dev
```

---

## Architecture

### What's Included
- ✅ **Hono** - Fast, lightweight web framework
- ✅ **JWT Auth** - Using Web Crypto API (jose library)
- ✅ **Password Hashing** - PBKDF2 via Web Crypto
- ✅ **Razorpay Payments** - REST API integration
- ✅ **Webhook Verification** - HMAC-SHA256
- ✅ **Zod Validation** - Request validation

### Current Limitations
- ⚠️ **In-Memory Storage** - Data resets on each deploy
- ⚠️ **No File Uploads** - R2 integration needed
- ⚠️ **Email** - Uses Resend/SendGrid API

---

## Adding D1 Database (Optional)

For persistent storage, add Cloudflare D1:

```powershell
# Create D1 database
wrangler d1 create fasttag-db

# Get the database_id from output and add to wrangler.toml

# Create tables
wrangler d1 execute fasttag-db --command "CREATE TABLE users (id TEXT PRIMARY KEY, email TEXT UNIQUE, password TEXT, name TEXT, phone TEXT, role TEXT, active INTEGER, refresh_token TEXT, created_at TEXT, updated_at TEXT);"

wrangler d1 execute fasttag-db --command "CREATE TABLE applications (id TEXT PRIMARY KEY, user_id TEXT, vehicle TEXT, chasis_number TEXT, status TEXT, created_at TEXT, updated_at TEXT, FOREIGN KEY (user_id) REFERENCES users(id));"

# Add binding to wrangler.toml (already there, just update database_id)
```

---

## Adding R2 File Storage (Optional)

```powershell
# Create R2 bucket
wrangler r2 bucket create fasttag-uploads

# Update wrangler.toml with your bucket_name
```

---

## Testing the API

```bash
# Health check
curl https://your-worker.your-subdomain.workers.dev/

# Register
curl -X POST https://your-worker.your-subdomain.workers.dev/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","name":"Test","phone":"1234567890"}'

# Login
curl -X POST https://your-worker.your-subdomain.workers.dev/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

---

## Cost

- **Free Tier**: 100,000 requests/day
- **Paid**: $5/month for 10M requests
- **D1**: 5M rows read/day free
- **R2**: 10GB storage free

---

## Troubleshooting

### Build Errors
```powershell
# Update workers types
npx wrangler types
```

### Deploy Failures
Check `wrangler.toml` configuration and ensure all secrets are set.

### CORS Issues
Update allowed origins in `src/worker.ts`.

---

## Next Steps

1. **Replace in-memory storage** with D1 or MongoDB Data API
2. **Add R2** for file uploads
3. **Set up custom domain** (optional)
4. **Add rate limiting** with Cloudflare Rate Limiting

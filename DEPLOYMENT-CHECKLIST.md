# FastTag Deployment Checklist

## Backend (Cloudflare Workers)

### Step 1: Install Dependencies
```powershell
cd d:\project\fast-tag\backend
npm install
```

### Step 2: Setup MongoDB Data API
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click "Data API" in left sidebar
3. Click "Create Data API"
4. Select your cluster (Cluster0)
5. Copy the Data API URL and API Key

### Step 3: Set Cloudflare Secrets
```powershell
# Login to Cloudflare
npx wrangler login

# Set all required secrets
npx wrangler secret put MONGODB_DATA_API_URL
# Enter: https://data.mongodb-api.com/app/YOUR_APP_ID/endpoint/data/v1

npx wrangler secret put MONGODB_DATA_API_KEY
# Enter: Your API key from Atlas

npx wrangler secret put MONGODB_DATA_SOURCE
# Enter: Cluster0

npx wrangler secret put MONGODB_DATABASE
# Enter: fasttag (or your DB name)

npx wrangler secret put JWT_ACCESS_SECRET
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

npx wrangler secret put JWT_REFRESH_SECRET
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

npx wrangler secret put JWT_RESET_PASSWORD_SECRET
# Generate: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

npx wrangler secret put RAZORPAY_KEY_ID
# Enter: Your Razorpay test/live key ID

npx wrangler secret put RAZORPAY_KEY_SECRET
# Enter: Your Razorpay test/live key secret

npx wrangler secret put RAZORPAY_WEBHOOK_SECRET
# Enter: Your Razorpay webhook secret

npx wrangler secret put EMAIL_USER
# Enter: your-email@gmail.com (or noreply@yourdomain.com)

npx wrangler secret put EMAIL_PASS
# Enter: Your Gmail app password or Resend API key

npx wrangler secret put FRONTEND_BASE_URL
# Enter: https://your-frontend-domain.vercel.app

npx wrangler secret put BASE_URL
# Enter: https://your-worker.your-subdomain.workers.dev
```

### Step 4: Create R2 Bucket
```powershell
npx wrangler r2 bucket create fasttag-uploads
```

### Step 5: Deploy Backend
```powershell
npx wrangler deploy
```

Copy the deployed URL (e.g., `https://fasttag-backend.your-subdomain.workers.dev`)

---

## Frontend (Vercel/Local)

### Step 1: Create Environment File
Create `d:\project\fast-tag\frontend\my-app\.env`:

```
VITE_API_URL=https://your-worker.your-subdomain.workers.dev/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### Step 2: Install Dependencies
```powershell
cd d:\project\fast-tag\frontend\my-app
npm install
```

### Step 3: Test Locally
```powershell
npm run dev
```

### Step 4: Deploy to Vercel
```powershell
vercel --prod
```

Or push to GitHub and connect to Vercel dashboard.

---

## Post-Deployment Verification

### Test API Endpoints
```bash
# Health check
curl https://your-worker.your-subdomain.workers.dev/

# Register user
curl -X POST https://your-worker.your-subdomain.workers.dev/api/users/create \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123","name":"Test","phone":"1234567890"}'

# Login
curl -X POST https://your-worker.your-subdomain.workers.dev/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
```

### Configure Razorpay Webhook
1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-worker.your-subdomain.workers.dev/api/payments/webhook`
3. Select events: `payment.captured`, `payment.failed`
4. Set secret: Same as `RAZORPAY_WEBHOOK_SECRET`

---

## Troubleshooting

### CORS Errors
Update `wrangler.toml` with your frontend domain in the CORS origins.

### MongoDB Connection Errors
- Verify Data API URL and API key
- Check if IP is whitelisted in Atlas

### File Upload Errors
- Verify R2 bucket is created: `npx wrangler r2 bucket list`
- Check bucket permissions

### JWT Errors
- Ensure secrets are set: `npx wrangler secret list`
- Check token expiration times

---

## Costs

| Service | Free Tier | Paid |
|---------|-----------|------|
| Cloudflare Workers | 100k requests/day | $5/month |
| MongoDB Atlas | 512MB storage | $9/month |
| R2 Storage | 10GB | $0.015/GB |
| Vercel | 100GB bandwidth | $20/month |

**Total Estimated Cost:** $0-15/month

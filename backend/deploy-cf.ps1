# Cloudflare Workers Deployment Script

Write-Host "Cloudflare Workers Deployment" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green

# Check if wrangler is installed
if (!(Get-Command wrangler -ErrorAction SilentlyContinue)) {
    Write-Host "Installing Wrangler CLI..." -ForegroundColor Yellow
    npm install -g wrangler
}

# Install dependencies
Write-Host "`nInstalling dependencies..." -ForegroundColor Cyan
npm install

# Check if logged in
Write-Host "`nChecking Cloudflare login status..." -ForegroundColor Cyan
wrangler whoami 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Please login to Cloudflare first:" -ForegroundColor Yellow
    wrangler login
}

# Set secrets
Write-Host "`nSetting up secrets..." -ForegroundColor Cyan
Write-Host "You'll need to set these secrets manually:" -ForegroundColor Yellow
Write-Host "  wrangler secret put MONGODB_URI" -ForegroundColor Cyan
Write-Host "  wrangler secret put JWT_ACCESS_SECRET" -ForegroundColor Cyan
Write-Host "  wrangler secret put JWT_REFRESH_SECRET" -ForegroundColor Cyan
Write-Host "  wrangler secret put RAZORPAY_KEY_ID" -ForegroundColor Cyan
Write-Host "  wrangler secret put RAZORPAY_KEY_SECRET" -ForegroundColor Cyan
Write-Host "  wrangler secret put RAZORPAY_WEBHOOK_SECRET" -ForegroundColor Cyan
Write-Host "  wrangler secret put EMAIL_USER" -ForegroundColor Cyan
Write-Host "  wrangler secret put EMAIL_PASS" -ForegroundColor Cyan
Write-Host "  wrangler secret put FRONTEND_BASE_URL" -ForegroundColor Cyan

# Deploy
Write-Host "`nDeploying to Cloudflare Workers..." -ForegroundColor Cyan
wrangler deploy

Write-Host "`nDeployment complete!" -ForegroundColor Green
Write-Host "Your API is now live at the URL shown above" -ForegroundColor Cyan
Write-Host "`nNote: This is using in-memory storage. For production, set up D1 database." -ForegroundColor Yellow

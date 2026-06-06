# DNS Setup Guide for www.taypro.in

## Overview
For the www to non-www redirect to work, you need DNS records that point `www.taypro.in` to your server.

## Current Setup
- **Primary domain**: `taypro.in` (should already have DNS records)
- **Redirect**: `www.taypro.in` → `taypro.in` (handled by middleware)
- **DNS required**: `www.taypro.in` must resolve to your server

## DNS Records Required

### Option 1: CNAME Record (Recommended)
```
Type: CNAME
Name: www
Value: taypro.in
TTL: 3600 (or your provider's default)
```

**Why CNAME is better:**
- Automatically updates if taypro.in IP changes
- Easier to manage
- Single point of configuration

### Option 2: A Record
```
Type: A
Name: www
Value: <your-server-ip-address>
TTL: 3600 (or your provider's default)
```

**When to use A record:**
- If your hosting provider doesn't allow CNAME at root
- If you want direct IP mapping

## How to Add DNS Records

### Step 1: Access Your DNS Provider
Common providers:
- GoDaddy
- Namecheap
- Cloudflare
- AWS Route 53
- Google Domains
- Your domain registrar

### Step 2: Find DNS Management
Look for:
- "DNS Management"
- "DNS Settings"
- "Name Servers"
- "Zone Editor"

### Step 3: Add www Record

#### For CNAME:
1. Click "Add Record" or "+"
2. Select **Type**: CNAME
3. Enter **Name/Host**: `www`
4. Enter **Value/Points to**: `taypro.in` (or your root domain)
5. Set **TTL**: 3600 (1 hour) or default
6. Save

#### For A Record:
1. Click "Add Record" or "+"
2. Select **Type**: A
3. Enter **Name/Host**: `www`
4. Enter **Value/Points to**: Your server IP (same as taypro.in)
5. Set **TTL**: 3600 (1 hour) or default
6. Save

## Verify DNS Propagation

After adding the record, verify it works:

### Method 1: Online Tools
- https://www.whatsmydns.net/#CNAME/www.taypro.in
- https://dnschecker.org/#CNAME/www.taypro.in
- Enter `www.taypro.in` and check if it resolves

### Method 2: Command Line
```bash
# Check CNAME
dig www.taypro.in CNAME

# Check A record
dig www.taypro.in A

# Quick check
nslookup www.taypro.in
```

### Expected Result
- `www.taypro.in` should resolve to the same IP as `taypro.in`
- Or show CNAME pointing to `taypro.in`

## Testing the Redirect

Once DNS propagates (usually 5 minutes to 48 hours):

1. Visit: `http://www.taypro.in`
2. Should redirect to: `https://taypro.in`
3. Check browser console for 301 status code

### Test Commands
```bash
# Test redirect
curl -I http://www.taypro.in

# Should see:
# HTTP/1.1 301 Moved Permanently
# Location: https://taypro.in
```

## Current Status

Your middleware (`src/middleware.ts`) is configured to:
- Detect requests to `www.taypro.in`
- Redirect to `taypro.in` with 301 (permanent redirect)
- Preserve path and query parameters

## Troubleshooting

### Issue: www doesn't resolve
**Solution**: Add the DNS record as described above

### Issue: DNS propagates but redirect doesn't work
**Check**:
1. Middleware is deployed (`src/middleware.ts`)
2. Middleware config includes all routes
3. Server is running Next.js (not just static files)

### Issue: SSL Certificate error for www
**Solution**: 
- Add `www.taypro.in` to your SSL certificate
- Most providers (Let's Encrypt, Cloudflare) support wildcards or multiple domains

## Recommended Configuration

**Best Practice:**
1. Use **CNAME** for www → taypro.in
2. Ensure SSL certificate covers both domains
3. Let middleware handle redirect (already configured)

**Cloudflare Users:**
- Enable "Automatic HTTPS Rewrites"
- Use CNAME or "CNAME flattening"
- SSL/TLS mode: Full or Full (strict)

**AWS Route 53 Users:**
- Use CNAME alias record
- Can also use A record alias if preferred

## Summary

✅ **Required**: Add `www` DNS record (CNAME or A)  
✅ **Already Done**: Middleware redirect configured  
✅ **After DNS**: Redirect will work automatically  

**Time to propagate**: Usually 5 minutes - 2 hours, can take up to 48 hours globally.


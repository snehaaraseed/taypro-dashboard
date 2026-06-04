# Google Search Console — OAuth setup (recommended)

Use your **personal Google account** that already owns `taypro.in` in Search Console.  
No service-account “Add user” step required.

Admin UI: **https://taypro.in/admin/gsc** (or `http://localhost:3000/admin/gsc` locally)

---

## 1. Google Cloud (same project as before is fine)

1. [Google Cloud Console](https://console.cloud.google.com/) → project **tayprogsc** (or new)
2. **APIs & Services → Library** → enable **Google Search Console API**
3. **APIs & Services → OAuth consent screen**
   - User type: **External** (or Internal if Workspace)
   - App name: `Taypro CMS`
   - Add your Gmail as **Test user** while app is in “Testing”
   - Scopes: add `https://www.googleapis.com/auth/webmasters.readonly`
4. **APIs & Services → Credentials → Create credentials → OAuth client ID**
   - Application type: **Web application**
   - **Authorized redirect URIs** — add **both**:
     - `http://localhost:3000/api/admin/gsc/oauth/callback`
     - `https://taypro.in/api/admin/gsc/oauth/callback`
5. Copy **Client ID** and **Client secret**

---

## 2. Environment variables

### Local (`.env.local`)

```bash
GSC_SITE_URL=sc-domain:taypro.in
GSC_OAUTH_CLIENT_ID=xxxx.apps.googleusercontent.com
GSC_OAUTH_CLIENT_SECRET=xxxx
GSC_OAUTH_REDIRECT_URI=http://localhost:3000/api/admin/gsc/oauth/callback
```

Restart `npm run dev`.

### Production (`.env.production` on server)

```bash
GSC_SITE_URL=sc-domain:taypro.in
GSC_OAUTH_CLIENT_ID=xxxx.apps.googleusercontent.com
GSC_OAUTH_CLIENT_SECRET=xxxx
GSC_OAUTH_REDIRECT_URI=https://taypro.in/api/admin/gsc/oauth/callback
```

Then `pm2 restart taypro-dashboard --update-env`.

Tokens are stored in `data/gsc-oauth-tokens.json` on the server (not in git).

---

## 3. Connect in admin

1. Log in to `/admin` (stay logged in; use the same browser tab for Connect)
2. Open **Search Console** in the nav (or `/admin/gsc`)
3. Click **Connect with Google**
4. Sign in with the Google account that has access to **taypro.in** in GSC
5. Approve read-only Search Console access
6. Click **Sync now** to fill `data/seo-gsc-boost.json`

Weekly cron (`scripts/cron-sync-gsc-boost.sh`) uses the stored refresh token automatically.

---

## Auth priority

| Method | When used |
|--------|-----------|
| **OAuth** | If connected via `/admin/gsc` |
| **Service account** | Fallback only if OAuth not connected and JSON key exists |

---

## Troubleshooting

| Issue | Fix |
|--------|-----|
| `oauth_not_configured` | Set `GSC_OAUTH_CLIENT_ID` and `SECRET` in env |
| `redirect_uri_mismatch` | Redirect URI in Google must match **exactly** what `/admin/gsc` shows |
| `{"error":"Unauthorized"}` on callback | Log in at `/admin` first, then Connect again; re-login if cookie expired |
| `access_denied` | Add your Gmail under OAuth consent screen → Test users |
| 403 on sync | Use the Google account that owns the `sc-domain:taypro.in` property |
| No refresh token | Disconnect in admin, connect again (consent uses `prompt=consent`) |

Service account setup remains optional: [GSC_API_CLOSED_LOOP.md](./GSC_API_CLOSED_LOOP.md)

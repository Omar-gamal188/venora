# Deployment Guide — Venora E-commerce

The backend (`server/`) is production-ready: security hardening, structured logging,
health probes, graceful shutdown, Docker, PM2 and Nginx configs are all included.
The frontend (`my-app/`) is a static Vite build served by Nginx (or any static host).

## 1. Required environment

Copy `server/.env.example` to `server/.env` and fill it in. **The server refuses to
start in production without real secrets.** Generate them:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Minimum production variables:

| Variable | Purpose |
|---|---|
| `NODE_ENV=production` | Enables strict mode (secure cookies, no stack traces, HSTS) |
| `MONGODB_URI` | Atlas or self-hosted MongoDB connection string |
| `JWT_SECRET`, `JWT_REFRESH_SECRET`, `COOKIE_SECRET` | 3 distinct 32+ char secrets |
| `CLIENT_URL` | Public frontend URL (CORS + password-reset links) |
| `ALLOWED_ORIGINS` | Any extra origins, comma-separated |
| `TRUST_PROXY=true` | When behind Nginx / a load balancer |

Frontend: set `VITE_API_URL` in `my-app/.env.production` to your API origin
(e.g. `https://example.com` when Nginx proxies `/api` on the same domain — same-origin
is the recommended setup), then `npm run build`.

## 2. First deploy: create the admin & indexes

```bash
cd server
# create/reset the dashboard admin with a STRONG password (no defaults anymore)
DASHBOARD_ADMIN_PASSWORD='<strong password>' npm run admin:reset
# or promote an existing account:
npm run admin:promote -- someusername
```

Indexes: set `MONGO_AUTO_INDEX=true` for the **first** production boot so Mongoose
builds the unique/TTL/text indexes, then turn it off.

> Migration note: existing users keep working — legacy bcrypt password hashes are
> verified and transparently re-hashed to Argon2id on each user's next login.

## 3. Option A — Docker Compose (Render/Railway/DigitalOcean/VPS)

```bash
# repo root — create .env next to docker-compose.yml with:
#   MONGO_ROOT_USER, MONGO_ROOT_PASSWORD, JWT_SECRET, JWT_REFRESH_SECRET,
#   COOKIE_SECRET, CLIENT_URL
docker compose up -d --build
curl http://localhost:5000/health/ready
```

MongoDB is **not** exposed to the host; only the API is (port 5000).

## 4. Option B — Ubuntu VPS / AWS EC2 with PM2 + Nginx

```bash
# Node 20+ and MongoDB (or use Atlas)
cd server && npm ci --omit=dev
pm2 start ecosystem.config.cjs        # cluster mode, one worker per CPU
pm2 save && pm2 startup               # survive reboots

# Frontend
cd ../my-app && npm ci && npm run build
sudo mkdir -p /var/www/venora && sudo cp -r dist /var/www/venora/

# Nginx + SSL
sudo cp ../deploy/nginx.conf /etc/nginx/sites-available/venora   # edit domain first
sudo ln -s /etc/nginx/sites-available/venora /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d example.com -d www.example.com
```

## 5. Health & monitoring

| Endpoint | Use |
|---|---|
| `GET /health` | Legacy simple check (`{"ok":true}`) |
| `GET /health/live` | Liveness probe (process up) |
| `GET /health/ready` | Readiness probe (MongoDB reachable → 200, else 503) |

Logs: `server/logs/app.log` (all), `server/logs/error.log` (errors), plus stdout
(JSON) for Docker/PM2 collection. Security events are also persisted to the
`auditlogs` collection (90-day TTL).

## 6. Operational notes

- **Graceful shutdown**: SIGTERM/SIGINT stops accepting connections, drains
  in-flight requests (15s budget), closes MongoDB, then exits — zero-downtime
  deploys with PM2 `reload` or rolling containers.
- **Account lockout**: 5 failed logins → 15 min lock (configurable).
- **Rate limits**: 300 req/15 min per IP globally; 20/15 min on credential
  endpoints with progressive slow-down.
- **Sessions**: refresh tokens are rotated on use, hashed at rest, revocable
  per-device (`POST /api/auth/logout`) or globally (`POST /api/auth/logout-all`);
  reuse of a rotated token revokes the whole device family.
- **Never commit** `server/.env`; rotate any secret that has ever been committed.

# Production Deployment Checklist

## Pre-Deployment

### 1. Environment Configuration
- [ ] Create production `.env` file from `.env.example`
- [ ] Set strong, unique values for all secrets:
  - [ ] `JWT_SECRET` (64+ random characters)
  - [ ] `REFRESH_TOKEN_SECRET` (64+ random characters)  
  - [ ] `POSTGRES_PASSWORD` (strong password)
  - [ ] `SESSION_SECRET` (random string)
  - [ ] `REDIS_PASSWORD` (if using Redis auth)
- [ ] Update `CLIENT_URL` to your production domain
- [ ] Configure email settings for production SMTP
- [ ] Set `NODE_ENV=production`
- [ ] Disable Swagger in production (`SWAGGER_ENABLED=false`)

### 2. SSL/TLS Setup
- [ ] Obtain SSL certificate (Let's Encrypt recommended)
- [ ] Place certificates in `nginx/ssl/` directory:
  - [ ] `fullchain.pem`
  - [ ] `privkey.pem`
- [ ] Update domain names in `nginx/nginx.conf`

### 3. Database
- [ ] Create database migrations:
  ```bash
  cd server
  npx sequelize-cli migration:generate --name initial-schema
  ```
- [ ] Review and edit migration files
- [ ] Test migrations in staging environment
- [ ] Set up automated backup schedule
- [ ] Test backup and restore procedures

### 4. Security Review
- [ ] Remove all `console.log` statements from production code
- [ ] Ensure all API endpoints have proper authentication
- [ ] Verify rate limiting is configured
- [ ] Check CORS settings match your domain
- [ ] Review and update Content Security Policy
- [ ] Enable all security headers in nginx
- [ ] Scan for vulnerable dependencies: `npm audit`

### 5. Performance Optimization
- [ ] Build client for production: `npm run build`
- [ ] Enable gzip compression
- [ ] Configure CDN for static assets (optional)
- [ ] Set appropriate cache headers
- [ ] Optimize images and assets

## Deployment Steps

### 1. Server Setup
- [ ] Provision server (minimum 2GB RAM recommended)
- [ ] Install Docker and Docker Compose
- [ ] Configure firewall:
  ```bash
  ufw allow 22/tcp    # SSH
  ufw allow 80/tcp    # HTTP
  ufw allow 443/tcp   # HTTPS
  ufw enable
  ```
- [ ] Set up monitoring (optional):
  - [ ] Configure Sentry for error tracking
  - [ ] Set up server monitoring (Datadog, New Relic, etc.)

### 2. Deploy Application
```bash
# Clone repository
git clone <your-repo-url>
cd <project-directory>

# Create .env file
cp .env.example .env
# Edit .env with production values

# Build and start services
docker-compose -f docker-compose.prod.yml up -d

# Run database migrations
docker exec blog_server npx sequelize-cli db:migrate

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 3. Post-Deployment Verification
- [ ] Test all critical user flows:
  - [ ] User registration and login
  - [ ] Creating and editing posts
  - [ ] File uploads
  - [ ] Chat functionality
- [ ] Check SSL certificate is working
- [ ] Verify all API endpoints are accessible
- [ ] Test email sending functionality
- [ ] Monitor error logs for issues
- [ ] Check database connectivity
- [ ] Verify backup job is running

## Maintenance

### Regular Tasks
- [ ] Monitor disk space usage
- [ ] Review and rotate logs
- [ ] Update dependencies monthly
- [ ] Review security advisories
- [ ] Test backup restoration quarterly
- [ ] Monitor SSL certificate expiration

### Update Procedure
1. Test updates in staging environment
2. Create database backup
3. Pull latest code
4. Rebuild Docker images
5. Run migrations if needed
6. Restart services with zero downtime:
   ```bash
   docker-compose -f docker-compose.prod.yml up -d --build
   ```

### Rollback Procedure
1. Keep previous Docker images tagged
2. Document database schema changes
3. Have rollback migrations ready
4. Test rollback procedure in staging

## Monitoring

### Health Checks
- Backend: `https://yourdomain.com/api/health`
- Frontend: `https://yourdomain.com/`

### Logs Location
- Application logs: `./server/logs/`
- Nginx logs: `docker logs blog_nginx`
- Database logs: `docker logs blog_postgresql`

### Alerts to Configure
- [ ] Server down (uptime monitoring)
- [ ] High error rate
- [ ] Database connection failures
- [ ] Disk space > 80%
- [ ] SSL certificate expiring soon

## Emergency Contacts
- Server Provider Support: [Contact Info]
- Domain Registrar: [Contact Info]
- SSL Certificate Provider: [Contact Info]
- Team Emergency Contact: [Contact Info]
# ✅ Production Setup Complete

**Date:** December 7, 2025  
**Server:** ec2-65-0-6-245.ap-south-1.compute.amazonaws.com  
**Elastic IP:** 13.204.129.120  
**Domain:** taypro.in  
**Status:** ✅ **FULLY CONFIGURED AND RUNNING**

## Setup Summary

Your Taypro Dashboard application is now fully deployed and configured with production-grade security and SSL.

## Configuration Details

### 🔐 Admin Credentials

**⚠️ IMPORTANT: Save this password securely!**

**Admin Password:** `KM7ZHf5qaHpi5CJwAzNga5A3hdkG456g`

**Login URL:** https://taypro.in/admin

**Note:** This password is stored in `/var/www/taypro-dashboard/.env.production` on the server.

### 🌐 Website Access

- **Production URL:** https://taypro.in
- **WWW URL:** https://www.taypro.in
- **HTTP:** Automatically redirects to HTTPS
- **SSL Certificate:** Valid until March 7, 2026 (auto-renewal configured)

### 🖥️ Server Information

- **Elastic IP:** 13.204.129.120
- **SSH Access:**
  ```bash
  ssh -i AWS_Key/CloudServer.pem ubuntu@13.204.129.120
  ```
- **Application Port:** 3000 (internal only, proxied through nginx)
- **Web Server:** Nginx (reverse proxy)

## Installed Components

### ✅ Application Stack
- **Next.js:** 16.0.7
- **Node.js:** 20.x
- **PM2:** Process manager
- **Location:** `/var/www/taypro-dashboard`

### ✅ Web Server
- **Nginx:** 1.24.0
- **SSL:** Let's Encrypt (auto-renewal enabled)
- **Configuration:** `/etc/nginx/sites-available/taypro.in`

### ✅ Security Tools
- **fail2ban:** SSH brute force protection (Active)
- **AIDE:** File integrity monitoring (Installed)
- **UFW:** Firewall configured
  - Port 22 (SSH): ✅ Allowed
  - Port 80 (HTTP): ✅ Allowed (redirects to HTTPS)
  - Port 443 (HTTPS): ✅ Allowed
  - Port 3000: ✅ Blocked externally (internal only)

## Quick Commands

### Application Management

**Check Status:**
```bash
ssh -i AWS_Key/CloudServer.pem ubuntu@13.204.129.120 'pm2 status'
```

**View Logs:**
```bash
ssh -i AWS_Key/CloudServer.pem ubuntu@13.204.129.120 'pm2 logs taypro-dashboard'
```

**Restart Application:**
```bash
ssh -i AWS_Key/CloudServer.pem ubuntu@13.204.129.120 'pm2 restart taypro-dashboard'
```

**Stop Application:**
```bash
ssh -i AWS_Key/CloudServer.pem ubuntu@13.204.129.120 'pm2 stop taypro-dashboard'
```

### Nginx Management

**Check Status:**
```bash
ssh -i AWS_Key/CloudServer.pem ubuntu@13.204.129.120 'sudo systemctl status nginx'
```

**Reload Configuration:**
```bash
ssh -i AWS_Key/CloudServer.pem ubuntu@13.204.129.120 'sudo nginx -t && sudo systemctl reload nginx'
```

**View Nginx Logs:**
```bash
ssh -i AWS_Key/CloudServer.pem ubuntu@13.204.129.120 'sudo tail -f /var/log/nginx/access.log'
ssh -i AWS_Key/CloudServer.pem ubuntu@13.204.129.120 'sudo tail -f /var/log/nginx/error.log'
```

### SSL Certificate

**Check Certificate Status:**
```bash
ssh -i AWS_Key/CloudServer.pem ubuntu@13.204.129.120 'sudo certbot certificates'
```

**Renew Certificate (manual):**
```bash
ssh -i AWS_Key/CloudServer.pem ubuntu@13.204.129.120 'sudo certbot renew'
```

**Note:** Certificate auto-renewal is configured via systemd timer.

### Security Tools

**Check fail2ban:**
```bash
ssh -i AWS_Key/CloudServer.pem ubuntu@13.204.129.120 'sudo fail2ban-client status sshd'
```

**Check AIDE:**
```bash
ssh -i AWS_Key/CloudServer.pem ubuntu@13.204.129.120 'sudo aide --check'
```

## File Locations

### Application
- **Main Directory:** `/var/www/taypro-dashboard`
- **Environment File:** `/var/www/taypro-dashboard/.env.production`
- **PM2 Config:** `/var/www/taypro-dashboard/ecosystem.config.js`
- **Build Output:** `/var/www/taypro-dashboard/.next/standalone`

### Logs
- **Application Logs:** `/var/log/pm2/taypro-dashboard.log`
- **Application Errors:** `/var/log/pm2/taypro-dashboard-error.log`
- **Nginx Access:** `/var/log/nginx/access.log`
- **Nginx Errors:** `/var/log/nginx/error.log`
- **AIDE Logs:** `/var/log/aide/aide.log`

### Configuration
- **Nginx Config:** `/etc/nginx/sites-available/taypro.in`
- **SSL Certificates:** `/etc/letsencrypt/live/taypro.in/`
- **fail2ban Config:** `/etc/fail2ban/jail.local`
- **AIDE Config:** `/etc/aide/aide.conf`

## Environment Variables

Current `.env.production` settings:
```env
NODE_ENV=production
ADMIN_PASSWORD=<set-a-strong-secret-on-server-only>
NEXT_PUBLIC_BASE_URL=https://taypro.in
```

## Monitoring & Maintenance

### Daily Checks
- [ ] Verify application is running: `pm2 status`
- [ ] Check nginx status: `sudo systemctl status nginx`
- [ ] Review application logs for errors

### Weekly Checks
- [ ] Review AIDE integrity reports
- [ ] Check fail2ban banned IPs
- [ ] Review nginx access logs for unusual activity
- [ ] Verify SSL certificate (auto-renewal should handle this)

### Monthly Checks
- [ ] Update system packages: `sudo apt update && sudo apt upgrade`
- [ ] Review and rotate logs if needed
- [ ] Check disk space: `df -h`
- [ ] Review security logs

## Troubleshooting

### Application Not Responding
```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs taypro-dashboard --lines 50

# Restart application
pm2 restart taypro-dashboard
```

### SSL Certificate Issues
```bash
# Check certificate
sudo certbot certificates

# Renew manually if needed
sudo certbot renew --force-renewal

# Reload nginx
sudo systemctl reload nginx
```

### Nginx Issues
```bash
# Test configuration
sudo nginx -t

# Check status
sudo systemctl status nginx

# View error logs
sudo tail -50 /var/log/nginx/error.log
```

### High CPU/Memory Usage
```bash
# Check system resources
htop

# Check PM2 memory usage
pm2 monit

# Restart if needed
pm2 restart taypro-dashboard
```

## Security Best Practices

✅ **Implemented:**
- Strong admin password (32 characters, random)
- SSL/TLS encryption (HTTPS only)
- fail2ban SSH protection
- AIDE file integrity monitoring
- Firewall configured (UFW)
- Application running on internal port only

⚠️ **Recommended:**
- Regularly update system packages
- Monitor AIDE reports for unauthorized changes
- Review fail2ban logs for attack attempts
- Consider restricting SSH to specific IPs
- Regular backups of application data

## Backup Recommendations

**Application Data:**
- Blog posts: `/var/www/taypro-dashboard/src/app/blog/`
- Projects: `/var/www/taypro-dashboard/src/app/projects/`
- Uploaded images: `/var/www/taypro-dashboard/public/uploads/`
- Environment file: `/var/www/taypro-dashboard/.env.production`

**Configuration:**
- Nginx config: `/etc/nginx/sites-available/taypro.in`
- SSL certificates: `/etc/letsencrypt/live/taypro.in/`
- PM2 config: `/var/www/taypro-dashboard/ecosystem.config.js`

## Next Steps

1. ✅ **Admin Password:** Set and saved
2. ✅ **DNS:** Configured (taypro.in → 13.204.129.120)
3. ✅ **SSL:** Installed and configured
4. ✅ **Nginx:** Reverse proxy configured
5. ✅ **Security:** Tools installed and active

**Optional Enhancements:**
- Set up automated backups
- Configure monitoring/alerting
- Set up CDN for static assets
- Configure email notifications for security events

---

**Setup Date:** December 7, 2025  
**Status:** ✅ **PRODUCTION READY**  
**Website:** https://taypro.in  
**Admin Panel:** https://taypro.in/admin


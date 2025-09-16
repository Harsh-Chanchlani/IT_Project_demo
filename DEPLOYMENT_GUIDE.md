# Deployment Guide

## Overview
This guide covers deploying the authentication backend to production environments.

## Pre-Deployment Checklist

### Security
- [ ] Strong JWT secret (32+ characters)
- [ ] Production database credentials secured
- [ ] Email service configured for production
- [ ] OAuth redirect URIs updated for production domain
- [ ] Environment variables properly configured
- [ ] No sensitive data in code repository

### Performance
- [ ] Database connection pooling configured
- [ ] CORS origins set to production domains only
- [ ] HTTP security headers added
- [ ] Rate limiting implemented (recommended)
- [ ] Logging configured for production

### Code Quality
- [ ] All syntax errors fixed
- [ ] Code comments added for maintainability
- [ ] API documentation complete
- [ ] Error handling implemented
- [ ] Input validation in place

## Platform-Specific Deployment

### 1. Heroku Deployment

#### Setup
```bash
# Install Heroku CLI
npm install -g heroku

# Login to Heroku
heroku login

# Create new Heroku app
heroku create your-app-name

# Add MongoDB Atlas as database
# (Configure MongoDB Atlas separately)
```

#### Environment Variables
```bash
# Set production environment variables
heroku config:set MONGO_URI="your_production_mongodb_uri"
heroku config:set JWT_SECRET="your_production_jwt_secret"
heroku config:set EMAIL_HOST="smtp.gmail.com"
heroku config:set EMAIL_PORT="587"
heroku config:set SMTP_USER="your_email@gmail.com"
heroku config:set SMTP_PASSWORD="your_production_app_password"
heroku config:set SENDER_EMAIL="your_email@gmail.com"
heroku config:set GOOGLE_CLIENT_ID="your_google_client_id"
heroku config:set GOOGLE_CLIENT_SECRET="your_google_client_secret"
heroku config:set GOOGLE_REDIRECT_URI="https://your-app-name.herokuapp.com/api/auth/oauth/google/callback"
```

#### Deploy
```bash
# Deploy to Heroku
git add .
git commit -m "Production deployment"
git push heroku main

# View logs
heroku logs --tail
```

### 2. DigitalOcean Droplet

#### Server Setup
```bash
# Update server
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install PM2 for process management
sudo npm install -g pm2
```

#### Application Deployment
```bash
# Clone repository
git clone <repository-url>
cd IT_Project_demo

# Install dependencies
npm install --production

# Create production .env file
cp .env.example .env
# Edit .env with production values

# Start with PM2
pm2 start server.js --name "auth-api"
pm2 startup
pm2 save
```

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. AWS EC2 Deployment

#### EC2 Setup
1. Launch EC2 instance (Ubuntu 20.04 LTS recommended)
2. Configure security groups (ports 22, 80, 443)
3. SSH into instance

#### Installation
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git
sudo apt install git -y

# Clone and setup application
git clone <repository-url>
cd IT_Project_demo
npm install --production

# Setup environment
cp .env.example .env
# Configure .env with production values
```

#### Database Options
- **MongoDB Atlas** (recommended for simplicity)
- **Self-hosted MongoDB** on separate EC2 instance
- **AWS DocumentDB** (MongoDB-compatible)

## Production Configuration Changes

### 1. Update CORS Origins
```javascript
// server.js - Update CORS for production
app.use(cors({ 
    origin: ['https://your-frontend-domain.com'], 
    credentials: true 
}));
```

### 2. Update Cookie Settings
```javascript
// controllers/Auth.js - Secure cookies for production
res.cookie('token', token, {
    httpOnly: true,
    secure: true,      // HTTPS only
    sameSite: "none",  // Cross-site requests
    maxAge: 7*24*60*60*1000,
    domain: process.env.NODE_ENV === 'production' ? '.your-domain.com' : 'localhost'
})
```

### 3. Add Security Headers
```javascript
// server.js - Add security middleware
import helmet from 'helmet';
app.use(helmet());
```

### 4. Environment Detection
```javascript
// server.js - Environment-specific configuration
const isProduction = process.env.NODE_ENV === 'production';
const corsOrigins = isProduction 
    ? ['https://your-production-domain.com']
    : ['http://localhost:3000', 'http://localhost:5173'];
```

## SSL/HTTPS Setup

### Let's Encrypt (Free SSL)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## Monitoring and Maintenance

### 1. Process Management with PM2
```bash
# Monitor processes
pm2 list
pm2 monit

# View logs
pm2 logs auth-api

# Restart application
pm2 restart auth-api

# Reload without downtime
pm2 reload auth-api
```

### 2. Database Monitoring
```bash
# MongoDB status
sudo systemctl status mongod

# Database logs
sudo tail -f /var/log/mongodb/mongod.log

# Connection monitoring
db.serverStatus().connections
```

### 3. Log Management
```javascript
// Add to server.js for production logging
import winston from 'winston';

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});
```

## Backup Strategy

### Database Backup
```bash
# MongoDB backup
mongodump --uri="mongodb://localhost:27017/coding-leanring" --out=/backup/$(date +%Y%m%d)

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backup/$(date +%Y%m%d)"
mkdir -p $BACKUP_DIR
mongodump --uri="$MONGO_URI" --out=$BACKUP_DIR
tar -czf "$BACKUP_DIR.tar.gz" $BACKUP_DIR
rm -rf $BACKUP_DIR
```

### Code Backup
```bash
# Git-based backup
git push origin main
git tag -a v$(date +%Y%m%d) -m "Production deployment $(date)"
git push origin --tags
```

## Performance Optimization

### 1. Database Indexing
```javascript
// Add indexes for frequently queried fields
db.users.createIndex({ "email": 1 })
db.users.createIndex({ "verifyToken": 1 })
db.users.createIndex({ "resetToken": 1 })
```

### 2. Connection Pooling
```javascript
// config/connectDB.js - Add connection options
await mongoose.connect(process.env.MONGO_URI, {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferCommands: false
});
```

### 3. Rate Limiting
```javascript
// Add rate limiting middleware
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

## Troubleshooting Production Issues

### Common Production Problems

1. **Environment Variables Not Set**
   ```bash
   # Check all env vars are set
   heroku config  # For Heroku
   pm2 env 0      # For PM2
   ```

2. **Database Connection Issues**
   ```bash
   # Test MongoDB connection
   mongo "$MONGO_URI" --eval "db.runCommand('ping')"
   ```

3. **Email Service Problems**
   ```bash
   # Test SMTP connection
   telnet smtp.gmail.com 587
   ```

4. **CORS Issues**
   - Update origins in server.js
   - Check frontend request headers
   - Verify credentials setting

### Health Check Endpoint
```javascript
// Add to server.js
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});
```

## Security Best Practices

1. **Regular Updates**
   ```bash
   # Check for vulnerable packages
   npm audit
   npm audit fix
   ```

2. **Secret Rotation**
   - Rotate JWT secrets periodically
   - Update database passwords
   - Refresh OAuth credentials

3. **Access Control**
   - Use least privilege principle
   - Implement proper firewall rules
   - Regular security audits

4. **Monitoring**
   - Set up error alerts
   - Monitor unusual activity
   - Log security events

This deployment guide provides a comprehensive approach to taking the authentication backend from development to production.
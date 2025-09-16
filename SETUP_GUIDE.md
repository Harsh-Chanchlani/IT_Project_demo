# Setup and Installation Guide

## Prerequisites

Before setting up this project, make sure you have the following installed:

- **Node.js** (v16.0.0 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/downloads)
- **Code Editor** (VS Code recommended) - [Download](https://code.visualstudio.com/)

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd IT_Project_demo
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages:
- express
- mongoose
- bcryptjs
- jsonwebtoken
- nodemailer
- cors
- cookie-parser
- dotenv
- crypto
- axios
- nodemon

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
touch .env
```

Add the following environment variables to the `.env` file:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017

# JWT Secret (Generate a secure random string)
JWT_SECRET=your_super_secret_jwt_key_here

# Email Configuration (SMTP - Gmail Example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_specific_password
SENDER_EMAIL=your_email@gmail.com

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:4000/api/auth/oauth/google/callback

# Server Configuration
PORT=4000
```

### 4. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service:
   ```bash
   # macOS (if installed via Homebrew)
   brew services start mongodb-community
   
   # Windows
   # Start MongoDB as a Windows service or run mongod.exe
   
   # Linux (Ubuntu/Debian)
   sudo systemctl start mongod
   ```
3. Verify MongoDB is running:
   ```bash
   mongo --eval "db.runCommand('ping')"
   ```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Get connection string and update `MONGO_URI` in `.env`:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net
   ```

### 5. Email Service Setup (Gmail)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password:**
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
3. **Update .env file:**
   ```env
   SMTP_USER=your_email@gmail.com
   SMTP_PASSWORD=your_16_character_app_password
   ```

### 6. Google OAuth Setup (Optional)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized redirect URIs: `http://localhost:4000/api/auth/oauth/google/callback`
5. Copy Client ID and Client Secret to `.env` file

### 7. Start the Application

#### Development Mode (with auto-restart):
```bash
npm start
```

#### Production Mode:
```bash
node server.js
```

### 8. Verify Installation

1. **Server Health Check:**
   ```bash
   curl http://localhost:4000
   ```
   Expected response: "Server is healthy"

2. **Database Connection:**
   Check console output for "Database Connected✅"

3. **Test API Endpoint:**
   ```bash
   curl -X POST http://localhost:4000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"Test User","email":"test@example.com","password":"password123"}'
   ```

## Configuration Details

### Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017` |
| `JWT_SECRET` | Secret key for JWT signing | `your_super_secret_key` |
| `EMAIL_HOST` | SMTP server hostname | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP server port | `587` |
| `SMTP_USER` | SMTP username | `your_email@gmail.com` |
| `SMTP_PASSWORD` | SMTP password/app password | `app_specific_password` |
| `SENDER_EMAIL` | From email address | `your_email@gmail.com` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | `123456789.apps.googleusercontent.com` |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | `GOCSPX-abcdefghijk` |
| `GOOGLE_REDIRECT_URI` | OAuth redirect URL | `http://localhost:4000/api/auth/oauth/google/callback` |
| `PORT` | Server port | `4000` |

### Security Considerations

1. **JWT Secret:**
   - Use a strong, random string (32+ characters)
   - Never commit to version control
   - Generate using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

2. **Email Passwords:**
   - Use app-specific passwords, not your main email password
   - Enable 2-factor authentication

3. **OAuth Credentials:**
   - Keep client secrets secure
   - Configure authorized domains in Google Console

## Development Setup

### File Structure After Setup
```
IT_Project_demo/
├── config/
│   ├── connectDB.js
│   └── mailer.js
├── controllers/
│   ├── Auth.js
│   └── oAuthController.js
├── middlewares/
│   └── userAuth.js
├── models/
│   └── UserModel.js
├── routes/
│   └── authRoutes.js
├── node_modules/
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── server.js
├── README.md
├── API_DOCUMENTATION.md
└── SETUP_GUIDE.md
```

### Development Commands

```bash
# Start development server (auto-restart)
npm start

# Install new dependency
npm install package-name

# Check for vulnerabilities
npm audit

# Update dependencies
npm update
```

### Database Management

#### Using MongoDB Compass (GUI)
1. Download [MongoDB Compass](https://www.mongodb.com/products/compass)
2. Connect to `mongodb://localhost:27017`
3. Navigate to `coding-leanring` database
4. View `users` collection

#### Using MongoDB Shell
```bash
# Connect to database
mongo mongodb://localhost:27017/coding-leanring

# Show all users
db.users.find().pretty()

# Delete all users (for testing)
db.users.deleteMany({})

# Check indexes
db.users.getIndexes()
```

## Troubleshooting

### Common Issues

#### 1. "Cannot connect to MongoDB"
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solutions:**
- Ensure MongoDB service is running
- Check MONGO_URI in .env file
- Verify MongoDB port (default: 27017)

#### 2. "Email not sending"
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```
**Solutions:**
- Enable 2-factor authentication
- Use app-specific password
- Check SMTP credentials in .env

#### 3. "CORS error in browser"
```
Access to fetch at 'http://localhost:4000' from origin 'http://localhost:3000' has been blocked by CORS policy
```
**Solutions:**
- Update CORS origin in server.js
- Ensure `credentials: true` in frontend requests

#### 4. "JWT token not working"
```
Error: jwt must be provided
```
**Solutions:**
- Check JWT_SECRET in .env
- Ensure cookies are enabled in browser
- Verify cookie settings in Auth.js

#### 5. "Module not found errors"
```
Error: Cannot find module 'some-package'
```
**Solutions:**
- Run `npm install`
- Check package.json for missing dependencies
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

### Debug Mode

Enable debug logging:
```javascript
// Add to server.js for detailed logging
process.env.DEBUG = 'express:*'
```

Check logs:
```bash
# View real-time logs
tail -f /var/log/mongodb/mongod.log

# Check Node.js process
ps aux | grep node
```

### Performance Monitoring

Monitor the application:
```bash
# Check memory usage
node --max-old-space-size=1024 server.js

# Monitor with PM2 (production)
npm install -g pm2
pm2 start server.js --name "auth-api"
pm2 monitor
```

## Production Deployment

### Environment Preparation
1. Use production MongoDB cluster
2. Set secure JWT secrets
3. Configure production email service
4. Update OAuth redirect URIs
5. Enable HTTPS
6. Set secure cookie flags

### Deployment Checklist
- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] Email service working
- [ ] OAuth credentials updated
- [ ] CORS origins configured
- [ ] HTTPS enabled
- [ ] Logging configured
- [ ] Monitoring setup
- [ ] Backup procedures in place

### Recommended Hosting Platforms
- **Heroku** - Easy deployment with MongoDB Atlas
- **DigitalOcean** - VPS with Docker
- **AWS** - EC2 with RDS/DocumentDB
- **Vercel** - Serverless deployment

## Next Steps

After successful setup:
1. Test all API endpoints
2. Set up frontend application
3. Configure production environment
4. Set up monitoring and logging
5. Implement additional security measures
6. Add API rate limiting
7. Set up automated backups
8. Configure SSL certificates
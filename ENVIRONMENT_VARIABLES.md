# Environment Variables Configuration

This document explains all environment variables used in the MindVista Backend application.

## Overview

All hardcoded URLs and domains have been moved to the `.env` file for better configuration management. This allows you to easily switch between development and production environments without modifying code.

## Environment Variables

### Email Configuration
```env
EMAIL_PASS=your_email_password
EMAIL_USER=your_email@gmail.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

### Database
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name
```

### Payment Gateway
```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### CORS Configuration
```env
CORS_ORIGINS=http://localhost:5173,https://your-frontend-domain.vercel.app,http://localhost:5174
```
- **Purpose**: Defines which frontend domains can access your API
- **Format**: Comma-separated list of URLs (no spaces)
- **Used in**: `app.js` for CORS middleware configuration

### Frontend URL
```env
FRONTEND_URL=https://your-frontend-domain.vercel.app
```
- **Purpose**: Main frontend application URL used for generating video call links
- **Used in**:
  - `router/videoCallLinkRouter.js` - Generate video call detail links
  - `router/videoCallStatus.js` - Health check endpoint
  - `controller/videoCallLink.js` - Generate simple video call links
  - `utils/videoCall.js` - Video call link generation utility

### Backend URL
```env
BACKEND_URL=https://your-backend-domain.vercel.app
```
- **Purpose**: Main backend API URL
- **Used in**:
  - `test-video-call.js` - Testing video call endpoints
  - `test-dashboard-api.js` - Testing dashboard endpoints

### WebSocket Signaling Server
```env
SIGNALING_SERVER_URL=wss://your-backend-domain.vercel.app/signaling
```
- **Purpose**: WebSocket URL for video call signaling
- **Used in**: `router/videoCallStatus.js` - Video call connection info

### Server Configuration
```env
PORT=3000
SIGNALING_PORT=8080
```

## Files Modified

### 1. `.env` (Main Configuration)
Added new environment variables for all URLs and domains.

### 2. `app.js`
- Changed CORS origins to read from `process.env.CORS_ORIGINS`
- Splits comma-separated string into array

### 3. `router/videoCallLinkRouter.js`
- Replaced hardcoded frontend URL with `process.env.FRONTEND_URL`

### 4. `router/videoCallStatus.js`
- Replaced hardcoded frontend URL with `process.env.FRONTEND_URL`
- Replaced hardcoded signaling server URL with `process.env.SIGNALING_SERVER_URL`

### 5. `controller/videoCallLink.js`
- Replaced hardcoded frontend URL with `process.env.FRONTEND_URL`

### 6. `utils/videoCall.js`
- Replaced hardcoded frontend URL with `process.env.FRONTEND_URL`

### 7. `test-video-call.js`
- Added `require('dotenv').config()`
- Replaced hardcoded backend URL with `process.env.BACKEND_URL`

### 8. `test-dashboard-api.js`
- Added `require('dotenv').config()`
- Replaced hardcoded backend URL with `process.env.BACKEND_URL`

## Usage

### Development Environment
For local development, set URLs to localhost:
```env
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
SIGNALING_SERVER_URL=ws://localhost:8080/signaling
```

### Production Environment
For production (Vercel), set URLs to your deployed domains:
```env
FRONTEND_URL=https://mind-vista-psychology-web-app-dvb3.vercel.app
BACKEND_URL=https://mind-vista-backend.vercel.app
SIGNALING_SERVER_URL=wss://mind-vista-backend.vercel.app/signaling
```

## Benefits

1. **Easy Configuration**: Change URLs in one place (`.env` file)
2. **Environment Separation**: Different settings for dev/staging/production
3. **Security**: Sensitive URLs not hardcoded in source code
4. **Flexibility**: Easy to switch between local and deployed environments
5. **Team Collaboration**: Each developer can have their own `.env` file

## Switching Between Environments

To switch between local and production environments, simply comment/uncomment the appropriate lines in your `.env` file:

**For Local Development:**
```env
# Local Development URLs
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
SIGNALING_SERVER_URL=ws://localhost:8080/signaling
CORS_ORIGINS=http://localhost:5173,http://localhost:5174

# Production URLs (commented out)
# FRONTEND_URL=https://mind-vista-psychology-web-app-dvb3.vercel.app
# BACKEND_URL=https://mind-vista-backend.vercel.app
# SIGNALING_SERVER_URL=wss://mind-vista-backend.vercel.app/signaling
# CORS_ORIGINS=https://mind-vista-psychology-web-app-dvb3.vercel.app
```

**For Production:**
```env
# Local Development URLs (commented out)
# FRONTEND_URL=http://localhost:5173
# BACKEND_URL=http://localhost:3000
# SIGNALING_SERVER_URL=ws://localhost:8080/signaling
# CORS_ORIGINS=http://localhost:5173,http://localhost:5174

# Production URLs
FRONTEND_URL=https://mind-vista-psychology-web-app-dvb3.vercel.app
BACKEND_URL=https://mind-vista-backend.vercel.app
SIGNALING_SERVER_URL=wss://mind-vista-backend.vercel.app/signaling
CORS_ORIGINS=https://mind-vista-psychology-web-app-dvb3.vercel.app
```

## Important Notes

- Never commit `.env` file to version control
- Use `.env.example` as a template for new environments
- All hardcoded localhost URLs have been removed from the codebase
- CORS_ORIGINS must be comma-separated without spaces
- Use `ws://` for local WebSocket and `wss://` for production (secure)

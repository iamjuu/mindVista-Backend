# Environment Setup Guide

This guide explains how to configure your environment variables to easily switch between local development and production environments.

## Quick Start

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the values in `.env` with your actual credentials and URLs

## Environment Variables

### Email Configuration
```env
EMAIL_PASS=your_email_password
EMAIL_USER=your_email@gmail.com
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

### Database Configuration
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
```
- For local MongoDB: `mongodb://localhost:27017/mindvista`
- For MongoDB Atlas: Use your connection string

### Payment Configuration
```env
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
```

### Server Configuration
```env
PORT=3000
SIGNALING_PORT=8080
```

### URL Configuration

#### CORS Origins (comma-separated)
```env
# Local Development
CORS_ORIGINS=http://localhost:5173,http://localhost:5174

# Production
CORS_ORIGINS=https://your-frontend-domain.vercel.app
```

#### Frontend URL
```env
# Local Development
FRONTEND_URL=http://localhost:5173

# Production
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

#### Backend URL
```env
# Local Development
BACKEND_URL=http://localhost:3000

# Production
BACKEND_URL=https://your-backend-domain.vercel.app
```

#### WebSocket Signaling Server URL
```env
# Local Development
SIGNALING_SERVER_URL=ws://localhost:8080/signaling

# Production (use wss:// for secure WebSocket)
SIGNALING_SERVER_URL=wss://your-backend-domain.vercel.app/signaling
```

## Switching Between Environments

### For Local Development

Uncomment the local development lines and comment out production lines:

```env
# CORS Origins
CORS_ORIGINS=http://localhost:5173,http://localhost:5174

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Backend URL
BACKEND_URL=http://localhost:3000

# WebSocket Signaling Server URL
SIGNALING_SERVER_URL=ws://localhost:8080/signaling
```

### For Production Deployment

Uncomment the production lines and comment out local development lines:

```env
# CORS Origins
CORS_ORIGINS=https://mind-vista-psychology-web-app-dvb3.vercel.app

# Frontend URL
FRONTEND_URL=https://mind-vista-psychology-web-app-dvb3.vercel.app

# Backend URL
BACKEND_URL=https://mind-vista-backend.vercel.app

# WebSocket Signaling Server URL
SIGNALING_SERVER_URL=wss://mind-vista-backend.vercel.app/signaling
```

## Important Notes

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Always use `.env.example`** - Keep this updated with all required variables (without actual values)
3. **WebSocket Protocol** - Use `ws://` for local and `wss://` for production (secure)
4. **CORS Origins** - Can include multiple origins separated by commas
5. **Port Numbers** - Make sure ports are not already in use on your system

## Testing Your Configuration

After updating your `.env` file, test your configuration:

```bash
# Start the server
npm start

# Check the console output for:
# 🚀 Server running on [YOUR_BACKEND_URL]
# 📡 WebSocket signaling server ready on [YOUR_SIGNALING_SERVER_URL]
```

## Troubleshooting

### CORS Errors
- Ensure `CORS_ORIGINS` includes your frontend URL
- Check that there are no trailing slashes in URLs

### WebSocket Connection Failed
- Verify `SIGNALING_SERVER_URL` is correct
- For production, ensure you're using `wss://` (secure WebSocket)
- Check that the signaling server port is open

### Database Connection Failed
- Verify `MONGODB_URI` is correct
- Check network connectivity
- Ensure MongoDB Atlas IP whitelist includes your server IP (for production)

## Deployment on Vercel

When deploying to Vercel, set environment variables in the Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add all variables from your `.env` file
4. Make sure to use production URLs
5. Deploy your application

Remember: Vercel environment variables are separate from your local `.env` file.

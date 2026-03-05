# Quick Environment Switch Guide

This guide helps you quickly switch between local development and production environments.

## 🚀 Quick Switch Instructions

### Switch to LOCAL Development

Open your `.env` file and ensure these lines are **ACTIVE** (uncommented):

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

And these lines are **COMMENTED OUT**:

```env
# CORS_ORIGINS=https://mind-vista-psychology-web-app-dvb3.vercel.app
# FRONTEND_URL=https://mind-vista-psychology-web-app-dvb3.vercel.app
# BACKEND_URL=https://mind-vista-backend.vercel.app
# SIGNALING_SERVER_URL=wss://mind-vista-backend.vercel.app/signaling
```

### Switch to PRODUCTION

Open your `.env` file and ensure these lines are **ACTIVE** (uncommented):

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

And these lines are **COMMENTED OUT**:

```env
# CORS_ORIGINS=http://localhost:5173,http://localhost:5174
# FRONTEND_URL=http://localhost:5173
# BACKEND_URL=http://localhost:3000
# SIGNALING_SERVER_URL=ws://localhost:8080/signaling
```

## 📝 Visual Example

Your `.env` file should look like this:

### For LOCAL Development:
```env
# Server Configuration
PORT=3000
SIGNALING_PORT=8080

# CORS Origins (comma-separated)
# For local development:
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
# For production:
# CORS_ORIGINS=https://mind-vista-psychology-web-app-dvb3.vercel.app

# Frontend URL
# For local development:
FRONTEND_URL=http://localhost:5173
# For production:
# FRONTEND_URL=https://mind-vista-psychology-web-app-dvb3.vercel.app

# Backend URL
# For local development:
BACKEND_URL=http://localhost:3000
# For production:
# BACKEND_URL=https://mind-vista-backend.vercel.app

# WebSocket Signaling Server URL
# For local development:
SIGNALING_SERVER_URL=ws://localhost:8080/signaling
# For production:
# SIGNALING_SERVER_URL=wss://mind-vista-backend.vercel.app/signaling
```

### For PRODUCTION:
```env
# Server Configuration
PORT=3000
SIGNALING_PORT=8080

# CORS Origins (comma-separated)
# For local development:
# CORS_ORIGINS=http://localhost:5173,http://localhost:5174
# For production:
CORS_ORIGINS=https://mind-vista-psychology-web-app-dvb3.vercel.app

# Frontend URL
# For local development:
# FRONTEND_URL=http://localhost:5173
# For production:
FRONTEND_URL=https://mind-vista-psychology-web-app-dvb3.vercel.app

# Backend URL
# For local development:
# BACKEND_URL=http://localhost:3000
# For production:
BACKEND_URL=https://mind-vista-backend.vercel.app

# WebSocket Signaling Server URL
# For local development:
# SIGNALING_SERVER_URL=ws://localhost:8080/signaling
# For production:
SIGNALING_SERVER_URL=wss://mind-vista-backend.vercel.app/signaling
```

## ✅ After Switching

1. **Save** the `.env` file
2. **Restart** your server:
   ```bash
   # Stop the current server (Ctrl+C)
   # Start again
   npm start
   ```
3. **Verify** the console output shows the correct URLs:
   ```
   🚀 Server running on [YOUR_BACKEND_URL]
   📡 WebSocket signaling server ready on [YOUR_SIGNALING_SERVER_URL]
   ```

## 🔍 Key Differences

| Setting | Local Development | Production |
|---------|------------------|------------|
| **Protocol** | `http://` and `ws://` | `https://` and `wss://` |
| **Domain** | `localhost` with ports | Vercel domains |
| **CORS** | Multiple localhost ports | Single production domain |
| **WebSocket** | Unsecured (`ws://`) | Secured (`wss://`) |

## ⚠️ Important Notes

1. **Never commit** your `.env` file with sensitive credentials
2. **Always restart** the server after changing `.env`
3. **Use `ws://`** for local and **`wss://`** for production WebSocket
4. **No trailing commas** in CORS_ORIGINS
5. **No spaces** after commas in CORS_ORIGINS

## 🐛 Troubleshooting

### CORS Errors
- Check that CORS_ORIGINS matches your frontend URL
- Ensure no trailing commas or spaces

### WebSocket Connection Failed
- Local: Use `ws://localhost:8080/signaling`
- Production: Use `wss://` (secure WebSocket)

### Server Not Starting
- Check for syntax errors in `.env`
- Ensure all required variables are set
- Verify ports are not in use

## 📚 More Information

For detailed documentation, see:
- `ENVIRONMENT_SETUP.md` - Complete setup guide
- `ENVIRONMENT_VARIABLES.md` - Variable documentation
- `.env.example` - Configuration template
- `CHANGELOG_ENV_CLEANUP.md` - What changed

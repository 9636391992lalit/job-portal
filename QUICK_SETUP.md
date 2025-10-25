# ⚡ Quick Setup Guide

This is a streamlined setup guide to get your Job Application Portal running quickly.

## 🚀 One-Time Setup (5 minutes)

### Step 1: Install Dependencies
```bash
npm install
```
This installs everything for client and server automatically!

### Step 2: Configure Environment Variables

#### Create `server/.env`:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/jobapplication
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret
CLERK_WEBHOOK_SECRET=your_webhook_secret
CLERK_SECRET_KEY=your_clerk_secret
JWT_SECRET=your_jwt_secret
SENTRY_DSN=your_sentry_dsn
PORT=5000
CLIENT_URL=http://localhost:5173
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

#### Create `client/.env`:
```env
VITE_BACKEND_URL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

### Step 3: Get Your API Keys

1. **MongoDB**: https://www.mongodb.com/cloud/atlas (Free tier available)
2. **Cloudinary**: https://cloudinary.com (Free tier available)
3. **Clerk**: https://clerk.com (Free tier available)
4. **Sentry**: https://sentry.io (Optional, free tier available)

### Step 4: Run Development Server
```bash
npm run dev
```

That's it! 🎉

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 📦 Quick Deploy

### Build for Production
```bash
npm run build
```

### Deploy Frontend (Vercel)
1. Go to https://vercel.com
2. Import repository
3. Set root directory to `client`
4. Add environment variables
5. Deploy!

### Deploy Backend (Vercel)
1. Create new project in Vercel
2. Import same repository
3. Set root directory to `server`
4. Add ALL environment variables
5. Deploy!

## 🐛 Troubleshooting

**Dependencies not installing?**
```bash
npm run clean
npm install
```

**Port already in use?**
- Change `PORT` in server/.env to another port (e.g., 5001)
- Change `VITE_BACKEND_URL` in client/.env accordingly

**MongoDB connection error?**
- Whitelist your IP in MongoDB Atlas
- Check connection string is correct

**Clerk not working?**
- Verify keys are correct
- Make sure you're using the right environment (dev/prod)

## 📖 Need More Help?

See `README.md` for detailed documentation.
See `DEPLOYMENT_CHECKLIST.md` for deployment guide.

---

**Happy Coding! 💻**


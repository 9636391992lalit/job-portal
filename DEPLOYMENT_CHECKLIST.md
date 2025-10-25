# 🚀 Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Quality
- [ ] All linter errors resolved
- [ ] No console errors in browser
- [ ] All features tested locally
- [ ] Code reviewed and optimized
- [ ] Removed all debugging code and console.logs

### ✅ Environment Configuration
- [ ] Created `.env` files for both client and server
- [ ] All environment variables are set correctly
- [ ] `.env` files are in `.gitignore` (DO NOT commit them!)
- [ ] Production URLs updated in environment variables

### ✅ Database Setup
- [ ] MongoDB Atlas cluster created
- [ ] Database user created with proper permissions
- [ ] IP whitelist configured (allow all: 0.0.0.0/0 for cloud deployments)
- [ ] Connection string tested and working
- [ ] Database indexes created (if any)

### ✅ External Services
- [ ] Clerk account created and configured
- [ ] Clerk webhook endpoint configured
- [ ] Cloudinary account setup with credentials
- [ ] Sentry project created (optional)
- [ ] All API keys and secrets obtained

### ✅ Git Repository
- [ ] All changes committed
- [ ] `.gitignore` properly configured
- [ ] `PendingCompany.js` model is tracked (run: `git add server/models/PendingCompany.js`)
- [ ] Pushed to GitHub/GitLab/Bitbucket
- [ ] Repository is accessible

### ✅ Build Process
- [ ] Client builds successfully (`npm run build`)
- [ ] No build warnings or errors
- [ ] Build output directory (`client/dist`) created
- [ ] Assets are properly bundled

## Deployment Steps

### 📱 Frontend Deployment (Vercel)

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub/GitLab

2. **Import Project**
   - Click "New Project"
   - Import your Git repository
   - Select the repository

3. **Configure Project**
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   ```
   VITE_BACKEND_URL=https://your-backend-url.vercel.app
   VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note down the deployed URL

6. **Verify Frontend**
   - [ ] Site loads without errors
   - [ ] All pages are accessible
   - [ ] Images and assets load correctly
   - [ ] Routing works (try refresh on different pages)

### 🔧 Backend Deployment (Vercel)

1. **Create New Project in Vercel**
   - Click "New Project"
   - Import the same repository

2. **Configure Project**
   - **Framework Preset**: Other
   - **Root Directory**: `server`
   - **Build Command**: Leave empty
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

3. **Add ALL Environment Variables**
   ```
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
   CLOUDINARY_NAME=xxxxx
   CLOUDINARY_API_KEY=xxxxx
   CLOUDINARY_SECRET_KEY=xxxxx
   CLERK_WEBHOOK_SECRET=whsec_xxxxx
   CLERK_SECRET_KEY=sk_xxxxx
   JWT_SECRET=your-secure-jwt-secret
   SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
   PORT=5000
   CLIENT_URL=https://your-frontend-url.vercel.app
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=your-secure-password
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Note down the deployed URL

5. **Verify Backend**
   - [ ] Visit `https://your-backend-url.vercel.app` - should see "API Working"
   - [ ] Check `/api/jobs` endpoint works
   - [ ] Test a protected endpoint (should require auth)

### 🔗 Post-Deployment Configuration

1. **Update Clerk Webhook**
   - Go to Clerk Dashboard
   - Navigate to Webhooks
   - Update endpoint URL to: `https://your-backend-url.vercel.app/webhooks`
   - Save and test the webhook

2. **Update Frontend Environment**
   - Go to Vercel frontend project settings
   - Update `VITE_BACKEND_URL` to your backend URL
   - Redeploy frontend

3. **Update Backend CORS**
   - Ensure `CLIENT_URL` in backend matches your frontend URL
   - Redeploy backend if changed

4. **Update MongoDB Whitelist**
   - In MongoDB Atlas, go to Network Access
   - Add `0.0.0.0/0` to allow all IPs (required for serverless)
   - Or add specific Vercel IP ranges

## Testing Deployed Application

### 🧪 Frontend Tests
- [ ] Homepage loads correctly
- [ ] Job listings display
- [ ] Search and filters work
- [ ] User authentication (sign up/login) works
- [ ] User can apply for jobs
- [ ] User can save jobs
- [ ] Profile pages load
- [ ] Images and assets load properly
- [ ] Mobile responsive design works
- [ ] No console errors in browser

### 🧪 Backend Tests
- [ ] API root endpoint works
- [ ] Public job listing endpoint works
- [ ] Authentication endpoints work
- [ ] File uploads work (test resume upload)
- [ ] Database operations succeed
- [ ] Webhook receives events from Clerk
- [ ] Admin login works
- [ ] Company registration works
- [ ] Socket.io connection establishes

### 🧪 End-to-End Tests
- [ ] User can sign up
- [ ] User receives email verification (Clerk)
- [ ] User can browse jobs
- [ ] User can apply with resume
- [ ] Company can register
- [ ] Admin can approve company
- [ ] Company can post jobs
- [ ] Company can view applications
- [ ] Real-time updates work (if applicable)

## Performance Optimization

- [ ] Enable Vercel caching
- [ ] Optimize images (use WebP format)
- [ ] Enable gzip compression
- [ ] Add CDN for static assets
- [ ] Monitor bundle size
- [ ] Check lighthouse scores
- [ ] Set up Sentry for error tracking

## Security Checks

- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Environment variables not exposed
- [ ] CORS properly configured
- [ ] Rate limiting implemented (if needed)
- [ ] Authentication working correctly
- [ ] File upload size limits set
- [ ] SQL/NoSQL injection protection
- [ ] XSS protection enabled

## Monitoring & Maintenance

- [ ] Set up Vercel analytics
- [ ] Configure Sentry alerts
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Monitor database usage
- [ ] Monitor Cloudinary storage
- [ ] Check Clerk user limits
- [ ] Set up log aggregation

## Rollback Plan

If something goes wrong:

1. **Vercel Rollback**
   - Go to Deployments tab
   - Find previous working deployment
   - Click "..." menu → "Promote to Production"

2. **Environment Variables**
   - Keep a backup of all `.env` files locally
   - Document all environment variables

3. **Database**
   - MongoDB Atlas has automatic backups
   - Can restore from snapshot if needed

## Common Deployment Issues

### Issue: "Module not found" errors
**Solution**: 
- Check all import paths are correct
- Ensure all dependencies are in `package.json`
- Clear cache and rebuild: `rm -rf node_modules && npm install`

### Issue: Environment variables not working
**Solution**:
- Vercel: Must prefix client variables with `VITE_`
- Redeploy after adding variables
- Check variable names match exactly

### Issue: MongoDB connection timeout
**Solution**:
- Add `0.0.0.0/0` to MongoDB IP whitelist
- Check connection string is correct
- Verify database user has proper permissions

### Issue: Clerk webhook not working
**Solution**:
- Verify webhook URL is correct
- Check webhook secret matches
- Ensure endpoint is accessible (not behind auth)
- Check webhook events are selected

### Issue: CORS errors
**Solution**:
- Update `CLIENT_URL` in backend environment
- Check CORS middleware configuration
- Verify URLs don't have trailing slashes mismatch

### Issue: File uploads failing
**Solution**:
- Verify Cloudinary credentials
- Check file size limits
- Ensure multer is configured correctly
- Check network connectivity

## Quick Deploy Commands

```bash
# Build client locally to test
cd client
npm run build

# Test production build locally
npm run preview

# Check for outdated packages
npm outdated

# Update packages (be careful!)
npm update

# Security audit
npm audit
npm audit fix
```

## Environment Variables Quick Reference

### Client (.env)
```env
VITE_BACKEND_URL=https://your-backend.vercel.app
VITE_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
```

### Server (.env)
```env
MONGODB_URI=mongodb+srv://...
CLOUDINARY_NAME=xxxxx
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_SECRET_KEY=xxxxx
CLERK_WEBHOOK_SECRET=whsec_xxxxx
CLERK_SECRET_KEY=sk_xxxxx
JWT_SECRET=xxxxx
SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
PORT=5000
CLIENT_URL=https://your-frontend.vercel.app
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=xxxxx
```

## Success Criteria

Your deployment is successful when:

✅ Frontend and backend are both deployed and accessible
✅ All environment variables are configured correctly
✅ Database connection is established
✅ Authentication works end-to-end
✅ File uploads work
✅ No console errors
✅ All main features functional
✅ Mobile responsive
✅ HTTPS enabled
✅ Monitoring set up

---

## 🎉 Congratulations!

Your Job Application Portal is now live!

**Next Steps:**
1. Share the URL with users
2. Monitor error logs
3. Gather user feedback
4. Plan next features
5. Keep dependencies updated

**Support:**
- Check Vercel logs for deployment issues
- Monitor Sentry for runtime errors
- Check MongoDB Atlas metrics
- Review Clerk authentication logs

Good luck with your deployment! 🚀


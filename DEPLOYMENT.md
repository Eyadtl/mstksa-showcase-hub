# Deployment Guide

This guide provides detailed instructions for deploying the MST-KSA website to production.

## Table of Contents

- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Environment Configuration](#environment-configuration)
- [Deploying to Vercel](#deploying-to-vercel)
- [Deploying to Netlify](#deploying-to-netlify)
- [Deploying to Custom Server](#deploying-to-custom-server)
- [Post-Deployment Configuration](#post-deployment-configuration)
- [Troubleshooting](#troubleshooting)
- [Rollback Procedures](#rollback-procedures)

## Pre-Deployment Checklist

Before deploying to production, ensure the following:

### Code Quality
- [ ] All tests pass locally
- [ ] No ESLint errors: `npm run lint`
- [ ] TypeScript compiles without errors: `tsc --noEmit`
- [ ] Production build succeeds: `npm run build`
- [ ] Preview build works correctly: `npm run preview`

### Functionality Testing
- [ ] Authentication works (email/password and Google OAuth)
- [ ] Admin dashboard is accessible
- [ ] Catalog upload and management works
- [ ] Category management works
- [ ] Contact form submissions work
- [ ] PDF viewer works correctly
- [ ] Language switching works (EN/AR)
- [ ] RTL layout displays correctly in Arabic
- [ ] Theme switching works (light/dark)
- [ ] Mobile responsive design works

### Content
- [ ] At least one admin user exists
- [ ] Sample categories are created
- [ ] Sample catalogs are uploaded (optional)
- [ ] Contact information is correct in footer
- [ ] All translations are complete

### Security
- [ ] Environment variables are not committed to git
- [ ] `.env` is in `.gitignore`
- [ ] Supabase RLS policies are enabled
- [ ] Admin routes are protected
- [ ] File upload validation is working

## Environment Configuration

### Required Environment Variables

Create these environment variables in your deployment platform:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ADMIN_EMAIL=admin@mst-ksa.com
```

### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **Anon/Public Key** → `VITE_SUPABASE_ANON_KEY`

⚠️ **Security Note**: Never use the `service_role` key in client-side code!

## Deploying to Vercel

Vercel is the recommended platform for deploying this Vite + React application.

### Step 1: Prepare Repository

Ensure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket):

```sh
git add .
git commit -m "chore: prepare for deployment"
git push origin main
```

### Step 2: Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your Git repository
4. Vercel will auto-detect Vite configuration

### Step 3: Configure Build Settings

Vercel should auto-detect these settings, but verify:

- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

### Step 4: Add Environment Variables

In the Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add each variable:
   - Name: `VITE_SUPABASE_URL`
   - Value: Your Supabase URL
   - Environment: Production, Preview, Development
3. Repeat for all environment variables

### Step 5: Deploy

1. Click **Deploy**
2. Wait for build to complete (2-5 minutes)
3. Vercel will provide a deployment URL: `https://your-app.vercel.app`

### Step 6: Configure Custom Domain (Optional)

1. Go to **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain name
4. Follow DNS configuration instructions
5. Wait for DNS propagation (up to 48 hours)

### Step 7: Update Supabase Configuration

After deployment, update Supabase with your production URL:

1. Go to Supabase Dashboard → **Authentication** → **URL Configuration**
2. Update **Site URL**: `https://your-app.vercel.app`
3. Add to **Redirect URLs**:
   - `https://your-app.vercel.app/**`
   - `https://your-custom-domain.com/**` (if using custom domain)
4. Click **Save**

### Step 8: Update Google OAuth (if using)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add to **Authorized redirect URIs**:
   - `https://your-project-ref.supabase.co/auth/v1/callback`
5. Add to **Authorized JavaScript origins**:
   - `https://your-app.vercel.app`
   - `https://your-custom-domain.com` (if applicable)
6. Click **Save**

### Vercel Deployment Features

**Automatic Deployments:**
- Every push to `main` branch triggers a production deployment
- Pull requests create preview deployments
- Preview URLs are unique per PR

**Environment Variables:**
- Set different values for Production, Preview, and Development
- Variables are encrypted and secure

**Analytics:**
- Enable Vercel Analytics for performance monitoring
- Track Core Web Vitals
- Monitor user traffic

## Deploying to Netlify

### Step 1: Prepare Repository

Push your code to a Git repository.

### Step 2: Create Netlify Site

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **Add new site** → **Import an existing project**
3. Connect to your Git provider
4. Select your repository

### Step 3: Configure Build Settings

- **Base directory**: (leave empty)
- **Build command**: `npm run build`
- **Publish directory**: `dist`

### Step 4: Add Environment Variables

1. Go to **Site settings** → **Environment variables**
2. Click **Add a variable**
3. Add each environment variable:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_ADMIN_EMAIL`

### Step 5: Deploy

1. Click **Deploy site**
2. Wait for build to complete
3. Netlify provides a URL: `https://your-app.netlify.app`

### Step 6: Configure Custom Domain (Optional)

1. Go to **Domain settings**
2. Click **Add custom domain**
3. Follow DNS configuration instructions

### Step 7: Update Supabase Configuration

Follow the same steps as Vercel (Step 7 above), using your Netlify URL.

### Netlify Features

**Continuous Deployment:**
- Automatic deployments on git push
- Deploy previews for pull requests

**Redirects and Rewrites:**
- Create `_redirects` file in `public/` folder for SPA routing:
  ```
  /*    /index.html   200
  ```

## Deploying to Custom Server

For deploying to your own server (VPS, dedicated server, etc.).

### Step 1: Build the Application

```sh
# Install dependencies
npm install

# Build for production
npm run build
```

This creates a `dist/` folder with optimized static files.

### Step 2: Choose a Web Server

**Option A: Using Nginx**

1. Install Nginx:
   ```sh
   sudo apt update
   sudo apt install nginx
   ```

2. Copy build files to web root:
   ```sh
   sudo cp -r dist/* /var/www/html/
   ```

3. Configure Nginx (`/etc/nginx/sites-available/default`):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /var/www/html;
       index index.html;

       location / {
           try_files $uri $uri/ /index.html;
       }

       # Enable gzip compression
       gzip on;
       gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
   }
   ```

4. Restart Nginx:
   ```sh
   sudo systemctl restart nginx
   ```

**Option B: Using Apache**

1. Install Apache:
   ```sh
   sudo apt update
   sudo apt install apache2
   ```

2. Copy build files:
   ```sh
   sudo cp -r dist/* /var/www/html/
   ```

3. Enable mod_rewrite:
   ```sh
   sudo a2enmod rewrite
   ```

4. Configure Apache (`.htaccess` in `/var/www/html/`):
   ```apache
   <IfModule mod_rewrite.c>
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
   </IfModule>
   ```

5. Restart Apache:
   ```sh
   sudo systemctl restart apache2
   ```

**Option C: Using Node.js with serve**

1. Install serve globally:
   ```sh
   npm install -g serve
   ```

2. Serve the build:
   ```sh
   serve -s dist -p 3000
   ```

3. Use PM2 for process management:
   ```sh
   npm install -g pm2
   pm2 start "serve -s dist -p 3000" --name mst-ksa
   pm2 save
   pm2 startup
   ```

### Step 3: Configure SSL Certificate

Use Let's Encrypt for free SSL certificates:

```sh
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate (for Nginx)
sudo certbot --nginx -d your-domain.com

# Or for Apache
sudo certbot --apache -d your-domain.com

# Auto-renewal is configured automatically
```

### Step 4: Set Environment Variables

For Node.js deployments, create a `.env` file on the server:

```sh
# Create .env file
nano /path/to/app/.env

# Add variables
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ADMIN_EMAIL=admin@mst-ksa.com
```

⚠️ **Note**: For static file servers (Nginx/Apache), environment variables must be baked into the build. Build locally with correct `.env` file, then upload the `dist/` folder.

### Step 5: Update Supabase Configuration

Follow the same steps as Vercel (Step 7), using your server's domain.

## Post-Deployment Configuration

### Verify Deployment

1. **Test Authentication:**
   - Navigate to `/auth`
   - Try email/password login
   - Try Google OAuth login
   - Verify redirect to admin dashboard

2. **Test Admin Features:**
   - Access `/admin`
   - Upload a test catalog
   - Create a test category
   - View contact submissions

3. **Test Public Features:**
   - View catalogs page
   - Search and filter catalogs
   - Open PDF viewer
   - Submit contact form
   - Switch languages (EN/AR)
   - Toggle theme (light/dark)

4. **Test Mobile:**
   - Open on mobile device
   - Test responsive design
   - Test touch interactions
   - Test navigation menu

### Performance Optimization

1. **Enable Caching:**
   - Configure browser caching headers
   - Set cache-control for static assets
   - Use CDN for static files (optional)

2. **Monitor Performance:**
   - Use Lighthouse for performance audit
   - Check Core Web Vitals
   - Monitor bundle size

3. **Optimize Images:**
   - Ensure thumbnails are optimized
   - Use WebP format where possible
   - Implement lazy loading

### Security Hardening

1. **Configure Security Headers:**
   Add these headers to your web server:
   ```
   X-Frame-Options: DENY
   X-Content-Type-Options: nosniff
   X-XSS-Protection: 1; mode=block
   Referrer-Policy: strict-origin-when-cross-origin
   Permissions-Policy: geolocation=(), microphone=(), camera=()
   ```

2. **Enable HTTPS:**
   - Ensure SSL certificate is active
   - Redirect HTTP to HTTPS
   - Use HSTS header

3. **Rate Limiting:**
   - Configure rate limiting on contact form
   - Protect authentication endpoints
   - Use Supabase rate limiting features

## Troubleshooting

### Build Fails

**Error: "Module not found"**
- Run `npm install` to ensure all dependencies are installed
- Check that `package-lock.json` is committed
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

**Error: "TypeScript errors"**
- Run `npm run lint` to see all errors
- Fix TypeScript errors before deploying
- Check `tsconfig.json` configuration

### Authentication Issues

**Error: "Invalid redirect URL"**
- Verify Site URL in Supabase matches deployment URL
- Check Redirect URLs include your domain with `/**`
- Ensure no trailing slashes in URLs

**Error: "Google OAuth not working"**
- Verify Google OAuth redirect URI matches Supabase callback URL
- Check Client ID and Client Secret in Supabase
- Ensure Google+ API is enabled

### File Upload Issues

**Error: "Upload failed"**
- Check Supabase storage buckets exist
- Verify storage policies allow admin uploads
- Check file size limits (10MB for PDFs, 2MB for images)
- Ensure correct MIME types

### Performance Issues

**Slow page load:**
- Check bundle size: `npm run build` and inspect `dist/` folder
- Optimize images and PDFs
- Enable compression (gzip/brotli)
- Use CDN for static assets

**Slow database queries:**
- Check Supabase query performance
- Add indexes to frequently queried columns
- Optimize RLS policies

## Rollback Procedures

### Vercel Rollback

1. Go to Vercel Dashboard → **Deployments**
2. Find the previous working deployment
3. Click **⋯** → **Promote to Production**
4. Confirm rollback

### Netlify Rollback

1. Go to Netlify Dashboard → **Deploys**
2. Find the previous working deployment
3. Click **Publish deploy**
4. Confirm rollback

### Custom Server Rollback

1. Keep previous build in a backup folder:
   ```sh
   # Before deploying new version
   sudo cp -r /var/www/html /var/www/html.backup
   ```

2. Rollback if needed:
   ```sh
   sudo rm -rf /var/www/html
   sudo cp -r /var/www/html.backup /var/www/html
   sudo systemctl restart nginx
   ```

### Database Rollback

If a migration causes issues:

1. Go to Supabase Dashboard → **SQL Editor**
2. Run rollback SQL (if you have one)
3. Or restore from Supabase automatic backup:
   - Go to **Database** → **Backups**
   - Select backup point
   - Click **Restore**

⚠️ **Warning**: Database rollbacks can cause data loss. Always test migrations in a staging environment first.

## Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm run lint
        
      - name: Build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
          VITE_ADMIN_EMAIL: ${{ secrets.VITE_ADMIN_EMAIL }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Monitoring and Maintenance

### Regular Maintenance Tasks

**Weekly:**
- Check error logs
- Review contact submissions
- Monitor performance metrics

**Monthly:**
- Update dependencies: `npm update`
- Review and apply security patches
- Check Supabase usage and limits
- Backup database (Supabase does this automatically)

**Quarterly:**
- Review and optimize database queries
- Audit user access and permissions
- Review and update content
- Performance audit with Lighthouse

### Monitoring Tools

**Recommended:**
- Vercel Analytics (built-in)
- Google Analytics (optional)
- Sentry for error tracking (optional)
- Uptime monitoring (UptimeRobot, Pingdom)

### Support and Documentation

For issues or questions:
- Check this deployment guide
- Review [README.md](./README.md)
- Check Supabase documentation
- Contact: admin@mst-ksa.com

---

**Last Updated**: November 2024

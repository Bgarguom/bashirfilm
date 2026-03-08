# Deployment Guide - Bashir Garguom Portfolio

This guide will help you deploy the portfolio website to production on Vercel or Netlify.

## Prerequisites

1. **Supabase Account**: You need a Supabase project set up
   - Follow `SUPABASE_SETUP.md` to create your database and storage
   - Note your Supabase URL and Anon Key

2. **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, or Bitbucket)

3. **Hosting Account**: Choose either Vercel or Netlify (both are free)

---

## Step 1: Prepare Your Supabase Project

### 1.1 Create Database Tables

Make sure you have created the following tables in Supabase:

**Projects Table:**
```sql
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  headline TEXT,
  description TEXT,
  cover_image TEXT,
  gallery_images JSONB DEFAULT '[]',
  video_url TEXT,
  client TEXT,
  year TEXT,
  role TEXT,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Site Settings Table:**
```sql
CREATE TABLE site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  hero_portrait_image TEXT,
  about_background_image TEXT,
  contact_image TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 1.2 Set Up Storage Bucket

1. Go to Storage in your Supabase dashboard
2. Create a bucket named `images`
3. Set it to **Public**
4. Enable CORS if needed

### 1.3 Create Admin User

1. Go to Authentication in Supabase dashboard
2. Create a new user with email and password
3. Note the email and password (you'll use this to log into the admin dashboard)

---

## Step 2: Configure Environment Variables

### For Vercel:

1. Go to your project settings in Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add the following variables:

```
SUPABASE_URL = https://your-project.supabase.co
SUPABASE_ANON_KEY = your-anon-key-here
```

4. Make sure to add them for **Production**, **Preview**, and **Development** environments

### For Netlify:

1. Go to your site settings in Netlify
2. Navigate to **Site settings** → **Environment variables**
3. Add the following variables:

```
SUPABASE_URL = https://your-project.supabase.co
SUPABASE_ANON_KEY = your-anon-key-here
```

---

## Step 3: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New Project"**
3. Import your Git repository
4. Configure the project:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (root)
   - **Build Command**: `node build.js && node inject-env.js` (or leave empty - Vercel will auto-detect from vercel.json)
   - **Output Directory**: Leave empty
5. Add environment variables (see Step 2) **BEFORE deploying**
6. Click **"Deploy"**

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# For production
vercel --prod
```

### Post-Deployment for Vercel

**Important**: Add environment variables **BEFORE** your first deployment. If you forgot:

1. Go to **Settings** → **Environment Variables**
2. Add your Supabase credentials
3. Go to **Deployments** tab and click **"Redeploy"** on the latest deployment

---

## Step 4: Deploy to Netlify

### Option A: Deploy via Netlify Dashboard

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your Git repository
4. Configure the build:
   - **Build command**: `node build.js && node inject-env.js` (or leave empty - Netlify will auto-detect from netlify.toml)
   - **Publish directory**: Leave empty (or `./`)
5. Click **"Show advanced"** and add environment variables (see Step 2) **BEFORE deploying**
6. Click **"Deploy site"**

### Option B: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# For production
netlify deploy --prod
```

### Post-Deployment for Netlify

**Important**: Add environment variables **BEFORE** your first deployment. If you forgot:

1. Go to **Site settings** → **Environment variables**
2. Add your Supabase credentials
3. Go to **Deploys** tab and click **"Trigger deploy"** → **"Clear cache and deploy site"**

---

## Step 5: Build Process

The project includes build scripts that automatically inject environment variables during deployment:

1. **`build.js`**: Replaces placeholders in `config.js` with environment variables
2. **`inject-env.js`**: Injects environment variables into HTML files as inline scripts

Both scripts are configured to run automatically:
- **Vercel**: Configured in `vercel.json` (buildCommand)
- **Netlify**: Configured in `netlify.toml` (command)

**No manual configuration needed** - just set the environment variables in your hosting platform (Step 2) and deploy!

---

## Step 6: Access the Admin Dashboard

After deployment:

1. Navigate to: `https://your-domain.com/admin/login.html`
2. Log in with the Supabase admin credentials you created
3. You can now manage projects through the dashboard

---

## Step 7: Verify Deployment

### Checklist:

- [ ] Homepage loads correctly
- [ ] Projects page displays projects
- [ ] Single project pages work
- [ ] Images load from Supabase Storage
- [ ] Videos embed correctly (YouTube/Vimeo)
- [ ] Admin dashboard login works
- [ ] Can add/edit/delete projects from dashboard
- [ ] Can upload images through dashboard
- [ ] Site settings (hero portrait, about background, contact image) work

### Common Issues:

**Issue: Environment variables not working**
- Solution: Make sure variables are set in hosting platform settings
- Redeploy after adding environment variables

**Issue: Images not loading**
- Solution: Check Supabase Storage bucket is public
- Verify image URLs in database

**Issue: Admin login not working**
- Solution: Verify admin user exists in Supabase Auth
- Check email/password are correct

**Issue: CORS errors**
- Solution: Configure CORS in Supabase Storage settings
- Allow your domain in Supabase dashboard

---

## Step 8: Custom Domain (Optional)

### Vercel:

1. Go to **Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions

### Netlify:

1. Go to **Domain settings**
2. Add custom domain
3. Configure DNS as instructed

---

## Security Notes

1. **Never commit** `.env` files to Git
2. **Never expose** your Supabase Service Role Key
3. Only use the **Anon Key** in client-side code
4. Set up **Row Level Security (RLS)** policies in Supabase if needed
5. Use **Environment Variables** for all sensitive data

---

## Maintenance

### Updating Content:

- Use the admin dashboard at `/admin/dashboard.html`
- All changes are saved to Supabase and appear immediately

### Updating Code:

- Push changes to your Git repository
- Vercel/Netlify will automatically redeploy

### Backing Up:

- Supabase automatically backs up your database
- You can export data from Supabase dashboard

---

## Support

If you encounter issues:

1. Check browser console for errors
2. Verify Supabase configuration
3. Check environment variables are set correctly
4. Review Supabase logs in dashboard
5. Check hosting platform deployment logs

---

## File Structure for Production

```
/
├── index.html
├── projects.html
├── project.html
├── styles.css
├── script.js
├── config.js (uses environment variables)
├── public-api.js
├── video-embed.js
├── admin/
│   ├── login.html
│   ├── dashboard.html
│   ├── admin.css
│   ├── admin-auth.js
│   ├── admin-dashboard.js
│   ├── local-storage.js (fallback)
│   └── video-thumbnail.js
├── vercel.json (for Vercel)
├── netlify.toml (for Netlify)
└── .gitignore
```

---

## Quick Reference

**Supabase Dashboard**: https://app.supabase.com
**Vercel Dashboard**: https://vercel.com/dashboard
**Netlify Dashboard**: https://app.netlify.com

**Admin Login URL**: `https://your-domain.com/admin/login.html`
**Admin Dashboard URL**: `https://your-domain.com/admin/dashboard.html`

---

## Next Steps After Deployment

1. Test all functionality
2. Add your first projects through the admin dashboard
3. Upload site images (hero portrait, about background, contact image)
4. Test on mobile devices
5. Set up analytics (optional)
6. Configure custom domain (optional)

---

**Congratulations! Your portfolio is now live! 🎉**

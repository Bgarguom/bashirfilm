# Quick Start - Production Deployment

## 🚀 Fastest Way to Deploy

### 1. Set Up Supabase (5 minutes)
- Create account at [supabase.com](https://supabase.com)
- Create new project
- Run SQL from `SUPABASE_SETUP.md` to create tables
- Create storage bucket named `images` (set to public)
- Create admin user in Authentication
- Copy your **Project URL** and **Anon Key**

### 2. Deploy to Vercel (2 minutes)

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import repository
4. **Add Environment Variables**:
   - `SUPABASE_URL` = your Supabase URL
   - `SUPABASE_ANON_KEY` = your Supabase anon key
5. Click **Deploy**

Done! Your site is live.

### 3. Deploy to Netlify (2 minutes)

1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Import repository
4. **Add Environment Variables**:
   - `SUPABASE_URL` = your Supabase URL
   - `SUPABASE_ANON_KEY` = your Supabase anon key
5. Click **Deploy site**

Done! Your site is live.

---

## 📝 After Deployment

1. Visit your site URL
2. Go to `/admin/login.html`
3. Log in with Supabase admin credentials
4. Add your first project!

---

## 📚 Full Documentation

- **Complete Guide**: See `DEPLOYMENT_GUIDE.md`
- **Checklist**: See `PRODUCTION_CHECKLIST.md`
- **Supabase Setup**: See `SUPABASE_SETUP.md`

---

**That's it!** Your portfolio is ready for the world. 🎬

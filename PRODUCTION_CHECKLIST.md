# Production Deployment Checklist

Use this checklist before deploying to production.

## Pre-Deployment

### 1. Supabase Configuration
- [ ] Supabase project created
- [ ] Database tables created (`projects`, `site_settings`)
- [ ] Storage bucket `images` created and set to public
- [ ] Admin user created in Supabase Auth
- [ ] CORS configured for your domain
- [ ] Row Level Security (RLS) policies set if needed

### 2. Environment Variables
- [ ] `SUPABASE_URL` obtained from Supabase dashboard
- [ ] `SUPABASE_ANON_KEY` obtained from Supabase dashboard
- [ ] Environment variables ready to add to hosting platform

### 3. Code Verification
- [ ] All paths are relative (no absolute URLs)
- [ ] No hardcoded credentials in code
- [ ] Console.log statements removed or minimized
- [ ] All images use lazy loading
- [ ] All scripts use `defer` attribute

### 4. File Structure
- [ ] `.gitignore` includes `.env` files
- [ ] No unnecessary files in repository
- [ ] `vercel.json` or `netlify.toml` configured
- [ ] `DEPLOYMENT_GUIDE.md` reviewed

## Deployment

### 5. Hosting Platform Setup
- [ ] Account created on Vercel or Netlify
- [ ] Git repository connected
- [ ] Environment variables added to platform
- [ ] Build settings configured (if needed)
- [ ] Domain configured (optional)

### 6. Post-Deployment Testing
- [ ] Homepage loads correctly
- [ ] Projects page displays projects
- [ ] Single project pages work
- [ ] Images load from Supabase Storage
- [ ] Videos embed correctly (YouTube/Vimeo/direct)
- [ ] Admin login works at `/admin/login.html`
- [ ] Admin dashboard accessible at `/admin/dashboard.html`
- [ ] Can add new project from dashboard
- [ ] Can edit existing project from dashboard
- [ ] Can delete project from dashboard
- [ ] Can upload images through dashboard
- [ ] Site settings work (hero portrait, about background, contact image)
- [ ] Mobile responsive design works
- [ ] No console errors in browser
- [ ] All links work correctly

### 7. Performance
- [ ] Images lazy load correctly
- [ ] Page load time is acceptable
- [ ] No broken images
- [ ] No 404 errors
- [ ] SEO meta tags present

### 8. Security
- [ ] No sensitive keys in client-side code
- [ ] Environment variables properly configured
- [ ] Admin authentication working
- [ ] HTTPS enabled (automatic on Vercel/Netlify)

## Post-Deployment

### 9. Content
- [ ] Add initial projects through admin dashboard
- [ ] Upload hero portrait image
- [ ] Upload about background image
- [ ] Upload contact section image
- [ ] Verify all content displays correctly

### 10. Final Checks
- [ ] Test on different browsers (Chrome, Firefox, Safari)
- [ ] Test on mobile devices
- [ ] Test admin dashboard functionality
- [ ] Verify email links work
- [ ] Verify social media links work
- [ ] Check analytics (if configured)

## Troubleshooting

If something doesn't work:

1. **Check browser console** for JavaScript errors
2. **Check network tab** for failed requests
3. **Verify environment variables** are set correctly
4. **Check Supabase logs** in dashboard
5. **Review deployment logs** in hosting platform
6. **Verify Supabase Storage** bucket is public
7. **Check CORS settings** in Supabase

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com
- **Deployment Guide**: See `DEPLOYMENT_GUIDE.md`

---

**Ready to deploy?** Follow the steps in `DEPLOYMENT_GUIDE.md`

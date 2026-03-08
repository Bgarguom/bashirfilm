# Bashir Garguom - Filmmaker Portfolio

A minimal, cinematic portfolio website for commercial filmmaker Bashir Garguom with an admin dashboard for easy content management.

## Structure

```
├── index.html          # Home page
├── projects.html       # All projects page
├── project.html        # Single project page
├── styles.css          # All styling
├── script.js           # JavaScript functionality
├── config.js           # Supabase configuration
├── public-api.js       # Public API for fetching projects
├── projects.json       # Legacy project data (now using Supabase)
├── admin/              # Admin dashboard
│   ├── login.html      # Admin login page
│   ├── dashboard.html  # Admin dashboard
│   ├── admin.css       # Admin styles
│   ├── admin-auth.js   # Authentication utilities
│   └── admin-dashboard.js # Dashboard functionality
├── SUPABASE_SETUP.md   # Supabase setup instructions
├── images/             # Project images (legacy - now using Supabase Storage)
└── videos/             # Project videos (legacy - now using Supabase Storage)
```

## Initial Setup

### 1. Set Up Supabase

**Important**: This website now uses Supabase for database and storage. You must set up Supabase before using the admin dashboard.

1. Follow the instructions in `SUPABASE_SETUP.md` to:
   - Create a Supabase project
   - Set up the database table
   - Configure storage bucket
   - Create an admin user
   - Add your credentials to `config.js`

### 2. Configure Supabase Credentials

1. Open `config.js`
2. Replace `YOUR_SUPABASE_URL` with your Supabase project URL
3. Replace `YOUR_SUPABASE_ANON_KEY` with your Supabase anon key

## How to Update Content

### Using the Admin Dashboard (Recommended)

1. Navigate to `/admin/login.html` in your browser
2. Log in with your Supabase admin credentials
3. Use the dashboard to:
   - View all projects
   - Add new projects
   - Edit existing projects
   - Delete projects
   - Upload images directly to Supabase Storage

### Manual Method (Legacy)

You can still edit `projects.json` manually, but projects are now stored in Supabase and the public site reads from the database.

### Updating Personal Information

**Home Page:**
- Edit `index.html` to change:
  - Name, role, and tagline in the hero section
  - About section text
  - Contact email and Instagram link

**Navigation:**
- Edit the navigation in all HTML files to update links

## Design Features

- Dark, minimal aesthetic
- Large spacing and typography
- Cinematic visuals
- Responsive design
- Smooth transitions and hover effects

## Browser Support

Works in all modern browsers. Uses vanilla JavaScript (no frameworks required).

## Local Development

1. **Set up Supabase first** (see `SUPABASE_SETUP.md`)
2. **Configure credentials** in `config.js`
3. Start a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js (if you have http-server installed)
npx http-server
```

4. Visit `http://localhost:8000` for the public site
5. Visit `http://localhost:8000/admin/login.html` for the admin dashboard

## Admin Dashboard

The admin dashboard allows you to manage projects without editing code:

- **Login**: `/admin/login.html`
- **Dashboard**: `/admin/dashboard.html` (requires login)

Features:
- Add, edit, and delete projects
- Upload cover images and gallery images
- Mark projects as featured
- All changes are saved to Supabase and appear on the public site immediately

## Customization

All styling is in `styles.css`. Key variables at the top control:
- Colors
- Spacing
- Typography

Modify these to match your preferences while maintaining the minimal aesthetic.

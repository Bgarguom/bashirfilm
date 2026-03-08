# Supabase Setup Guide

This guide will help you set up Supabase for the admin dashboard and project management.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in your project details:
   - Name: `bashir-filmmaker` (or your preferred name)
   - Database Password: (save this securely)
   - Region: Choose closest to you
4. Click "Create new project" and wait for it to initialize

## Step 2: Get Your Supabase Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (under "Project API keys")

## Step 3: Configure the Website

1. Open `config.js` in the root directory
2. Replace the placeholder values:
   ```javascript
   const SUPABASE_CONFIG = {
       url: 'YOUR_SUPABASE_URL', // Paste your Project URL here
       anonKey: 'YOUR_SUPABASE_ANON_KEY' // Paste your anon key here
   };
   ```

## Step 4: Create the Database Table

1. In Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Paste and run this SQL:

```sql
-- Create projects table
CREATE TABLE projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    headline TEXT NOT NULL,
    description TEXT NOT NULL,
    client TEXT,
    year TEXT,
    video_url TEXT,
    cover_image TEXT,
    gallery_images TEXT[] DEFAULT '{}',
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index on slug for faster lookups
CREATE INDEX idx_projects_slug ON projects(slug);

-- Create index on featured for faster filtering
CREATE INDEX idx_projects_featured ON projects(featured);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Create policy: Anyone can read projects (public access)
CREATE POLICY "Public projects are viewable by everyone"
    ON projects FOR SELECT
    USING (true);

-- Create policy: Only authenticated users can insert
CREATE POLICY "Authenticated users can insert projects"
    ON projects FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Create policy: Only authenticated users can update
CREATE POLICY "Authenticated users can update projects"
    ON projects FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Create policy: Only authenticated users can delete
CREATE POLICY "Authenticated users can delete projects"
    ON projects FOR DELETE
    USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create site_settings table
CREATE TABLE site_settings (
    id INTEGER PRIMARY KEY DEFAULT 1,
    hero_portrait_image TEXT,
    about_background_image TEXT,
    contact_image TEXT,
    contact_email TEXT,
    contact_phone TEXT,
    contact_whatsapp TEXT,
    contact_instagram TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable Row Level Security (RLS) for site_settings
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Create policy: Anyone can read site settings (public access)
CREATE POLICY "Public site settings are viewable by everyone"
    ON site_settings FOR SELECT
    USING (true);

-- Create policy: Only authenticated users can update site settings
CREATE POLICY "Authenticated users can update site settings"
    ON site_settings FOR UPDATE
    USING (auth.role() = 'authenticated');

-- Create policy: Only authenticated users can insert site settings
CREATE POLICY "Authenticated users can insert site settings"
    ON site_settings FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- Create trigger to automatically update updated_at for site_settings
CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default row
INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
```

## Step 5: Set Up Storage Bucket

1. In Supabase dashboard, go to **Storage**
2. Click "Create bucket"
3. Name: `images`
4. Make it **Public** (so images can be accessed on your website)
5. Click "Create bucket"

6. Go to **Storage** → **Policies** → `images` bucket
7. Create a new policy for public read access:
   - Policy name: `Public Access`
   - Allowed operation: `SELECT`
   - Policy definition: `true` (allow all)
   - Click "Review" and "Save policy"

8. Create a policy for authenticated uploads:
   - Policy name: `Authenticated Upload`
   - Allowed operation: `INSERT`
   - Policy definition: `auth.role() = 'authenticated'`
   - Click "Review" and "Save policy"

9. Create a policy for authenticated updates:
   - Policy name: `Authenticated Update`
   - Allowed operation: `UPDATE`
   - Policy definition: `auth.role() = 'authenticated'`
   - Click "Review" and "Save policy"

10. Create a policy for authenticated deletes:
    - Policy name: `Authenticated Delete`
    - Allowed operation: `DELETE`
    - Policy definition: `auth.role() = 'authenticated'`
    - Click "Review" and "Save policy"

## Step 6: Create Admin User

1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click "Add user" → "Create new user"
3. Enter:
   - Email: (your admin email)
   - Password: (create a strong password)
4. Click "Create user"
5. **Important**: Save these credentials - you'll use them to log into the admin dashboard

## Step 7: Test the Setup

1. Open your website and navigate to `/admin/login.html`
2. Log in with the credentials you just created
3. You should see the dashboard
4. Try creating a test project

## Troubleshooting

### Can't log in?
- Make sure you created the user in Supabase Authentication
- Check that your Supabase URL and key are correct in `config.js`

### Can't upload images?
- Make sure the `images` bucket exists and is public
- Check that storage policies are set correctly
- Verify your user is authenticated

### Projects not showing on public site?
- Check browser console for errors
- Verify RLS policies allow public SELECT
- Make sure Supabase credentials are correct

### Database errors?
- Check the SQL Editor for any error messages
- Verify the table was created successfully
- Check that all columns match the expected schema

## Security Notes

- The `anon` key is safe to use in client-side code (it's public)
- Row Level Security (RLS) ensures only authenticated users can modify data
- Public can only read projects, which is what you want for the portfolio
- Never commit your Supabase credentials to public repositories

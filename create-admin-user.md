# Create Admin User in Supabase

To use the admin dashboard, you need to create an admin user in Supabase with the following credentials:

**Email**: `admin@bashirgarguom.com`  
**Password**: `admin0902`

## Steps:

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Users**
3. Click **"Add user"** → **"Create new user"**
4. Enter:
   - **Email**: `admin@bashirgarguom.com`
   - **Password**: `admin0902`
   - (You can change the password later if needed)
5. Click **"Create user"**

## Alternative: Use Supabase SQL Editor

You can also create the user using SQL:

1. Go to **SQL Editor** in Supabase
2. Run this query:

```sql
-- Create admin user
INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    confirmation_token,
    recovery_token
)
VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@bashirgarguom.com',
    crypt('admin0902', gen_salt('bf')), -- This will hash the password
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    FALSE,
    '',
    ''
);
```

**Note**: The SQL method is more complex. The UI method (steps 1-5 above) is recommended.

## After Creating the User

Once the user is created, you can:
- Log in at `/admin/login.html` with:
  - Email: `admin@bashirgarguom.com`
  - Password: `admin0902`
- Access the dashboard to manage projects

## Security Note

⚠️ **Important**: Change the password to a stronger one after first login for better security.

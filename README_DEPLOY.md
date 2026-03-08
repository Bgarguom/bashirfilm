# 🚀 دليل الرفع السريع - Bashir Garguom Portfolio

## ✅ الملفات جاهزة للرفع!

### 📦 الملفات المطلوبة للرفع:

#### ملفات HTML:
- ✅ `index.html` - الصفحة الرئيسية
- ✅ `projects.html` - صفحة المشاريع
- ✅ `project.html` - صفحة المشروع الواحد
- ✅ `admin/login.html` - صفحة تسجيل الدخول
- ✅ `admin/dashboard.html` - لوحة التحكم

#### ملفات JavaScript:
- ✅ `script.js` - السكريبت الرئيسي
- ✅ `config.js` - إعدادات Supabase
- ✅ `public-api.js` - API للصفحات العامة
- ✅ `video-embed.js` - تضمين الفيديو
- ✅ `admin/admin-dashboard.js` - لوحة التحكم
- ✅ `admin/admin-auth.js` - المصادقة
- ✅ `admin/local-storage.js` - Local Storage API
- ✅ `admin/video-thumbnail.js` - توليد الصور المصغرة

#### ملفات CSS:
- ✅ `styles.css` - الأنماط الرئيسية
- ✅ `admin/admin.css` - أنماط لوحة التحكم

#### ملفات التكوين:
- ✅ `vercel.json` - إعدادات Vercel
- ✅ `netlify.toml` - إعدادات Netlify
- ✅ `package.json` - إعدادات Node.js
- ✅ `.gitignore` - ملفات Git

---

## 🔧 خطوات الرفع:

### الطريقة 1: Vercel (موصى به)

1. **إنشاء حساب Vercel:**
   - اذهب إلى [vercel.com](https://vercel.com)
   - سجل دخول بحساب GitHub/GitLab/Bitbucket

2. **ربط المشروع:**
   - اضغط "New Project"
   - اختر المستودع (Repository)
   - Vercel سيكتشف المشروع تلقائياً

3. **إضافة Environment Variables:**
   - اذهب إلى Project Settings → Environment Variables
   - أضف:
     ```
     SUPABASE_URL = https://your-project.supabase.co
     SUPABASE_ANON_KEY = your-anon-key-here
     ```
   - اختر **Production**, **Preview**, و **Development**

4. **Build Settings:**
   - Build Command: `npm run build` (اختياري)
   - Output Directory: `/` (الجذر)
   - Install Command: `npm install` (إذا استخدمت build script)

5. **Deploy:**
   - اضغط "Deploy"
   - انتظر حتى يكتمل الرفع

---

### الطريقة 2: Netlify

1. **إنشاء حساب Netlify:**
   - اذهب إلى [netlify.com](https://netlify.com)
   - سجل دخول بحساب GitHub/GitLab/Bitbucket

2. **ربط المشروع:**
   - اضغط "Add new site" → "Import an existing project"
   - اختر المستودع

3. **Build Settings:**
   - Build command: `npm run build` (اختياري)
   - Publish directory: `/` (الجذر)

4. **إضافة Environment Variables:**
   - اذهب إلى Site settings → Environment variables
   - أضف:
     ```
     SUPABASE_URL = https://your-project.supabase.co
     SUPABASE_ANON_KEY = your-anon-key-here
     ```

5. **Deploy:**
   - اضغط "Deploy site"
   - انتظر حتى يكتمل الرفع

---

## ⚙️ إعداد Supabase (قبل الرفع):

### 1. إنشاء الجداول:

اذهب إلى Supabase Dashboard → SQL Editor وأشغل:

```sql
-- Projects table
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

-- Site Settings table
CREATE TABLE site_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  hero_portrait_image TEXT,
  about_background_image TEXT,
  contact_image TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  contact_whatsapp TEXT,
  contact_instagram TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default row
INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public projects are viewable by everyone"
  ON projects FOR SELECT USING (true);

CREATE POLICY "Public site settings are viewable by everyone"
  ON site_settings FOR SELECT USING (true);

-- Authenticated write access
CREATE POLICY "Authenticated users can insert projects"
  ON projects FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update projects"
  ON projects FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete projects"
  ON projects FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update site settings"
  ON site_settings FOR UPDATE USING (auth.role() = 'authenticated');
```

### 2. إنشاء Storage Bucket:

1. اذهب إلى **Storage** في Supabase
2. اضغط "Create bucket"
3. الاسم: `images`
4. اجعله **Public**
5. اضغط "Create bucket"

### 3. إنشاء مستخدم Admin:

1. اذهب إلى **Authentication** → **Users**
2. اضغط "Add user" → "Create new user"
3. أدخل:
   - Email: `admin@bashirgarguom.com`
   - Password: `admin0902`
4. اضغط "Create user"

---

## 🔐 بيانات تسجيل الدخول:

- **URL:** `https://your-site.com/admin/login.html`
- **Email:** `admin@bashirgarguom.com`
- **Password:** `admin0902`

⚠️ **مهم:** غيّر كلمة المرور بعد أول تسجيل دخول!

---

## ✅ التحقق بعد الرفع:

1. ✅ افتح الموقع في المتصفح
2. ✅ تحقق من أن الصفحة الرئيسية تعمل
3. ✅ تحقق من صفحة المشاريع
4. ✅ سجّل دخول إلى Dashboard
5. ✅ أضف مشروع تجريبي
6. ✅ تحقق من أن الصور تُرفع بشكل صحيح
7. ✅ اختبر على الهاتف المحمول

---

## 🐛 حل المشاكل:

### المشروع لا يعمل:
- تحقق من Environment Variables في Vercel/Netlify
- تحقق من أن Supabase URL و Key صحيحة
- افتح Console في المتصفح وابحث عن أخطاء

### الصور لا تظهر:
- تحقق من أن Storage bucket اسمه `images` و Public
- تحقق من Storage policies في Supabase

### لا يمكن تسجيل الدخول:
- تحقق من أن المستخدم موجود في Supabase Authentication
- تحقق من أن RLS policies صحيحة

---

## 📝 ملاحظات:

- ✅ الموقع متوافق مع الهاتف بالكامل
- ✅ SEO محسّن
- ✅ Performance محسّن
- ✅ جميع الصفحات responsive
- ✅ Admin Dashboard كامل

---

## 🎉 جاهز للرفع!

جميع الملفات جاهزة. اتبع الخطوات أعلاه للرفع.

**حظاً موفقاً! 🚀**

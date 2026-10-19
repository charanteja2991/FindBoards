# Backend Setup Guide

This document provides step-by-step instructions for setting up the Supabase backend for Board Spot.

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works fine)
- Git (for version control)

---

## Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in the details:
   - **Name**: board-spot (or your preferred name)
   - **Database Password**: Generate a strong password and **save it securely**
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is sufficient for development
4. Click "Create new project" and wait 2-3 minutes for setup

---

## Step 2: Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like `https://xxxxx.supabase.co`)
   - **anon/public key** (under "Project API keys")

---

## Step 3: Configure Environment Variables

1. In your project root, create a `.env` file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your credentials:
   ```bash
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

3. **Important**: Never commit `.env` to git (it's already in `.gitignore`)

---

## Step 4: Run Database Migrations

### Option A: Using Supabase SQL Editor (Recommended for beginners)

1. Go to **SQL Editor** in your Supabase dashboard
2. Click "New query"
3. Copy the contents of `supabase/migrations/20261015_initial_schema.sql`
4. Paste into the editor and click "Run"
5. Repeat for `supabase/migrations/20261015_rls_policies.sql`
6. Verify tables were created under **Table Editor**

### Option B: Using Supabase CLI (Advanced)

1. Install Supabase CLI:
   ```bash
   npm install -g supabase
   ```

2. Link to your project:
   ```bash
   supabase link --project-ref your-project-id
   ```

3. Push migrations:
   ```bash
   supabase db push
   ```

---

## Step 5: Configure Storage

1. In Supabase dashboard, go to **Storage**
2. Click "Create a new bucket"
3. Settings:
   - **Name**: `billboard-images`
   - **Public bucket**: ✅ Yes (images need to be publicly accessible)
   - **File size limit**: 5 MB (adjust as needed)
   - **Allowed MIME types**: `image/jpeg`, `image/png`, `image/webp`
4. Click "Create bucket"

### Set Storage Policies

1. Click on the `billboard-images` bucket
2. Go to **Policies** tab
3. Click "New policy" → "Create a policy from scratch"
4. **Upload policy**:
   ```sql
   CREATE POLICY "Owners can upload images"
   ON storage.objects FOR INSERT
   WITH CHECK (
     bucket_id = 'billboard-images' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );
   ```
5. **Read policy** (already public, no policy needed since bucket is public)
6. **Delete policy**:
   ```sql
   CREATE POLICY "Owners can delete their images"
   ON storage.objects FOR DELETE
   USING (
     bucket_id = 'billboard-images' AND
     auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

---

## Step 6: Configure Authentication

1. Go to **Authentication** → **Providers** in Supabase dashboard
2. **Email provider** is enabled by default
3. (Optional) Enable social login:
   - **Google**: Enable and add OAuth credentials
   - **GitHub**: Enable and add OAuth credentials
4. Go to **Authentication** → **URL Configuration**
5. Add your site URL:
   - **Site URL**: `http://localhost:5173` (for development)
   - **Redirect URLs**: `http://localhost:5173/**` (allow all localhost routes)
6. For production, add your production domain

---

## Step 7: Test the Connection

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Open http://localhost:5173

3. Open browser console and check for errors

4. Try signing up:
   - Go to `/auth` page
   - Create a test account
   - Check **Authentication** → **Users** in Supabase dashboard
   - Verify a profile was created in **Table Editor** → **profiles**

---

## Step 8: Seed Sample Data (Optional)

To test the UI with real data:

1. Create a sample billboard manually:
   - Sign in to your app
   - In Supabase dashboard, go to **Table Editor** → **user_roles**
   - Add a row: `user_id` = your user ID, `role` = 'owner'
   - Refresh your app (you should now see owner features)

2. Or use the SQL editor to insert sample data:
   ```sql
   -- Insert a sample billboard (replace USER_ID with your actual user ID)
   INSERT INTO billboards (
     owner_id, title, description, billboard_type,
     address, city, country, latitude, longitude,
     width, height, dimension_unit, price, price_period,
     min_booking_days, status, is_featured
   ) VALUES (
     'USER_ID',
     'Highway Billboard - NH48',
     'Premium location on National Highway 48',
     'highway',
     'NH48, Sector 18',
     'Gurgaon',
     'India',
     28.4595, 77.0266,
     40, 20, 'ft',
     150000, 'monthly',
     7, 'published', true
   ) RETURNING id;
   
   -- Insert sample images (replace BILLBOARD_ID)
   INSERT INTO billboard_images (billboard_id, url, is_cover, sort_order)
   VALUES 
     ('BILLBOARD_ID', 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64', true, 0),
     ('BILLBOARD_ID', 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f', false, 1);
   ```

---

## Step 9: Verify Everything Works

Test these features:

- ✅ **Sign up** → Creates profile + user_roles entry
- ✅ **Sign in** → User data loads correctly
- ✅ **Browse page** → Shows billboards from database
- ✅ **Billboard detail** → Shows full billboard info
- ✅ **Save billboard** → Adds to saved_billboards table
- ✅ **Owner dashboard** → Shows "Add role" if not owner yet

---

## Troubleshooting

### Error: "Missing Supabase environment variables"
- Make sure `.env` file exists in project root
- Check that variable names start with `VITE_`
- Restart dev server after changing `.env`

### Error: "relation 'profiles' does not exist"
- Migrations didn't run successfully
- Re-run the migration SQL files in Supabase SQL Editor

### Images not uploading
- Check that `billboard-images` bucket exists and is public
- Verify storage policies are set correctly

### RLS policy errors
- Check that RLS policies were created (run `20261015_rls_policies.sql`)
- Test with Supabase Table Editor's "RLS enabled" toggle

### Auth not working
- Verify redirect URLs are configured in Supabase
- Check browser console for CORS errors
- Make sure site URL matches your dev server

---

## Production Deployment

Before deploying to production:

1. Update **Site URL** and **Redirect URLs** in Supabase Auth settings
2. Set production environment variables on your hosting platform
3. Consider enabling:
   - Email confirmation for new signups
   - Rate limiting on auth endpoints
   - Better password policies
4. Set up database backups (Supabase Pro plan)
5. Configure custom domain for Supabase project (optional)

---

## Security Checklist

- ✅ RLS policies enabled on all tables
- ✅ Anon key is used (not service_role key) in frontend
- ✅ `.env` file is in `.gitignore`
- ✅ Storage bucket policies restrict who can upload/delete
- ✅ Auth redirect URLs are whitelisted

---

## Next Steps

- [ ] Implement booking request flow
- [ ] Add payment integration (Stripe/Razorpay)
- [ ] Set up email notifications (Supabase Edge Functions)
- [ ] Add real-time updates for bookings
- [ ] Implement admin dashboard
- [ ] Add analytics tracking

---

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)

---

**Need Help?** Check the [Supabase Discord](https://discord.supabase.com) or [GitHub Discussions](https://github.com/supabase/supabase/discussions)

# Backend Integration Summary

## Overview

Board Spot now has **full Supabase backend integration** ready to use. The frontend is connected to a PostgreSQL database with authentication, storage, and API layer.

---

## What's Been Implemented

### 1. Database Schema ✅
- **10 tables** with full relationships
- **Enums** for type safety (billboard types, statuses, roles)
- **Indexes** for performance
- **Triggers** for auto-updating timestamps and profile creation
- **Full-text search** on billboards

**Tables:**
- `profiles` - User profiles
- `user_roles` - Multi-role support (admin/owner/advertiser)
- `billboards` - Billboard listings
- `billboard_images` - Photo gallery
- `billboard_availability` - Date ranges
- `saved_billboards` - User favorites
- `booking_requests` - Booking inquiries
- `bookings` - Confirmed bookings
- `notifications` - In-app notifications
- `reviews` - Billboard reviews

### 2. Row-Level Security (RLS) ✅
- **All tables protected** with RLS policies
- Public can view published billboards
- Owners can manage their own listings
- Advertisers can save billboards and make requests
- Users can only see their own bookings and notifications

### 3. Authentication ✅
- **Supabase Auth** integrated
- Email/password sign up and sign in
- Auto-creates profile on signup
- Session management with auto-refresh
- Auth context with React hooks

### 4. API Layer ✅
**File:** `src/lib/api.ts`

**Functions implemented:**
- `fetchPublicBillboards(filters)` - Browse with filters
- `fetchBillboardDetail(id)` - Get full billboard details
- `fetchFeaturedBillboards(limit)` - Homepage featured
- `fetchPopularCities()` - City aggregation
- `fetchSavedBillboards(userId)` - User's saved list
- `saveBillboard(userId, billboardId)` - Save a billboard
- `unsaveBillboard(userId, billboardId)` - Remove from saved
- `fetchMyBillboards(ownerId)` - Owner's listings
- `createBillboard(data)` - Add new billboard
- `updateBillboard(id, updates)` - Edit billboard
- `deleteBillboard(id)` - Remove billboard
- `uploadBillboardImage(file, billboardId)` - Image upload
- `addBillboardImage(data)` - Add image record
- `deleteBillboardImage(id)` - Remove image

### 5. Storage ✅
- **Bucket:** `billboard-images`
- Public access for viewing
- Owner-only upload/delete policies
- Organized by billboard ID

### 6. TypeScript Types ✅
**File:** `src/lib/database.types.ts`
- Complete type definitions for all tables
- Auto-generated types matching database schema
- Type-safe queries with Supabase client

### 7. Updated Components ✅
- **AuthProvider** (`src/lib/auth.tsx`) - Real authentication
- **AuthPage** (`src/pages/AuthPage.tsx`) - Sign in/up forms
- **AccountPage** (`src/pages/AccountPage.tsx`) - Shows user roles
- **useSavedBillboard** hook for save/unsave functionality

---

## Files Created

```
Backend files:
├── .env.example                                   # Environment template
├── setup-backend.sh                              # Setup wizard script
├── BACKEND_SETUP.md                              # Detailed setup guide
├── supabase/
│   ├── migrations/
│   │   ├── 20261015_initial_schema.sql          # Database schema
│   │   └── 20261015_rls_policies.sql            # Security policies
│   └── seed.sql                                  # Sample data

Frontend integration:
├── src/lib/
│   ├── supabase.ts                               # Supabase client
│   ├── database.types.ts                         # TypeScript types
│   ├── api.ts                                    # API functions
│   └── auth.tsx                                  # Updated auth context
├── src/hooks/
│   └── useSavedBillboard.ts                     # Saved billboard hook
└── src/pages/
    ├── AuthPage.tsx                              # Updated sign in/up
    └── AccountPage.tsx                           # Updated with roles
```

---

## How to Get Started

### Option 1: Quick Setup (Recommended)
```bash
./setup-backend.sh
```
The wizard will guide you through:
1. Creating `.env` file with your Supabase credentials
2. Running database migrations
3. Setting up storage
4. Configuring authentication

### Option 2: Manual Setup
See [BACKEND_SETUP.md](BACKEND_SETUP.md) for step-by-step instructions.

---

## Environment Variables Required

Create a `.env` file in the project root:

```bash
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Optional:
# VITE_GOOGLE_MAPS_API_KEY=your-google-maps-key
```

Get these from your Supabase project dashboard → Settings → API.

---

## Testing the Integration

### 1. Start the dev server
```bash
npm run dev
```

### 2. Create an account
- Go to http://localhost:5173/auth
- Sign up with email and password
- Check your email for confirmation (if email confirmation is enabled)

### 3. Verify in Supabase
- Go to your Supabase dashboard
- Check **Authentication → Users** - your user should be there
- Check **Table Editor → profiles** - profile auto-created
- Check **Table Editor → user_roles** - you can add roles manually here

### 4. Add sample data (optional)
Run `supabase/seed.sql` in the SQL Editor to get test billboards.

### 5. Test features
- Browse billboards (public, no auth needed)
- Sign in to save billboards
- Add "owner" role to see owner features
- Add "advertiser" role to see saved billboards

---

## What Still Needs Implementation

### High Priority
1. **Browse page integration** - Replace mock data with `fetchPublicBillboards()`
2. **Billboard detail page** - Replace mock data with `fetchBillboardDetail()`
3. **Homepage** - Use `fetchFeaturedBillboards()` and `fetchPopularCities()`
4. **Saved page** - Use `fetchSavedBillboards(userId)`
5. **Save button** - Use `useSavedBillboard()` hook

### Medium Priority
6. **My Billboards page** - Use `fetchMyBillboards(ownerId)`
7. **Billboard wizard** - 7-step form to create billboards
8. **Owner dashboard** - Stats and analytics
9. **Profile page** - Edit user profile with `supabase.from('profiles').update()`
10. **Add role functionality** - Insert into `user_roles` table

### Low Priority (Future Features)
11. **Booking requests** - Full booking flow
12. **Payments** - Stripe/Razorpay integration
13. **Notifications** - Real-time with Supabase Realtime
14. **Email** - Send emails via Supabase Edge Functions
15. **Admin panel** - Approve/reject listings
16. **Reviews** - Post-campaign reviews
17. **Analytics** - Track views, clicks, conversions

---

## API Usage Examples

### Fetch billboards with filters
```typescript
import { fetchPublicBillboards } from '@/lib/api';

const billboards = await fetchPublicBillboards({
  city: 'Hyderabad',
  type: ['highway', 'digital'],
  minPrice: 50000,
  maxPrice: 200000,
  illuminated: true,
  sort: 'price-low'
});
```

### Save/unsave a billboard
```typescript
import { useSavedBillboard } from '@/hooks/useSavedBillboard';

function BillboardCard({ billboardId }) {
  const { isSaved, toggleSaved, loading } = useSavedBillboard(billboardId);
  
  return (
    <button onClick={toggleSaved} disabled={loading}>
      {isSaved ? 'Saved ❤️' : 'Save'}
    </button>
  );
}
```

### Create a billboard
```typescript
import { createBillboard } from '@/lib/api';

const { data, error } = await createBillboard({
  owner_id: user.id,
  title: 'My Billboard',
  city: 'Mumbai',
  address: '123 Main St',
  latitude: 19.0760,
  longitude: 72.8777,
  width: 40,
  height: 20,
  price: 100000,
  price_period: 'monthly',
  billboard_type: 'highway',
  min_booking_days: 7
});
```

### Upload billboard image
```typescript
import { uploadBillboardImage, addBillboardImage } from '@/lib/api';

// Upload file to storage
const { url, error } = await uploadBillboardImage(file, billboardId);

// Add database record
if (url) {
  await addBillboardImage({
    billboard_id: billboardId,
    url: url,
    is_cover: true,
    sort_order: 0
  });
}
```

---

## Security Notes

✅ **RLS enabled** - All data access is controlled by policies  
✅ **Anon key used** - Frontend uses public key only  
✅ **Storage policies** - Users can only delete their own images  
✅ **No service_role key** - Never expose admin key to frontend  
✅ **HTTPS only** - Supabase enforces secure connections  

---

## Database Migrations

Migrations are in `supabase/migrations/`:

1. **20261015_initial_schema.sql** - Creates all tables, indexes, triggers
2. **20261015_rls_policies.sql** - Sets up Row-Level Security

To run migrations:
- **Supabase Dashboard**: Copy SQL into SQL Editor and run
- **Supabase CLI**: `supabase db push` (after linking project)

---

## Storage Structure

```
billboard-images/
├── billboard-uuid-1/
│   ├── 1697123456789.jpg
│   ├── 1697123457890.jpg
│   └── 1697123458991.jpg
└── billboard-uuid-2/
    └── 1697123459012.jpg
```

Each billboard gets its own folder for organization.

---

## Troubleshooting

### "Missing Supabase environment variables"
- Create `.env` file in project root
- Variable names must start with `VITE_`
- Restart dev server after changing `.env`

### "relation 'profiles' does not exist"
- Migrations didn't run
- Go to Supabase SQL Editor
- Run both migration files in order

### Auth not working
- Check redirect URLs in Supabase Auth settings
- Add `http://localhost:5173/**` to redirect URLs
- Clear browser cookies and try again

### Images not uploading
- Verify `billboard-images` bucket exists and is public
- Check storage policies are set correctly
- Test with a small image first (< 1MB)

### RLS policy errors
- Verify policies were created (run `20261015_rls_policies.sql`)
- Check user is logged in (`supabase.auth.getUser()`)
- View RLS logs in Supabase dashboard

---

## Production Checklist

Before deploying to production:

- [ ] Update Site URL in Supabase Auth settings
- [ ] Add production domain to Redirect URLs
- [ ] Set production environment variables on hosting platform
- [ ] Enable email confirmation for new signups
- [ ] Set up database backups
- [ ] Configure custom domain for Supabase (optional)
- [ ] Enable rate limiting on auth endpoints
- [ ] Review and test all RLS policies
- [ ] Set up monitoring and error tracking
- [ ] Test payment integration (if implemented)

---

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Storage Guide](https://supabase.com/docs/guides/storage)
- [Board Spot Backend Setup](BACKEND_SETUP.md)
- [Board Spot Database Schema](DATABASE.md)

---

**Status**: Backend integration complete ✅  
**Next Step**: Replace mock data in frontend pages with API calls  
**Timeline**: Ready for development and testing

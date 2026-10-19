# TODO — Board Spot Implementation Roadmap

**Project**: Board Spot  
**Last Updated**: October 14, 2026  
**Current Phase**: Phase 1 Complete (UI)

---

## ✅ Phase 1: Frontend UI (COMPLETE)

### Core Pages
- [x] Homepage with hero, search bar, featured billboards
- [x] Browse page with filters and grid
- [x] Billboard detail page with gallery and info
- [x] Authentication placeholder page
- [x] Owner dashboard (placeholder)
- [x] My Billboards page (empty state)
- [x] Saved billboards page (empty state)
- [x] Advertiser account page (placeholder)
- [x] Profile page (form without save)
- [x] 404 page

### Components
- [x] Responsive header with mobile menu
- [x] Footer with links
- [x] Billboard card component
- [x] Search bar with filters
- [x] Filter panel (8 filter types)
- [x] Save/heart button
- [x] Auth modal (stub)
- [x] Toast notifications (Sonner)

### Infrastructure
- [x] Vite + React 19 setup
- [x] TypeScript strict mode
- [x] Tailwind CSS v4 with design tokens
- [x] React Router v7 routing
- [x] shadcn/ui components
- [x] Mock data layer (6 billboards)
- [x] Build pipeline working

### Documentation
- [x] README.md
- [x] IMPLEMENTATION_REPORT.md
- [x] CLAUDE.md
- [x] PRD.md
- [x] ARCHITECTURE.md
- [x] DATABASE.md
- [x] TODO.md (this file)

---

## 🚧 Phase 2: Backend Setup (IN PROGRESS)

**Priority**: HIGH  
**Estimated Time**: 2-3 weeks

### 2.1 Choose Backend Stack
- [ ] **Decision**: Supabase vs Firebase vs Custom API
  - **Recommended**: Supabase (PostgreSQL + Auth + Storage + Realtime)
  - **Alternative 1**: Firebase (NoSQL + Auth + Storage)
  - **Alternative 2**: Custom API (Next.js API routes + PostgreSQL + AWS S3)

### 2.2 Database Setup
- [ ] Create database instance (Supabase project or PostgreSQL server)
- [ ] Run schema migrations from `DATABASE.md`
  - [ ] Create `profiles` table
  - [ ] Create `user_roles` table
  - [ ] Create `billboards` table
  - [ ] Create `billboard_images` table
  - [ ] Create `billboard_availability` table
  - [ ] Create `saved_billboards` table
  - [ ] Create `booking_requests` table
  - [ ] Create `bookings` table (future)
- [ ] Set up indexes (city, price, dates)
- [ ] Configure Row-Level Security (RLS) policies
- [ ] Create database views (billboard_stats)
- [ ] Seed with test data (10-20 billboards)

### 2.3 File Storage
- [ ] Set up storage bucket for billboard images
- [ ] Configure CORS for uploads
- [ ] Set up CDN (Cloudflare or CloudFront)
- [ ] Implement image optimization pipeline
  - [ ] Resize on upload (multiple sizes)
  - [ ] Convert to WebP
  - [ ] Generate thumbnails

### 2.4 Environment Configuration
- [ ] Create `.env.example` template
- [ ] Add environment variables:
  ```bash
  VITE_SUPABASE_URL=
  VITE_SUPABASE_ANON_KEY=
  VITE_GOOGLE_MAPS_API_KEY=
  VITE_API_BASE_URL=
  ```
- [ ] Configure Vite to load env vars
- [ ] Add `.env` to `.gitignore`

---

## 🔐 Phase 3: Authentication (NEXT)

**Priority**: HIGH  
**Estimated Time**: 1 week

### 3.1 Auth Provider Integration
- [ ] Replace stub `src/lib/auth.tsx` with real auth
- [ ] Implement `AuthProvider` with:
  - [ ] Email + password sign up
  - [ ] Email + password sign in
  - [ ] Google OAuth
  - [ ] Password reset flow
  - [ ] Email verification
  - [ ] Session persistence

### 3.2 Auth UI
- [ ] Build real `AuthForm` component
  - [ ] Sign up form with role selection (advertiser/owner)
  - [ ] Sign in form
  - [ ] Password reset form
  - [ ] Email verification notice
- [ ] Update `AuthModal` to show real form
- [ ] Add loading and error states
- [ ] Add success redirects

### 3.3 Protected Routes
- [ ] Create `OwnerGuard` component
  - [ ] Check user has owner role
  - [ ] Redirect to `/auth` if not signed in
  - [ ] Show "not authorized" if wrong role
- [ ] Create `AdvertiserGuard` component
  - [ ] Check user is signed in
  - [ ] Redirect to `/auth` if not
- [ ] Wrap protected routes:
  - [ ] `/dashboard` → OwnerGuard
  - [ ] `/my-billboards` → OwnerGuard
  - [ ] `/saved` → AdvertiserGuard
  - [ ] `/account` → AdvertiserGuard
  - [ ] `/profile` → AdvertiserGuard

### 3.4 Profile Management
- [ ] Implement profile creation on signup
- [ ] Build profile edit functionality
- [ ] Add avatar upload
- [ ] Update profile form save handler
- [ ] Add profile completion indicator

---

## 📊 Phase 4: Data Layer (CRITICAL)

**Priority**: HIGH  
**Estimated Time**: 1 week

### 4.1 API Client Setup
- [ ] Create `src/lib/api.ts` (or keep Supabase client)
- [ ] Add error handling wrapper
- [ ] Add request interceptors (auth headers)
- [ ] Add response interceptors (error toast)

### 4.2 Replace Mock Data Functions
- [ ] **File**: `src/lib/mock-data.ts` → `src/lib/api.ts`
- [ ] `fetchPublicBillboards(filters)` → Real API call
  - [ ] Map filters to query params
  - [ ] Handle pagination
  - [ ] Include billboard_images relation
- [ ] `fetchBillboardDetail(id)` → Real API call
  - [ ] Join with owner profile
  - [ ] Join with availability slots
  - [ ] Join with images
- [ ] `fetchFeaturedBillboards(limit)` → Real API call
  - [ ] Filter by `is_featured = true`
  - [ ] Order by created_at DESC
- [ ] `fetchPopularCities()` → Real API call
  - [ ] Aggregate billboards by city
  - [ ] Count per city
  - [ ] Return top 6

### 4.3 Add State Management (React Query)
- [ ] Install `@tanstack/react-query`
- [ ] Set up `QueryClient` in `main.tsx`
- [ ] Convert pages to use `useQuery`:
  - [ ] `HomePage` → featured billboards query
  - [ ] `BrowsePage` → billboards query with filters
  - [ ] `BillboardDetailPage` → billboard detail query
- [ ] Add loading states (skeletons)
- [ ] Add error states (retry buttons)
- [ ] Add optimistic updates for saves

### 4.4 Update All Page Components
- [ ] `src/pages/HomePage.tsx` - Use real queries
- [ ] `src/pages/BrowsePage.tsx` - Use real queries
- [ ] `src/pages/BillboardDetailPage.tsx` - Use real queries
- [ ] `src/pages/SavedPage.tsx` - Fetch user's saved billboards
- [ ] `src/pages/MyBillboardsPage.tsx` - Fetch owner's billboards
- [ ] `src/pages/DashboardPage.tsx` - Fetch owner stats
- [ ] `src/pages/AccountPage.tsx` - Fetch advertiser stats
- [ ] `src/pages/ProfilePage.tsx` - Load and save profile

---

## 🎨 Phase 5: Owner Features

**Priority**: MEDIUM  
**Estimated Time**: 2 weeks

### 5.1 Billboard Wizard (7 Steps)
- [ ] Create `src/components/owner/BillboardWizard.tsx`
- [ ] **Step 1: Basics**
  - [ ] Title input (required)
  - [ ] Description textarea
  - [ ] Billboard type select (8 options)
- [ ] **Step 2: Location**
  - [ ] Address input (required)
  - [ ] Area, city, state, country inputs
  - [ ] Google Maps location picker (drag marker)
  - [ ] Lat/lng manual inputs
- [ ] **Step 3: Dimensions**
  - [ ] Width and height number inputs
  - [ ] Unit toggle (ft/m)
  - [ ] Illumination switch
- [ ] **Step 4: Pricing**
  - [ ] Price number input
  - [ ] Period select (daily/weekly/monthly/yearly)
  - [ ] Minimum booking days input
- [ ] **Step 5: Photos**
  - [ ] Drag-and-drop upload zone
  - [ ] Multiple file selection
  - [ ] Image preview with reorder
  - [ ] Set cover image
  - [ ] Delete image
  - [ ] Upload progress indicators
- [ ] **Step 6: Availability**
  - [ ] Calendar date range picker
  - [ ] Add available range button
  - [ ] Add blocked range button
  - [ ] List of date ranges with edit/delete
  - [ ] Validate no overlaps
- [ ] **Step 7: Review**
  - [ ] Preview card showing final listing
  - [ ] "Save as Draft" button
  - [ ] "Publish" button
- [ ] Form validation per step
- [ ] Progress indicator (breadcrumbs)
- [ ] Save draft to localStorage (auto-save)
- [ ] Submit to API on publish

### 5.2 Google Maps Integration
- [ ] Get Google Maps API key
- [ ] Add to `.env`
- [ ] Create `src/lib/google-maps.ts` loader
- [ ] Create `LocationPicker` component
  - [ ] Map with draggable marker
  - [ ] Search/autocomplete for addresses
  - [ ] Reverse geocoding (click → address)
- [ ] Create `BillboardMap` component (detail page)
  - [ ] Map view (marker at location)
  - [ ] Street View
  - [ ] "Open in Google Maps" link

### 5.3 My Billboards Management
- [ ] Fetch owner's billboards from API
- [ ] Show list with images, status badges
- [ ] Add "Edit" button → navigate to edit page
- [ ] Add "Publish/Unpublish" toggle
- [ ] Add "Delete" button with confirmation dialog
- [ ] Implement delete mutation
- [ ] Show stats per billboard (views, saves)
- [ ] Add filters: All, Published, Drafts

### 5.4 Billboard Edit Page
- [ ] Create `/billboards/:id/edit` route
- [ ] Fetch existing billboard data
- [ ] Pre-fill wizard with existing data
- [ ] Show existing images
- [ ] Allow image deletion (with storage cleanup)
- [ ] Submit as PATCH to API
- [ ] Redirect to My Billboards on success

### 5.5 Owner Dashboard
- [ ] Fetch owner stats from API:
  - [ ] Total billboards
  - [ ] Published count
  - [ ] Drafts count
  - [ ] Pending requests count
  - [ ] Accepted bookings count
- [ ] Show stat cards
- [ ] Add quick action links
- [ ] Show recent activity feed (optional)

---

## 💼 Phase 6: Advertiser Features

**Priority**: MEDIUM  
**Estimated Time**: 1 week

### 6.1 Save/Favorite Functionality
- [ ] Implement `useSavedIds` hook (fetch saved IDs)
- [ ] Update `SaveButton` component:
  - [ ] Check if billboard is saved
  - [ ] Toggle save on click (mutation)
  - [ ] Optimistic UI update
  - [ ] Show toast on success/error
- [ ] Update `SavedPage`:
  - [ ] Fetch user's saved billboards
  - [ ] Show grid of saved cards
  - [ ] Add "Remove" button per card
  - [ ] Handle empty state

### 6.2 Booking Request Flow
- [ ] Create `RequestForm` component
  - [ ] Date range picker (start/end)
  - [ ] Campaign name input
  - [ ] Message textarea
  - [ ] Submit button
- [ ] Add "Request Booking" button to detail page
- [ ] Open modal/sheet with RequestForm
- [ ] Validate dates against availability
- [ ] Submit request to API
- [ ] Show confirmation toast
- [ ] Redirect to account page

### 6.3 Advertiser Account Page
- [ ] Fetch advertiser stats:
  - [ ] Saved count
  - [ ] Sent requests count
  - [ ] Active bookings count
- [ ] Show stat cards
- [ ] Add quick links to saved, profile
- [ ] Show booking requests list (future)

### 6.4 Profile Page
- [ ] Load user profile on mount
- [ ] Pre-fill form fields
- [ ] Implement save handler (API call)
- [ ] Show loading state while saving
- [ ] Show success toast
- [ ] Update auth context with new profile data

---

## 📨 Phase 7: Booking System

**Priority**: LOW (Future)  
**Estimated Time**: 2 weeks

### 7.1 Owner Booking Request Inbox
- [ ] Fetch incoming requests for owner's billboards
- [ ] Show list with advertiser info, dates, message
- [ ] Add filters: Pending, Accepted, Declined
- [ ] Add "Accept" button
- [ ] Add "Decline" button with optional message
- [ ] Add "Counter-offer" button (optional)
- [ ] Send email notification to advertiser

### 7.2 Advertiser Request Tracking
- [ ] Fetch sent requests from API
- [ ] Show status: Pending, Accepted, Declined
- [ ] Show owner response message
- [ ] Add "Cancel" button for pending requests
- [ ] Show accepted requests separately

### 7.3 Booking Confirmation
- [ ] Convert accepted request → booking record
- [ ] Generate booking ID
- [ ] Create booking agreement (PDF)
- [ ] Send email with agreement
- [ ] Block dates in availability (auto)

### 7.4 Booking Management
- [ ] Owner: View active bookings
- [ ] Advertiser: View active bookings
- [ ] Show booking timeline
- [ ] Add "Mark as Complete" (post-campaign)
- [ ] Add dispute button (if issues)

---

## 💳 Phase 8: Payments (Future)

**Priority**: LOW  
**Estimated Time**: 2 weeks

### 8.1 Payment Gateway Integration
- [ ] Choose gateway: Razorpay or Stripe
- [ ] Create account and get API keys
- [ ] Add to environment variables
- [ ] Install SDK (`razorpay` or `@stripe/stripe-js`)

### 8.2 Payment Flow
- [ ] Add "Proceed to Payment" button on accepted booking
- [ ] Show payment breakdown:
  - [ ] Billboard cost
  - [ ] Platform fee (5-10%)
  - [ ] Total amount
- [ ] Integrate payment gateway checkout
- [ ] Handle payment success callback
- [ ] Update booking payment_status
- [ ] Send payment confirmation email

### 8.3 Owner Payouts
- [ ] Collect owner bank details (KYC)
- [ ] Calculate owner payout (booking amount - platform fee)
- [ ] Integrate payout API (Razorpay X or Stripe Connect)
- [ ] Schedule payouts (weekly/monthly)
- [ ] Show payout history to owner

---

## 📧 Phase 9: Notifications & Email

**Priority**: MEDIUM  
**Estimated Time**: 1 week

### 9.1 Email Service Setup
- [ ] Choose: SendGrid, Resend, or AWS SES
- [ ] Create account and get API key
- [ ] Design email templates:
  - [ ] Welcome email
  - [ ] Email verification
  - [ ] Password reset
  - [ ] Booking request received (owner)
  - [ ] Booking request accepted (advertiser)
  - [ ] Booking confirmation
  - [ ] Payment confirmation

### 9.2 In-App Notifications
- [ ] Create notifications table (see DATABASE.md)
- [ ] Add notification bell icon to header
- [ ] Fetch unread count
- [ ] Show dropdown with recent notifications
- [ ] Mark as read on click
- [ ] Link to related resource (booking, billboard)

### 9.3 Notification Triggers
- [ ] New booking request → notify owner
- [ ] Request accepted/declined → notify advertiser
- [ ] New message → notify recipient
- [ ] Booking starting soon → notify both parties
- [ ] Payment received → notify owner

---

## 🔍 Phase 10: Search & Discovery

**Priority**: MEDIUM  
**Estimated Time**: 1 week

### 10.1 Advanced Search
- [ ] Full-text search on title, description, address
- [ ] Implement PostgreSQL `to_tsvector` index
- [ ] Add search suggestions (autocomplete)
- [ ] Show search result count
- [ ] Highlight search terms in results

### 10.2 Filters Enhancement
- [ ] Add map view (show pins on map)
- [ ] Add "Near me" geolocation filter
- [ ] Add distance filter (within X km)
- [ ] Save filter presets (user preference)
- [ ] Show applied filters as chips

### 10.3 Recommendations
- [ ] "Similar billboards" on detail page
- [ ] "Because you saved..." personalized recs
- [ ] Trending billboards (most viewed/saved)
- [ ] Recently viewed history

---

## 🎯 Phase 11: Analytics & Admin

**Priority**: LOW  
**Estimated Time**: 1 week

### 11.1 Owner Analytics
- [ ] Views per billboard (track with counter)
- [ ] Saves per billboard
- [ ] Conversion rate (views → requests)
- [ ] Revenue chart (last 30 days)
- [ ] Top-performing billboards

### 11.2 Admin Panel
- [ ] Create `/admin` route (admin role only)
- [ ] User management:
  - [ ] List all users
  - [ ] Ban/suspend accounts
  - [ ] View user details
- [ ] Content moderation:
  - [ ] Approve/reject new billboards
  - [ ] Review flagged content
  - [ ] Edit inappropriate listings
- [ ] Platform analytics:
  - [ ] Total users, billboards, bookings
  - [ ] GMV (Gross Merchandise Value)
  - [ ] Platform fees collected
  - [ ] Growth charts

---

## 🚀 Phase 12: Optimization & Launch

**Priority**: HIGH (Pre-Launch)  
**Estimated Time**: 1 week

### 12.1 Performance
- [ ] Add route-based code splitting (React.lazy)
- [ ] Implement image lazy loading
- [ ] Add service worker (PWA)
- [ ] Optimize bundle size (analyze with `vite-bundle-visualizer`)
- [ ] Add CDN for static assets
- [ ] Implement Redis caching (featured billboards, cities)

### 12.2 SEO
- [ ] Add meta tags per page (title, description, OG)
- [ ] Generate `sitemap.xml`
- [ ] Add structured data (JSON-LD) for billboards
- [ ] Set up Google Search Console
- [ ] Add canonical URLs
- [ ] Implement SSR for public pages (Next.js migration?)

### 12.3 Testing
- [ ] Unit tests for utilities (Vitest)
- [ ] Component tests (React Testing Library)
- [ ] E2E tests (Playwright):
  - [ ] Browse → detail → save flow
  - [ ] Sign up → create billboard flow
  - [ ] Booking request flow
- [ ] Load testing (k6 or Artillery)
- [ ] Accessibility audit (axe DevTools)

### 12.4 Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Set up analytics (Google Analytics or Plausible)
- [ ] Set up performance monitoring (Vercel Analytics)
- [ ] Set up uptime monitoring (UptimeRobot)
- [ ] Create status page (status.boardspot.com)

### 12.5 Documentation
- [ ] API documentation (if custom backend)
- [ ] User guides (how to list a billboard)
- [ ] FAQ page
- [ ] Terms of service
- [ ] Privacy policy

### 12.6 Deployment
- [ ] Choose hosting: Vercel, Netlify, or Cloudflare Pages
- [ ] Set up production environment variables
- [ ] Configure custom domain (boardspot.com)
- [ ] Set up SSL certificate (auto with hosting)
- [ ] Configure CDN
- [ ] Set up CI/CD pipeline (GitHub Actions)
- [ ] Deploy!

---

## 🔮 Future Enhancements (Post-Launch)

### Mobile App
- [ ] React Native app (iOS + Android)
- [ ] Push notifications
- [ ] Offline mode
- [ ] Camera integration (upload from phone)

### Advanced Features
- [ ] Bulk upload (CSV import for owners)
- [ ] API for third-party integrations
- [ ] Dynamic pricing suggestions (AI-powered)
- [ ] Computer vision (verify billboard from photo)
- [ ] Virtual tours (360° photos)
- [ ] Programmatic buying (DSP integration)

### Internationalization
- [ ] Multi-language support (Hindi, Tamil, etc.)
- [ ] Multi-currency (USD, EUR, etc.)
- [ ] Localized content

### Marketing
- [ ] Referral program
- [ ] Affiliate program
- [ ] Email campaigns
- [ ] Social media integrations

---

## 📝 Notes

### Current Blockers
1. **Backend not chosen** - Blocks Phase 2-12
2. **No Google Maps API key** - Blocks owner wizard location picker
3. **No payment gateway account** - Blocks Phase 8

### Quick Wins (Easy Tasks)
- [ ] Add favicon (create or use icon generator)
- [ ] Add loading skeletons instead of "Loading..."
- [ ] Add 404 illustration
- [ ] Add footer social links
- [ ] Add "Contact us" page

### Technical Debt
- [ ] Add proper error boundaries
- [ ] Add retry logic for failed API calls
- [ ] Add request timeout handling
- [ ] Add offline indicator
- [ ] Migrate from CRA to Next.js (for SSR)

---

## Progress Tracking

**Phase 1**: ████████████████████ 100% (Complete)  
**Phase 2**: ░░░░░░░░░░░░░░░░░░░░ 0% (Not Started)  
**Phase 3**: ░░░░░░░░░░░░░░░░░░░░ 0% (Not Started)  
**Overall**: ███░░░░░░░░░░░░░░░░░ 15% (1 of 7 phases complete)

---

**Last Updated**: October 14, 2026  
**Next Milestone**: Choose backend stack (Phase 2.1)

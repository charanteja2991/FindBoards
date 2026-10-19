# Product Requirements Document (PRD)
## Board Spot — Billboard Advertising Marketplace

**Version**: 1.0  
**Last Updated**: October 14, 2026  
**Status**: Phase 1 Complete (UI), Phase 2 Pending (Backend)

---

## Executive Summary

Board Spot is a two-sided marketplace connecting **advertisers** who need outdoor advertising space with **billboard owners** who have inventory to rent. The platform enables discovery, comparison, and booking of billboards, digital screens, and transit media across India.

---

## Problem Statement

### For Advertisers
- Hard to find available billboard inventory
- No centralized platform to compare locations and pricing
- Opaque booking process through multiple brokers
- Limited visibility into actual billboard locations and conditions

### For Billboard Owners
- Difficulty reaching potential advertisers
- Manual inquiry handling
- No digital presence for their inventory
- Inefficient booking management

---

## Solution

A web-based marketplace that:
1. **Aggregates** billboard inventory from multiple owners
2. **Enables search and filtering** by location, price, size, type, availability
3. **Provides transparency** with photos, exact locations, pricing, and availability
4. **Facilitates booking** through in-platform requests and communication
5. **Supports owner management** with listing tools and request handling

---

## User Personas

### Primary: Advertiser (Demand Side)
- **Who**: Marketing managers, ad agencies, brand managers
- **Goals**: Find and book billboards for campaigns
- **Pain Points**: Time-consuming research, lack of transparency, multiple brokers
- **Success Metrics**: Time to find suitable billboard, booking completion rate

### Primary: Billboard Owner (Supply Side)
- **Who**: Outdoor media companies, property owners, media agencies
- **Goals**: List inventory, receive booking requests, maximize occupancy
- **Pain Points**: Manual listing updates, inquiry handling, payment tracking
- **Success Metrics**: Listing views, booking requests received, occupancy rate

### Secondary: Platform Admin
- **Who**: Board Spot team
- **Goals**: Ensure quality listings, resolve disputes, moderate content
- **Pain Points**: Manual approval workflows, fraud prevention
- **Success Metrics**: Listing approval time, user satisfaction, platform GMV

---

## User Roles

| Role | Access | Key Actions |
|---|---|---|
| **Guest** | Public browsing | Search, filter, view details |
| **Advertiser** | Registered user | Save listings, send booking requests, manage profile |
| **Owner** | Registered user | Create/edit listings, manage availability, respond to requests |
| **Admin** | Platform operator | Approve listings, manage users, view analytics |

---

## Core Features

### Phase 1: Public Browsing (✅ Complete)

#### 1.1 Homepage
- Hero section with value proposition
- Search bar (city, price, billboard type)
- Featured billboard grid (6 items)
- Popular cities quick links
- Trust signals (3 highlight cards)

#### 1.2 Browse & Search
- **Grid view** of billboard cards
- **Sidebar filters**:
  - Text search (title, address, city, area)
  - City/area filter
  - Billboard type (8 types: highway, digital, roadside, etc.)
  - Price range (min/max)
  - Minimum dimensions (width/height)
  - Availability status
  - Illumination (24/7 lit only checkbox)
- **Sort options**: Newest first, Price (low to high), Price (high to low)
- **Responsive**: Mobile filter toggle
- **URL persistence**: Filters sync to query params

#### 1.3 Billboard Detail Page
- **Photo gallery**: Cover image + thumbnails
- **Details section**:
  - Title, location, description
  - Size, lighting, billboard type
  - Pricing (per day/week/month/year)
  - Minimum booking period
  - Availability calendar (date ranges)
- **Map view**: Embedded map + Street View
- **Owner info**: Company name, bio
- **Save button**: Add to favorites (requires auth)
- **Booking CTA**: "Contact owner" (requires auth)

---

### Phase 2: Authentication (🚧 To Build)

#### 2.1 Sign Up / Sign In
- **Email + Password** authentication
- **OAuth**: Google sign-in
- **Magic link**: Email-based passwordless
- **Account types**:
  - Advertiser (default)
  - Owner (selected during signup)
- **Profile setup**:
  - Display name, company name
  - Contact email, phone
  - City, bio

#### 2.2 Session Management
- Persistent sessions (remember me)
- Email verification
- Password reset flow
- Account deletion

---

### Phase 3: Advertiser Features (🚧 To Build)

#### 3.1 Saved Billboards
- Heart/save button on cards and detail pages
- Dedicated "Saved" page with grid view
- Remove from saved
- Sort by recently saved

#### 3.2 Booking Requests
- "Request Booking" flow:
  1. Select dates (calendar picker)
  2. Add campaign details (optional)
  3. Add message to owner
  4. Submit request
- **Request tracking**:
  - View sent requests
  - Status: Pending, Accepted, Declined
  - Owner responses and messages
- **Notifications**:
  - Email when owner responds
  - In-app notifications

#### 3.3 Advertiser Dashboard
- Stats: Saved billboards, active requests, bookings
- Quick links to saved, requests, profile
- Recent activity feed

#### 3.4 Profile Management
- Edit company name, contact details, bio
- View booking history
- Manage notification preferences

---

### Phase 4: Owner Features (🚧 To Build)

#### 4.1 Billboard Listing Wizard (7 Steps)
1. **Basics**: Title, description, billboard type
2. **Location**: Address, city, state, country, GPS coordinates (map picker)
3. **Dimensions**: Width, height, unit (ft/m), illumination
4. **Pricing**: Price, currency, period, minimum booking days
5. **Photos**: Upload 1-10 images, set cover, reorder
6. **Availability**: Add date ranges (available/blocked), notes
7. **Review**: Preview card, save as draft or publish

#### 4.2 My Billboards
- List of all owned billboards
- Filters: All, Published, Drafts
- Actions per billboard:
  - View public page
  - Edit
  - Publish/Unpublish
  - Delete (with confirmation)
- Quick stats: Views, saves, requests per billboard

#### 4.3 Owner Dashboard
- Stats:
  - Total billboards, published, drafts
  - Pending requests, accepted bookings
  - Views (last 30 days), revenue (YTD)
- Quick links to add billboard, manage listings, view requests

#### 4.4 Booking Request Management
- Inbox of incoming requests
- Request details: Billboard, advertiser, dates, message
- Actions:
  - Accept (mark billboard as booked for dates)
  - Decline (with optional message)
  - Counter-offer (different dates/price)
  - Message advertiser
- Filters: Pending, Accepted, Declined, Archived

#### 4.5 Availability Calendar
- Per-billboard or global view
- Visual calendar showing available/booked/blocked dates
- Quick actions: Add blocked dates, mark as available
- Sync with accepted bookings (auto-blocks dates)

---

### Phase 5: Bookings & Payments (🚧 Future)

#### 5.1 Booking Confirmation
- Convert accepted request → booking
- Generate booking agreement (PDF)
- Payment request (advance + balance)
- E-signatures

#### 5.2 Payment Integration
- Payment gateway: Razorpay or Stripe
- Split payments: Platform fee + owner payout
- Escrow: Hold payment until campaign start
- Refund policy

#### 5.3 Booking Management
- View active/past bookings
- Upload proof of display (photos)
- Dispute resolution
- Reviews/ratings (post-campaign)

---

### Phase 6: Admin Features (🚧 Future)

#### 6.1 Content Moderation
- Approve/reject new listings
- Review flagged content
- Edit/remove inappropriate listings

#### 6.2 User Management
- View all users (owners, advertisers)
- Ban/suspend accounts
- Merge duplicate accounts
- Impersonate user (for support)

#### 6.3 Analytics Dashboard
- GMV (Gross Merchandise Value)
- Active listings, new listings per month
- User signups, active users
- Booking conversion funnel
- Revenue (platform fees)

---

## Non-Functional Requirements

### Performance
- Page load: < 2s (90th percentile)
- Time to interactive: < 3s
- Image optimization: WebP, lazy loading
- CDN for static assets

### Security
- HTTPS only
- SQL injection prevention (parameterized queries)
- XSS protection (CSP headers)
- Rate limiting on API endpoints
- Input validation and sanitization

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Semantic HTML
- ARIA labels

### SEO
- Server-side rendering (SSR) for public pages
- Meta tags per page
- Structured data (JSON-LD) for billboards
- XML sitemap
- robots.txt

### Scalability
- Horizontal scaling (stateless backend)
- Database indexing (city, price, availability)
- CDN for images
- Caching strategy (Redis)

---

## Technical Constraints

### Current Limitations
- **No backend**: Mock data only
- **No authentication**: Stub implementation
- **No file uploads**: Would need storage (S3/Cloudflare R2)
- **No Google Maps**: Requires API key
- **No payment integration**: Requires Razorpay/Stripe account

### Technology Decisions Pending
- [ ] Backend framework (Next.js API routes, Express, FastAPI, etc.)
- [ ] Database (PostgreSQL, MongoDB, Supabase, Firebase)
- [ ] Authentication provider (Supabase Auth, Auth0, Clerk, NextAuth)
- [ ] File storage (Supabase Storage, AWS S3, Cloudflare R2)
- [ ] Payment gateway (Razorpay, Stripe, PayU)
- [ ] Email service (SendGrid, Resend, AWS SES)
- [ ] Hosting (Vercel, Netlify, AWS, self-hosted)

---

## Success Metrics (KPIs)

### For Platform
- **Listings**: Number of active billboards
- **Users**: Registered advertisers and owners
- **GMV**: Total booking value (₹)
- **Conversion Rate**: Requests → Bookings
- **Retention**: % users active after 30/90 days

### For Advertisers
- **Search Success**: % searches with ≥1 result
- **Booking Completion**: % requests → confirmed bookings
- **Time to Book**: Days from signup to first booking
- **Satisfaction**: NPS score

### For Owners
- **Listing Utilization**: % days booked vs. available
- **Response Time**: Hours to respond to request
- **Earnings**: Revenue per listing per month
- **Repeat Advertisers**: % bookings from returning clients

---

## Future Enhancements (Roadmap)

### Q1 2027
- [ ] Mobile app (React Native)
- [ ] Advanced analytics for owners
- [ ] Campaign performance tracking
- [ ] Bulk listing upload (CSV)

### Q2 2027
- [ ] API for third-party integrations
- [ ] White-label solution for agencies
- [ ] Programmatic buying (DSP integration)
- [ ] Dynamic pricing suggestions

### Q3 2027
- [ ] AI-powered recommendations
- [ ] Computer vision for billboard verification
- [ ] Virtual tours (360° photos)
- [ ] Multi-language support (Hindi, Tamil, etc.)

---

## Out of Scope (V1)

- Video billboards (media playback)
- Auction-based pricing
- Affiliate program
- Chatbot/live chat
- Social media integrations
- Blockchain/crypto payments
- AR preview ("see your ad here")

---

## Glossary

- **Billboard**: Any outdoor advertising structure (hoarding, digital screen, transit ad, wall wrap, etc.)
- **Owner**: Individual or company that owns and lists billboards
- **Advertiser**: Individual or company looking to rent billboard space
- **Listing**: A billboard entry with details, photos, pricing, availability
- **Booking Request**: Advertiser's inquiry to rent a billboard for specific dates
- **Booking**: Confirmed rental agreement between advertiser and owner
- **GMV**: Gross Merchandise Value (total booking value before fees)
- **Occupancy**: % of days a billboard is booked vs. available

---

**Approved by**: [Product Team]  
**Next Review**: After Phase 2 (Backend) completion

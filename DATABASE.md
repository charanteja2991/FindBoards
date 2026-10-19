# Database Schema Design
## Board Spot — Database Architecture

**Version**: 1.0  
**Last Updated**: October 14, 2026  
**Status**: Proposed (Not Yet Implemented)

---

## Overview

This document defines the database schema for Board Spot. The schema is **database-agnostic** but optimized for PostgreSQL. It can be adapted for:
- **PostgreSQL** (Supabase, raw PostgreSQL)
- **MongoDB** (NoSQL alternative)
- **Firebase Firestore** (NoSQL alternative)

---

## Entity Relationship Diagram

```
┌─────────────┐
│   profiles  │
│             │
│ id (PK)     │◄──┐
│ email       │   │
│ role        │   │
└─────────────┘   │
                  │
        ┌─────────┴─────────┐
        │                   │
┌───────┴──────┐    ┌───────┴──────┐
│ user_roles   │    │ billboards   │
│              │    │              │
│ user_id (FK) │    │ id (PK)      │
│ role         │    │ owner_id (FK)│◄──┐
└──────────────┘    │ title        │   │
                    │ city         │   │
                    │ price        │   │
                    └──────────────┘   │
                            │          │
            ┌───────────────┼──────────┼─────────────┐
            │               │          │             │
    ┌───────┴────────┐  ┌──┴──────────┴───┐  ┌──────┴──────────┐
    │ billboard_     │  │ billboard_       │  │ saved_          │
    │ images         │  │ availability     │  │ billboards      │
    │                │  │                  │  │                 │
    │ id (PK)        │  │ id (PK)          │  │ id (PK)         │
    │ billboard_id   │  │ billboard_id (FK)│  │ user_id (FK)    │
    │ url            │  │ start_date       │  │ billboard_id(FK)│
    │ sort_order     │  │ end_date         │  └─────────────────┘
    └────────────────┘  │ is_available     │
                        └──────────────────┘
                                │
                        ┌───────┴──────────┐
                        │                  │
                ┌───────┴────────┐  ┌──────┴────────┐
                │ booking_       │  │ bookings      │
                │ requests       │  │               │
                │                │  │ id (PK)       │
                │ id (PK)        │  │ billboard_id  │
                │ billboard_id   │  │ advertiser_id │
                │ advertiser_id  │  │ owner_id      │
                │ owner_id       │  │ start_date    │
                │ start_date     │  │ end_date      │
                │ end_date       │  │ status        │
                │ status         │  │ amount        │
                └────────────────┘  └───────────────┘
```

---

## Core Tables

### 1. `profiles`

User profiles (advertisers and owners).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | User ID (from auth system) |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email address |
| `display_name` | VARCHAR(100) | | Full name |
| `company_name` | VARCHAR(150) | | Company/business name |
| `avatar_url` | TEXT | | Profile photo URL |
| `bio` | TEXT | | About me / company description |
| `city` | VARCHAR(100) | | Primary city/location |
| `phone` | VARCHAR(20) | | Phone number |
| `contact_email` | VARCHAR(255) | | Public contact email (may differ from login email) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Account creation date |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last profile update |

**Indexes**:
- `CREATE INDEX idx_profiles_email ON profiles(email);`

---

### 2. `user_roles`

Role assignments (many-to-many: users can be both owner and advertiser).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Role assignment ID |
| `user_id` | UUID | FOREIGN KEY → profiles(id) | User reference |
| `role` | ENUM | NOT NULL | 'admin', 'owner', 'advertiser' |
| `created_at` | TIMESTAMP | DEFAULT NOW() | When role was granted |

**Enums**:
```sql
CREATE TYPE app_role AS ENUM ('admin', 'owner', 'advertiser');
```

**Indexes**:
- `CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);`
- `CREATE UNIQUE INDEX idx_user_roles_unique ON user_roles(user_id, role);`

---

### 3. `billboards`

Billboard listings.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Billboard ID |
| `owner_id` | UUID | FOREIGN KEY → profiles(id), NOT NULL | Owner reference |
| `title` | VARCHAR(200) | NOT NULL | Billboard name/title |
| `description` | TEXT | | Detailed description |
| `billboard_type` | ENUM | NOT NULL | Type of billboard |
| `address` | VARCHAR(300) | NOT NULL | Street address |
| `area` | VARCHAR(100) | | Neighborhood/locality |
| `city` | VARCHAR(100) | NOT NULL | City |
| `state` | VARCHAR(100) | | State/province |
| `country` | VARCHAR(100) | NOT NULL | Country (default 'India') |
| `latitude` | DECIMAL(10, 8) | NOT NULL | GPS latitude |
| `longitude` | DECIMAL(11, 8) | NOT NULL | GPS longitude |
| `width` | DECIMAL(10, 2) | NOT NULL | Width in specified unit |
| `height` | DECIMAL(10, 2) | NOT NULL | Height in specified unit |
| `dimension_unit` | ENUM | NOT NULL | 'ft' or 'm' |
| `is_illuminated` | BOOLEAN | DEFAULT FALSE | Lit at night |
| `price` | DECIMAL(10, 2) | NOT NULL | Base price |
| `currency` | VARCHAR(3) | DEFAULT 'INR' | ISO currency code |
| `price_period` | ENUM | NOT NULL | Pricing period |
| `min_booking_days` | INTEGER | NOT NULL | Minimum rental period |
| `availability` | ENUM | DEFAULT 'available' | Overall availability |
| `status` | ENUM | DEFAULT 'draft' | Listing status |
| `is_visible` | BOOLEAN | DEFAULT TRUE | Hidden by owner/admin |
| `is_featured` | BOOLEAN | DEFAULT FALSE | Promoted listing |
| `views` | INTEGER | DEFAULT 0 | View counter |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Listed date |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last edit date |

**Enums**:
```sql
CREATE TYPE billboard_type AS ENUM (
  'highway', 'digital', 'roadside', 'in_mall', 
  'transit', 'wall_wrap', 'gantry', 'rooftop'
);

CREATE TYPE price_period AS ENUM ('daily', 'weekly', 'monthly', 'yearly');

CREATE TYPE availability_status AS ENUM ('available', 'booked', 'unavailable');

CREATE TYPE listing_status AS ENUM (
  'draft', 'published', 'pending', 'rejected', 'suspended'
);

CREATE TYPE dimension_unit AS ENUM ('ft', 'm');
```

**Indexes**:
- `CREATE INDEX idx_billboards_owner_id ON billboards(owner_id);`
- `CREATE INDEX idx_billboards_city ON billboards(city);`
- `CREATE INDEX idx_billboards_status ON billboards(status);`
- `CREATE INDEX idx_billboards_price ON billboards(price);`
- `CREATE INDEX idx_billboards_created_at ON billboards(created_at DESC);`
- `CREATE INDEX idx_billboards_location ON billboards USING GIST (ll_to_earth(latitude, longitude));` (PostGIS)

**Full-Text Search**:
```sql
CREATE INDEX idx_billboards_search ON billboards 
USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || city || ' ' || COALESCE(area, '')));
```

---

### 4. `billboard_images`

Photos for each billboard.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Image ID |
| `billboard_id` | UUID | FOREIGN KEY → billboards(id) ON DELETE CASCADE, NOT NULL | Billboard reference |
| `url` | TEXT | NOT NULL | Image URL (CDN/storage) |
| `storage_path` | TEXT | | Storage key (e.g., S3 path) |
| `alt_text` | VARCHAR(200) | | Alt text for accessibility |
| `sort_order` | INTEGER | DEFAULT 0 | Display order (0 = first) |
| `is_cover` | BOOLEAN | DEFAULT FALSE | Main/cover image |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Upload date |

**Indexes**:
- `CREATE INDEX idx_billboard_images_billboard_id ON billboard_images(billboard_id);`
- `CREATE INDEX idx_billboard_images_sort_order ON billboard_images(billboard_id, sort_order);`

**Constraint**: Only one cover image per billboard
```sql
CREATE UNIQUE INDEX idx_one_cover_per_billboard 
ON billboard_images(billboard_id) 
WHERE is_cover = TRUE;
```

---

### 5. `billboard_availability`

Date ranges when billboards are available or blocked.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Availability slot ID |
| `billboard_id` | UUID | FOREIGN KEY → billboards(id) ON DELETE CASCADE, NOT NULL | Billboard reference |
| `start_date` | DATE | NOT NULL | Start date (YYYY-MM-DD) |
| `end_date` | DATE | NOT NULL | End date (YYYY-MM-DD) |
| `is_available` | BOOLEAN | NOT NULL | TRUE = available, FALSE = blocked |
| `note` | TEXT | | Internal note (e.g., "Booked by XYZ") |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Created date |

**Indexes**:
- `CREATE INDEX idx_billboard_availability_billboard_id ON billboard_availability(billboard_id);`
- `CREATE INDEX idx_billboard_availability_dates ON billboard_availability(billboard_id, start_date, end_date);`

**Constraint**: No overlapping date ranges of the same type (available/blocked) for the same billboard.

---

### 6. `saved_billboards`

User favorites/saved billboards.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Save record ID |
| `user_id` | UUID | FOREIGN KEY → profiles(id) ON DELETE CASCADE, NOT NULL | Advertiser reference |
| `billboard_id` | UUID | FOREIGN KEY → billboards(id) ON DELETE CASCADE, NOT NULL | Billboard reference |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Saved date |

**Indexes**:
- `CREATE UNIQUE INDEX idx_saved_billboards_unique ON saved_billboards(user_id, billboard_id);`
- `CREATE INDEX idx_saved_billboards_user_id ON saved_billboards(user_id);`

---

### 7. `booking_requests`

Booking inquiries from advertisers to owners.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Request ID |
| `billboard_id` | UUID | FOREIGN KEY → billboards(id) ON DELETE CASCADE, NOT NULL | Billboard reference |
| `advertiser_id` | UUID | FOREIGN KEY → profiles(id) ON DELETE CASCADE, NOT NULL | Advertiser reference |
| `owner_id` | UUID | FOREIGN KEY → profiles(id), NOT NULL | Owner reference (denormalized for queries) |
| `start_date` | DATE | NOT NULL | Requested start date |
| `end_date` | DATE | NOT NULL | Requested end date |
| `campaign_name` | VARCHAR(200) | | Campaign identifier |
| `message` | TEXT | | Advertiser's message to owner |
| `status` | ENUM | DEFAULT 'pending' | Request status |
| `owner_response` | TEXT | | Owner's reply message |
| `responded_at` | TIMESTAMP | | When owner responded |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Request sent date |

**Enums**:
```sql
CREATE TYPE booking_status AS ENUM (
  'pending', 'accepted', 'declined', 'cancelled', 'expired'
);
```

**Indexes**:
- `CREATE INDEX idx_booking_requests_advertiser ON booking_requests(advertiser_id);`
- `CREATE INDEX idx_booking_requests_owner ON booking_requests(owner_id);`
- `CREATE INDEX idx_booking_requests_billboard ON booking_requests(billboard_id);`
- `CREATE INDEX idx_booking_requests_status ON booking_requests(status);`

---

### 8. `bookings`

Confirmed bookings (after request acceptance).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Booking ID |
| `billboard_id` | UUID | FOREIGN KEY → billboards(id), NOT NULL | Billboard reference |
| `advertiser_id` | UUID | FOREIGN KEY → profiles(id), NOT NULL | Advertiser reference |
| `owner_id` | UUID | FOREIGN KEY → profiles(id), NOT NULL | Owner reference |
| `booking_request_id` | UUID | FOREIGN KEY → booking_requests(id) | Original request (if any) |
| `start_date` | DATE | NOT NULL | Campaign start date |
| `end_date` | DATE | NOT NULL | Campaign end date |
| `amount` | DECIMAL(10, 2) | NOT NULL | Total booking amount |
| `currency` | VARCHAR(3) | DEFAULT 'INR' | Currency code |
| `platform_fee` | DECIMAL(10, 2) | | Platform commission |
| `owner_payout` | DECIMAL(10, 2) | | Net payout to owner |
| `status` | ENUM | DEFAULT 'confirmed' | Booking status |
| `payment_status` | ENUM | DEFAULT 'pending' | Payment status |
| `payment_id` | VARCHAR(100) | | Payment gateway transaction ID |
| `contract_url` | TEXT | | Signed agreement PDF URL |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Booking created date |
| `updated_at` | TIMESTAMP | DEFAULT NOW() | Last update |

**Enums**:
```sql
CREATE TYPE booking_status AS ENUM (
  'confirmed', 'active', 'completed', 'cancelled', 'disputed'
);

CREATE TYPE payment_status AS ENUM (
  'pending', 'partial', 'paid', 'refunded'
);
```

**Indexes**:
- `CREATE INDEX idx_bookings_advertiser ON bookings(advertiser_id);`
- `CREATE INDEX idx_bookings_owner ON bookings(owner_id);`
- `CREATE INDEX idx_bookings_billboard ON bookings(billboard_id);`
- `CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);`

---

## Supporting Tables

### 9. `notifications`

In-app notifications.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Notification ID |
| `user_id` | UUID | FOREIGN KEY → profiles(id) ON DELETE CASCADE, NOT NULL | Recipient |
| `type` | VARCHAR(50) | NOT NULL | Notification type |
| `title` | VARCHAR(200) | NOT NULL | Notification title |
| `message` | TEXT | | Notification body |
| `action_url` | TEXT | | Link to related resource |
| `is_read` | BOOLEAN | DEFAULT FALSE | Read status |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Sent date |

**Indexes**:
- `CREATE INDEX idx_notifications_user_id ON notifications(user_id, created_at DESC);`
- `CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = FALSE;`

---

### 10. `reviews`

Billboard reviews (post-campaign).

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PRIMARY KEY | Review ID |
| `billboard_id` | UUID | FOREIGN KEY → billboards(id) ON DELETE CASCADE, NOT NULL | Billboard reference |
| `booking_id` | UUID | FOREIGN KEY → bookings(id), NOT NULL | Booking reference |
| `reviewer_id` | UUID | FOREIGN KEY → profiles(id), NOT NULL | Reviewer (advertiser) |
| `rating` | INTEGER | CHECK (rating BETWEEN 1 AND 5), NOT NULL | 1-5 stars |
| `comment` | TEXT | | Review text |
| `is_verified` | BOOLEAN | DEFAULT FALSE | Verified by admin |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Review date |

**Indexes**:
- `CREATE INDEX idx_reviews_billboard_id ON reviews(billboard_id);`
- `CREATE UNIQUE INDEX idx_one_review_per_booking ON reviews(booking_id);`

---

## Views (Optional)

### `billboard_stats`

Aggregated stats per billboard.

```sql
CREATE VIEW billboard_stats AS
SELECT 
  b.id AS billboard_id,
  COUNT(DISTINCT s.id) AS saves_count,
  COUNT(DISTINCT br.id) AS requests_count,
  COUNT(DISTINCT bk.id) AS bookings_count,
  COALESCE(AVG(r.rating), 0) AS avg_rating,
  COUNT(DISTINCT r.id) AS review_count
FROM billboards b
LEFT JOIN saved_billboards s ON s.billboard_id = b.id
LEFT JOIN booking_requests br ON br.billboard_id = b.id
LEFT JOIN bookings bk ON bk.billboard_id = b.id
LEFT JOIN reviews r ON r.billboard_id = b.id
GROUP BY b.id;
```

---

## Row-Level Security (RLS) Policies

**For Supabase / PostgreSQL with RLS:**

### `billboards`
```sql
-- Public read for published billboards
CREATE POLICY "Public can view published billboards"
ON billboards FOR SELECT
USING (status = 'published' AND is_visible = TRUE);

-- Owners can view their own
CREATE POLICY "Owners can view own billboards"
ON billboards FOR SELECT
USING (auth.uid() = owner_id);

-- Owners can insert
CREATE POLICY "Owners can create billboards"
ON billboards FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- Owners can update their own
CREATE POLICY "Owners can update own billboards"
ON billboards FOR UPDATE
USING (auth.uid() = owner_id);
```

### `saved_billboards`
```sql
-- Users can only see their own saves
CREATE POLICY "Users can view own saved"
ON saved_billboards FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can save billboards"
ON saved_billboards FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave"
ON saved_billboards FOR DELETE
USING (auth.uid() = user_id);
```

---

## Sample Queries

### Search billboards with filters
```sql
SELECT 
  b.*,
  json_agg(
    json_build_object(
      'id', bi.id, 
      'url', bi.url, 
      'is_cover', bi.is_cover,
      'sort_order', bi.sort_order
    ) ORDER BY bi.sort_order
  ) AS billboard_images
FROM billboards b
LEFT JOIN billboard_images bi ON bi.billboard_id = b.id
WHERE 
  b.status = 'published'
  AND b.is_visible = TRUE
  AND b.city ILIKE '%Hyderabad%'
  AND b.price BETWEEN 50000 AND 200000
  AND b.billboard_type = ANY(ARRAY['highway', 'digital'])
  AND b.is_illuminated = TRUE
GROUP BY b.id
ORDER BY b.created_at DESC
LIMIT 20;
```

### Get billboard detail with availability
```sql
SELECT 
  b.*,
  p.display_name, p.company_name, p.bio,
  (SELECT json_agg(bi ORDER BY bi.sort_order) FROM billboard_images bi WHERE bi.billboard_id = b.id) AS images,
  (SELECT json_agg(ba ORDER BY ba.start_date) FROM billboard_availability ba WHERE ba.billboard_id = b.id) AS availability
FROM billboards b
JOIN profiles p ON p.id = b.owner_id
WHERE b.id = $1;
```

---

## Migration Strategy

### Phase 1: Core Tables
1. `profiles`
2. `user_roles`
3. `billboards`
4. `billboard_images`
5. `billboard_availability`

### Phase 2: Interactions
6. `saved_billboards`
7. `booking_requests`

### Phase 3: Transactions
8. `bookings`
9. `notifications`

### Phase 4: Quality
10. `reviews`

---

## Backup & Recovery

- **Daily backups**: Automated full database backup
- **Point-in-time recovery**: 7-day retention
- **Replication**: Read replica for analytics
- **Disaster recovery**: Cross-region backup (if critical)

---

## Scaling Considerations

### Indexing
- All foreign keys indexed
- Search fields (city, price, dates) indexed
- Composite indexes for common filter combos

### Partitioning (Future)
- Partition `bookings` by year
- Partition `notifications` by month (auto-archive old)

### Caching
- Redis for:
  - Featured billboards (30 min TTL)
  - Popular cities (1 hour TTL)
  - User sessions
  - Rate limiting

---

**Next Steps**: Implement schema in chosen database (Supabase/PostgreSQL recommended).

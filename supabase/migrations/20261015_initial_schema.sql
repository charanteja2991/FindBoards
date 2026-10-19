-- Migration: Initial schema for Board Spot
-- Created: 2026-10-15

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE app_role AS ENUM ('admin', 'owner', 'advertiser');
CREATE TYPE billboard_type AS ENUM ('highway', 'digital', 'roadside', 'in_mall', 'transit', 'wall_wrap', 'gantry', 'rooftop');
CREATE TYPE price_period AS ENUM ('daily', 'weekly', 'monthly', 'yearly');
CREATE TYPE availability_status AS ENUM ('available', 'booked', 'unavailable');
CREATE TYPE listing_status AS ENUM ('draft', 'published', 'pending', 'rejected', 'suspended');
CREATE TYPE dimension_unit AS ENUM ('ft', 'm');
CREATE TYPE booking_status AS ENUM ('pending', 'accepted', 'declined', 'cancelled', 'expired');
CREATE TYPE booking_confirmed_status AS ENUM ('confirmed', 'active', 'completed', 'cancelled', 'disputed');
CREATE TYPE payment_status AS ENUM ('pending', 'partial', 'paid', 'refunded');

-- 1. Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  display_name VARCHAR(100),
  company_name VARCHAR(150),
  avatar_url TEXT,
  bio TEXT,
  city VARCHAR(100),
  phone VARCHAR(20),
  contact_email VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. User roles table
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- 3. Billboards table
CREATE TABLE billboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  billboard_type billboard_type NOT NULL,
  address VARCHAR(300) NOT NULL,
  area VARCHAR(100),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100),
  country VARCHAR(100) NOT NULL DEFAULT 'India',
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  width DECIMAL(10, 2) NOT NULL,
  height DECIMAL(10, 2) NOT NULL,
  dimension_unit dimension_unit NOT NULL DEFAULT 'ft',
  is_illuminated BOOLEAN DEFAULT FALSE,
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  price_period price_period NOT NULL,
  min_booking_days INTEGER NOT NULL,
  availability availability_status DEFAULT 'available',
  status listing_status DEFAULT 'draft',
  is_visible BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,
  views INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Billboard images table
CREATE TABLE billboard_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  billboard_id UUID NOT NULL REFERENCES billboards(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_path TEXT,
  alt_text VARCHAR(200),
  sort_order INTEGER DEFAULT 0,
  is_cover BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Billboard availability table
CREATE TABLE billboard_availability (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  billboard_id UUID NOT NULL REFERENCES billboards(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_available BOOLEAN NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Saved billboards table
CREATE TABLE saved_billboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  billboard_id UUID NOT NULL REFERENCES billboards(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, billboard_id)
);

-- 7. Booking requests table
CREATE TABLE booking_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  billboard_id UUID NOT NULL REFERENCES billboards(id) ON DELETE CASCADE,
  advertiser_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES profiles(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  campaign_name VARCHAR(200),
  message TEXT,
  status booking_status DEFAULT 'pending',
  owner_response TEXT,
  responded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  billboard_id UUID NOT NULL REFERENCES billboards(id),
  advertiser_id UUID NOT NULL REFERENCES profiles(id),
  owner_id UUID NOT NULL REFERENCES profiles(id),
  booking_request_id UUID REFERENCES booking_requests(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'INR',
  platform_fee DECIMAL(10, 2),
  owner_payout DECIMAL(10, 2),
  status booking_confirmed_status DEFAULT 'confirmed',
  payment_status payment_status DEFAULT 'pending',
  payment_id VARCHAR(100),
  contract_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT,
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  billboard_id UUID NOT NULL REFERENCES billboards(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES bookings(id),
  reviewer_id UUID NOT NULL REFERENCES profiles(id),
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(booking_id)
);

-- Create indexes for performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_billboards_owner_id ON billboards(owner_id);
CREATE INDEX idx_billboards_city ON billboards(city);
CREATE INDEX idx_billboards_status ON billboards(status);
CREATE INDEX idx_billboards_price ON billboards(price);
CREATE INDEX idx_billboards_created_at ON billboards(created_at DESC);
CREATE INDEX idx_billboard_images_billboard_id ON billboard_images(billboard_id);
CREATE INDEX idx_billboard_images_sort_order ON billboard_images(billboard_id, sort_order);
CREATE INDEX idx_billboard_availability_billboard_id ON billboard_availability(billboard_id);
CREATE INDEX idx_billboard_availability_dates ON billboard_availability(billboard_id, start_date, end_date);
CREATE INDEX idx_saved_billboards_user_id ON saved_billboards(user_id);
CREATE INDEX idx_booking_requests_advertiser ON booking_requests(advertiser_id);
CREATE INDEX idx_booking_requests_owner ON booking_requests(owner_id);
CREATE INDEX idx_booking_requests_billboard ON booking_requests(billboard_id);
CREATE INDEX idx_booking_requests_status ON booking_requests(status);
CREATE INDEX idx_bookings_advertiser ON bookings(advertiser_id);
CREATE INDEX idx_bookings_owner ON bookings(owner_id);
CREATE INDEX idx_bookings_billboard ON bookings(billboard_id);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX idx_notifications_user_id ON notifications(user_id, created_at DESC);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX idx_reviews_billboard_id ON reviews(billboard_id);

-- Unique constraint: only one cover image per billboard
CREATE UNIQUE INDEX idx_one_cover_per_billboard ON billboard_images(billboard_id) WHERE is_cover = TRUE;

-- Full-text search index on billboards
CREATE INDEX idx_billboards_search ON billboards
USING GIN (to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || city || ' ' || COALESCE(area, '')));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billboards_updated_at BEFORE UPDATE ON billboards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, created_at, updated_at)
  VALUES (NEW.id, NEW.email, NOW(), NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

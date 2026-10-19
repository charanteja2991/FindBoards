-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE billboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE billboard_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE billboard_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_billboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- User roles policies
CREATE POLICY "Users can view own roles"
  ON user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own roles"
  ON user_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Billboards policies
CREATE POLICY "Published billboards are viewable by everyone"
  ON billboards FOR SELECT
  USING (status = 'published' AND is_visible = TRUE);

CREATE POLICY "Owners can view own billboards"
  ON billboards FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can create billboards"
  ON billboards FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update own billboards"
  ON billboards FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete own billboards"
  ON billboards FOR DELETE
  USING (auth.uid() = owner_id);

-- Billboard images policies
CREATE POLICY "Images of published billboards are viewable by everyone"
  ON billboard_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM billboards
      WHERE billboards.id = billboard_images.billboard_id
      AND billboards.status = 'published'
      AND billboards.is_visible = TRUE
    )
  );

CREATE POLICY "Owners can view images of own billboards"
  ON billboard_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM billboards
      WHERE billboards.id = billboard_images.billboard_id
      AND billboards.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can insert images for own billboards"
  ON billboard_images FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM billboards
      WHERE billboards.id = billboard_images.billboard_id
      AND billboards.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update images of own billboards"
  ON billboard_images FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM billboards
      WHERE billboards.id = billboard_images.billboard_id
      AND billboards.owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can delete images of own billboards"
  ON billboard_images FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM billboards
      WHERE billboards.id = billboard_images.billboard_id
      AND billboards.owner_id = auth.uid()
    )
  );

-- Billboard availability policies
CREATE POLICY "Availability of published billboards is viewable by everyone"
  ON billboard_availability FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM billboards
      WHERE billboards.id = billboard_availability.billboard_id
      AND billboards.status = 'published'
      AND billboards.is_visible = TRUE
    )
  );

CREATE POLICY "Owners can manage availability of own billboards"
  ON billboard_availability FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM billboards
      WHERE billboards.id = billboard_availability.billboard_id
      AND billboards.owner_id = auth.uid()
    )
  );

-- Saved billboards policies
CREATE POLICY "Users can view own saved billboards"
  ON saved_billboards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save billboards"
  ON saved_billboards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can unsave billboards"
  ON saved_billboards FOR DELETE
  USING (auth.uid() = user_id);

-- Booking requests policies
CREATE POLICY "Advertisers can view own booking requests"
  ON booking_requests FOR SELECT
  USING (auth.uid() = advertiser_id);

CREATE POLICY "Owners can view booking requests for own billboards"
  ON booking_requests FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Advertisers can create booking requests"
  ON booking_requests FOR INSERT
  WITH CHECK (auth.uid() = advertiser_id);

CREATE POLICY "Owners can update booking requests for own billboards"
  ON booking_requests FOR UPDATE
  USING (auth.uid() = owner_id);

-- Bookings policies
CREATE POLICY "Advertisers can view own bookings"
  ON bookings FOR SELECT
  USING (auth.uid() = advertiser_id);

CREATE POLICY "Owners can view bookings for own billboards"
  ON bookings FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Owners can create bookings for own billboards"
  ON bookings FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update bookings for own billboards"
  ON bookings FOR UPDATE
  USING (auth.uid() = owner_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone"
  ON reviews FOR SELECT
  USING (true);

CREATE POLICY "Advertisers can create reviews for own bookings"
  ON reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = reviews.booking_id
      AND bookings.advertiser_id = auth.uid()
    )
  );

CREATE POLICY "Reviewers can update own reviews"
  ON reviews FOR UPDATE
  USING (auth.uid() = reviewer_id);

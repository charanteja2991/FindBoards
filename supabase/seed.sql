-- Sample data for testing Board Spot
-- Run this after initial migrations to populate the database with test data

-- Note: Replace 'YOUR_USER_ID' with an actual user ID from auth.users table
-- You can get this from: SELECT id FROM auth.users LIMIT 1;

DO $$
DECLARE
  sample_user_id UUID;
  billboard1_id UUID;
  billboard2_id UUID;
  billboard3_id UUID;
BEGIN
  -- Get the first user (or use a specific user ID)
  SELECT id INTO sample_user_id FROM auth.users LIMIT 1;

  IF sample_user_id IS NULL THEN
    RAISE EXCEPTION 'No users found. Please create a user account first.';
  END IF;

  -- Add owner role to the user
  INSERT INTO user_roles (user_id, role)
  VALUES (sample_user_id, 'owner')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Add advertiser role to the user
  INSERT INTO user_roles (user_id, role)
  VALUES (sample_user_id, 'advertiser')
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Insert sample billboards
  INSERT INTO billboards (
    id, owner_id, title, description, billboard_type,
    address, area, city, state, country,
    latitude, longitude, width, height, dimension_unit,
    is_illuminated, price, price_period, min_booking_days,
    status, is_featured, views
  ) VALUES
  (
    uuid_generate_v4(),
    sample_user_id,
    'Premium Highway Billboard - NH48',
    'High-traffic location on National Highway 48 with excellent visibility from both directions. Perfect for brand awareness campaigns targeting commuters between Delhi and Gurgaon.',
    'highway',
    'NH48, Near Sector 18',
    'Sector 18',
    'Gurgaon',
    'Haryana',
    'India',
    28.4595, 77.0266,
    40, 20, 'ft',
    true,
    150000, 'monthly', 7,
    'published', true, 234
  ),
  (
    uuid_generate_v4(),
    sample_user_id,
    'Digital Billboard - Cyber Hub',
    'State-of-the-art digital billboard in the heart of Cyber Hub. Rotating display with 10-second slots. Perfect for dynamic campaigns.',
    'digital',
    'Cyber Hub, DLF Cyber City',
    'DLF Phase 2',
    'Gurgaon',
    'Haryana',
    'India',
    28.4940, 77.0892,
    30, 15, 'ft',
    true,
    300000, 'monthly', 14,
    'published', true, 456
  ),
  (
    uuid_generate_v4(),
    sample_user_id,
    'Mall Entrance Billboard - Ambience Mall',
    'Premium location at the main entrance of Ambience Mall, Vasant Kunj. High footfall from Delhi''s affluent demographics.',
    'in_mall',
    'Ambience Mall, Main Entrance',
    'Vasant Kunj',
    'New Delhi',
    'Delhi',
    'India',
    28.5244, 77.1598,
    25, 15, 'ft',
    true,
    120000, 'monthly', 7,
    'published', false, 123
  ) RETURNING id INTO billboard1_id;

  -- Get billboard IDs for images
  SELECT id INTO billboard1_id FROM billboards WHERE title = 'Premium Highway Billboard - NH48';
  SELECT id INTO billboard2_id FROM billboards WHERE title = 'Digital Billboard - Cyber Hub';
  SELECT id INTO billboard3_id FROM billboards WHERE title = 'Mall Entrance Billboard - Ambience Mall';

  -- Insert sample images for billboard 1
  INSERT INTO billboard_images (billboard_id, url, alt_text, sort_order, is_cover)
  VALUES
    (billboard1_id, 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', 'Highway billboard front view', 0, true),
    (billboard1_id, 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800', 'Highway billboard side angle', 1, false),
    (billboard1_id, 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800', 'Night illumination view', 2, false);

  -- Insert sample images for billboard 2
  INSERT INTO billboard_images (billboard_id, url, alt_text, sort_order, is_cover)
  VALUES
    (billboard2_id, 'https://images.unsplash.com/photo-1564610222027-26d1aeaeb398?w=800', 'Digital billboard display', 0, true),
    (billboard2_id, 'https://images.unsplash.com/photo-1551039386-c1c61d49f613?w=800', 'Billboard at night', 1, false);

  -- Insert sample images for billboard 3
  INSERT INTO billboard_images (billboard_id, url, alt_text, sort_order, is_cover)
  VALUES
    (billboard3_id, 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=800', 'Mall entrance billboard', 0, true),
    (billboard3_id, 'https://images.unsplash.com/photo-1555992457-f49c8d5e8116?w=800', 'Close-up view', 1, false);

  -- Insert availability for billboards (next 6 months available)
  INSERT INTO billboard_availability (billboard_id, start_date, end_date, is_available, note)
  VALUES
    (billboard1_id, CURRENT_DATE, CURRENT_DATE + INTERVAL '6 months', true, 'Available for booking'),
    (billboard2_id, CURRENT_DATE, CURRENT_DATE + INTERVAL '6 months', true, 'Available for booking'),
    (billboard3_id, CURRENT_DATE, CURRENT_DATE + INTERVAL '6 months', true, 'Available for booking');

  RAISE NOTICE 'Sample data inserted successfully for user: %', sample_user_id;
END $$;

-- Insert more sample billboards in different cities
DO $$
DECLARE
  sample_user_id UUID;
BEGIN
  SELECT id INTO sample_user_id FROM auth.users LIMIT 1;

  INSERT INTO billboards (
    owner_id, title, description, billboard_type,
    address, city, country, latitude, longitude,
    width, height, dimension_unit, is_illuminated,
    price, price_period, min_booking_days, status, views
  ) VALUES
  (
    sample_user_id,
    'Roadside Billboard - Banjara Hills',
    'Prime roadside location in Hyderabad''s upscale Banjara Hills neighborhood.',
    'roadside',
    'Road No. 12, Banjara Hills',
    'Hyderabad',
    'India',
    17.4239, 78.4738,
    30, 20, 'ft', true,
    80000, 'monthly', 7,
    'published', 89
  ),
  (
    sample_user_id,
    'Metro Station Billboard - Indiranagar',
    'High visibility at Indiranagar Metro Station entrance in Bangalore.',
    'transit',
    'Indiranagar Metro Station',
    'Bangalore',
    'India',
    12.9781, 77.6408,
    20, 10, 'ft', true,
    100000, 'monthly', 14,
    'published', 167
  ),
  (
    sample_user_id,
    'Rooftop Billboard - Marine Drive',
    'Iconic rooftop billboard overlooking Marine Drive in Mumbai.',
    'rooftop',
    'Marine Drive, Near Chowpatty',
    'Mumbai',
    'India',
    18.9432, 72.8236,
    50, 30, 'ft', true,
    500000, 'monthly', 30,
    'published', 678
  );
END $$;

-- Insert a sample notification
DO $$
DECLARE
  sample_user_id UUID;
BEGIN
  SELECT id INTO sample_user_id FROM auth.users LIMIT 1;

  INSERT INTO notifications (user_id, type, title, message, action_url)
  VALUES (
    sample_user_id,
    'welcome',
    'Welcome to Board Spot!',
    'Thanks for joining Board Spot. Start browsing billboards or list your own to get started.',
    '/browse'
  );
END $$;

SELECT 'Sample data seeding complete!' AS status;

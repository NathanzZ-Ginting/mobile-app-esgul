-- ESGUL Service Pro - Complete Database Schema

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  phone VARCHAR,
  address TEXT,
  role VARCHAR DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 2. Services Table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  duration_minutes INTEGER,
  category VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES services(id),
  vehicle_type VARCHAR NOT NULL,
  status VARCHAR DEFAULT 'Pending',
  booking_date DATE NOT NULL,
  booking_time TIME NOT NULL,
  vehicle_brand VARCHAR,
  vehicle_plate VARCHAR,
  notes TEXT,
  total_price INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 4. Chat Messages Table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  reply_to_id UUID REFERENCES chat_messages(id),
  location_data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 5. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  status VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 6. Promotions Table
CREATE TABLE IF NOT EXISTS promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR UNIQUE NOT NULL,
  discount_percent INTEGER,
  active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 7. Mechanics Table
CREATE TABLE IF NOT EXISTS mechanics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  bio TEXT,
  specialty VARCHAR,
  image_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 8. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- INDEXES for Performance
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender_id ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_receiver_id ON chat_messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking_id ON reviews(booking_id);

-- SEED DATA
-- Insert demo services
INSERT INTO services (title, description, price, duration_minutes, category) VALUES
  ('Oil Change', 'Complete oil and filter replacement for your vehicle', 150000, 30, 'Maintenance'),
  ('Tire Installation', 'Professional tire installation and balancing service', 200000, 45, 'Parts'),
  ('Battery Replacement', 'Replace vehicle battery with high-quality alternatives', 350000, 20, 'Parts'),
  ('Full Service', 'Complete vehicle maintenance and comprehensive checkup', 500000, 120, 'Maintenance'),
  ('Brake Pad Replacement', 'Replace worn brake pads with quality parts', 250000, 40, 'Maintenance')
ON CONFLICT DO NOTHING;

-- Insert demo mechanics
INSERT INTO mechanics (name, bio, specialty, image_url) VALUES
  ('Budi Santoso', 'Senior mechanic with 10+ years of experience in car repairs', 'Mobil', 'https://via.placeholder.com/150?text=Budi'),
  ('Rakhman Wijaya', 'Expert motorcycle mechanic specializing in performance tuning', 'Motor', 'https://via.placeholder.com/150?text=Rakhman')
ON CONFLICT DO NOTHING;

-- Insert demo promotions
INSERT INTO promotions (code, discount_percent, active, expires_at) VALUES
  ('SAVE20', 20, TRUE, NOW() + INTERVAL '30 days'),
  ('WELCOME10', 10, TRUE, NOW() + INTERVAL '7 days'),
  ('SPRING15', 15, TRUE, NOW() + INTERVAL '60 days')
ON CONFLICT DO NOTHING;

-- Row Level Security Policies

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can view their own bookings
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (user_id = auth.uid());

-- Users can create their own bookings
CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Users can update their own bookings
CREATE POLICY "Users can update own bookings" ON bookings
  FOR UPDATE USING (user_id = auth.uid());

-- Users can view chats they're part of
CREATE POLICY "Users can view own chats" ON chat_messages
  FOR SELECT USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- Users can view their notifications
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- Users can view services (public)
ALTER TABLE services DISABLE ROW LEVEL SECURITY;

-- Mechanics are public
ALTER TABLE mechanics DISABLE ROW LEVEL SECURITY;

-- Promotions are public
ALTER TABLE promotions DISABLE ROW LEVEL SECURITY;

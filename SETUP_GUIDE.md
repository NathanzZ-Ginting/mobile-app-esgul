# ESGUL Service Pro - Complete Setup Guide

## Phase 1: Database Setup (Supabase)

### 1. Create Supabase Project
1. Visit https://supabase.com
2. Sign up/Login
3. Click "New Project"
4. Fill in project details:
   - Name: `esgul-service-pro`
   - Database Password: (strong password)
   - Region: Choose closest to your location
5. Wait for project to initialize

### 2. Get Credentials
1. Go to Project Settings → API
2. Copy:
   - `Project URL` → EXPO_PUBLIC_SUPABASE_URL
   - `anon` key → EXPO_PUBLIC_SUPABASE_ANON_KEY
3. Update `.env` file with these values

### 3. Create Database Schema
1. Go to SQL Editor in Supabase
2. Copy and execute the schema from README.md
3. Verify all tables are created

### 4. Seed Initial Data
```sql
-- Insert demo services
INSERT INTO services (title, description, price, duration_minutes, category) VALUES
('Oil Change', 'Complete oil and filter replacement', 150000, 30, 'Maintenance'),
('Tire Installation', 'Professional tire installation service', 200000, 45, 'Parts'),
('Battery Replacement', 'Replace vehicle battery', 350000, 20, 'Parts'),
('Full Service', 'Complete vehicle maintenance and checkup', 500000, 120, 'Maintenance');

-- Insert demo mechanics
INSERT INTO mechanics (name, bio, specialty, image_url) VALUES
('Budi Santoso', 'Senior mechanic with 10 years experience', 'Mobil', 'https://...'),
('Rakhman Wijaya', 'Specialist in motorcycle repairs', 'Motor', 'https://...');

-- Insert demo promotions
INSERT INTO promotions (code, discount_percent, active, expires_at) VALUES
('SAVE20', 20, TRUE, NOW() + INTERVAL '30 days'),
('WELCOME10', 10, TRUE, NOW() + INTERVAL '7 days');
```

### 5. Enable Real-time (Optional but Recommended)
1. Go to Database → Replication
2. Enable replication for tables:
   - bookings
   - chat_messages
   - notifications

### 6. Setup Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can see their own bookings
CREATE POLICY "Users can view own bookings" ON bookings
  FOR SELECT USING (user_id = auth.uid());

-- Users can create their own bookings
CREATE POLICY "Users can create bookings" ON bookings
  FOR INSERT WITH CHECK (user_id = auth.uid());
```

## Phase 2: Environment Setup

### 1. Node.js & npm
```bash
# Check versions
node --version  # Should be 16+
npm --version   # Should be 8+

# If not installed, download from https://nodejs.org
```

### 2. Expo CLI
```bash
npm install -g expo-cli

# Verify installation
expo --version
```

### 3. Development Tools
- **Code Editor**: VS Code recommended
- **Expo Go App**: Install on your phone/tablet
  - iOS: App Store
  - Android: Google Play Store

## Phase 3: Project Setup

### 1. Install Dependencies
```bash
cd esgul-service-pro
npm install
```

### 2. Update Environment File
Create `.env` file in project root:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-key-here
```

### 3. Verify Installation
```bash
npm list react-native
npm list expo
npm list react-navigation
```

## Phase 4: Running the App

### Option A: Expo Go (Quickest)
```bash
npm start
```
- Scan QR code with Expo Go app
- App loads in dev environment

### Option B: Android Emulator
```bash
# Ensure Android emulator is running first
npm run android
```

### Option C: iOS Simulator (macOS only)
```bash
npm run ios
```

### Option D: Web Browser
```bash
npm start
# Then press 'w' to open in browser
```

## Phase 5: Testing the App

### 1. Test Authentication
- Try login with wrong credentials (should fail)
- Register new account
- Login with new credentials
- Test logout

### 2. Test User Features
- Navigate to each tab
- Create a booking
- View booking history
- Update profile

### 3. Test Admin Features
- Switch to admin account
- View all bookings
- Update booking status

### Test Accounts (Add these manually first)
```sql
-- User account
INSERT INTO auth.users (email, email_confirmed_at, encrypted_password)
VALUES ('user@test.com', NOW(), '...');

-- Admin account
INSERT INTO auth.users (email, email_confirmed_at, encrypted_password)
VALUES ('admin@test.com', NOW(), '...');
```

## Troubleshooting

### Issue: Dependencies Installation Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Issue: Supabase Connection Error
1. Verify `.env` file has correct credentials
2. Check Supabase project is active
3. Verify project URL format (include trailing slash)

### Issue: App Won't Start
1. Check console for errors: `npm start`
2. Clear Expo cache: `expo start --clear`
3. Restart computer

### Issue: Navigation Not Working
1. Verify `RootNavigator.tsx` imports
2. Check `AuthContext` is properly initialized
3. Ensure all screens are registered in navigator

## Development Tips

### Hot Reload
- Press 'r' in terminal to reload app
- Changes to source code auto-reload

### Debugging
- Use React Native Debugger
- Console logs visible in terminal
- Use browser dev tools for web version

### Performance
- Use React.memo for components
- Lazy load heavy screens
- Optimize images

## Production Build

### iOS Build
```bash
expo build:ios
# Download .ipa file and upload to TestFlight
```

### Android Build
```bash
expo build:android
# Download .apk or .aab file
# Upload to Google Play Store
```

## Next Improvements

1. **Push Notifications**
   - Setup Firebase Cloud Messaging
   - Send notifications for booking updates

2. **Maps Integration**
   - Add Google Maps for location display
   - Route navigation to workshop

3. **Payment Integration**
   - Add Stripe or local payment gateway
   - Secure booking with deposit

4. **Image Management**
   - Upload photos for mechanics
   - Add service photos

5. **Analytics**
   - Track user behavior
   - Monitor app performance

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **React Navigation**: https://reactnavigation.org
- **React Native Paper**: https://callstack.github.io/react-native-paper
- **Expo Docs**: https://docs.expo.dev
- **TypeScript**: https://www.typescriptlang.org/docs

---

**Ready to run?** Execute `npm start` and scan the QR code! 🚀

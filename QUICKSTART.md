# ESGUL Service Pro - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Setup Supabase (2 min)
1. Visit https://supabase.com and create free account
2. Create new project (name: `esgul-service-pro`)
3. Copy credentials:
   - Project URL → `EXPO_PUBLIC_SUPABASE_URL`
   - Anon Key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Step 2: Update .env File (1 min)
```bash
# Edit .env file
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
```

### Step 3: Run Database Setup (1 min)
1. Go to Supabase dashboard
2. SQL Editor → New Query
3. Copy entire content from `supabase.sql`
4. Execute it

### Step 4: Start App (1 min)
```bash
# Install dependencies (if not done)
npm install

# Start Expo
npm start

# Choose your platform:
# - Press 'w' for web
# - Scan QR with Expo Go for mobile
```

## 📱 Test Account

For quick testing, create accounts:

**User Account:**
- Email: `user@test.com`
- Password: `password123`

**Admin Account:**
- Email: `admin@test.com`
- Password: `password123`

(Create these manually in Supabase Auth after setup)

## 🎯 Features to Try

1. **Authentication**
   - Register new account
   - Login with email/password
   - Logout from profile

2. **User Features**
   - View home dashboard
   - Create a booking
   - Check booking history
   - Update profile
   - View service catalog
   - Send chat messages

3. **Admin Features**
   - View all bookings
   - Update booking status
   - Manage services

## 📋 Project Structure
```
src/
├── screens/          # All UI screens
├── components/       # Reusable components
├── context/         # Global state (Auth)
├── services/        # API service layer
├── navigation/      # Screen routing
└── types/          # TypeScript definitions
```

## 🆘 Troubleshooting

**Dependencies fail to install?**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**Expo won't start?**
```bash
npm start -- --clear
```

**Supabase connection error?**
- Check `.env` file has correct credentials
- Verify Supabase project is active
- Restart Expo dev server

**Navigation issues?**
- Clear React Native cache
- Restart phone/emulator
- Check `src/navigation/RootNavigator.tsx`

## 📚 Next Steps

1. Read full `README.md` for detailed documentation
2. Follow `SETUP_GUIDE.md` for advanced configuration
3. Check `FEATURES_CHECKLIST.md` for implementation status
4. Review `supabase.sql` for database schema

## 💡 Pro Tips

- **Auto-reload**: Press 'r' in terminal during development
- **Debug**: Use `console.log()` and check terminal output
- **Network**: Use Expo Go app on physical device for better testing
- **Performance**: Profile with React DevTools

## 🎓 Learning Resources

- React Native: https://reactnative.dev
- Expo: https://docs.expo.dev
- Supabase: https://supabase.com/docs
- React Navigation: https://reactnavigation.org

## 📞 Support

Need help? Check these first:
1. README.md (features & architecture)
2. SETUP_GUIDE.md (detailed setup)
3. FEATURES_CHECKLIST.md (what's implemented)
4. Project comments in source code

---

**Ready?** Run `npm start` and happy coding! 🎉

# ESGUL Service Pro - Deployment Guide

## Pre-Deployment Checklist

### Code Quality
- [x] All screens implemented
- [x] Navigation working
- [x] Services configured
- [ ] Error handling reviewed
- [ ] Loading states tested
- [ ] Edge cases handled

### Security
- [x] Environment variables configured
- [x] Supabase RLS policies set
- [x] Auth flows tested
- [ ] Sensitive data not logged
- [ ] API keys not exposed

### Testing
- [ ] Manual testing on Android
- [ ] Manual testing on iOS
- [ ] Manual testing on Web
- [ ] Performance profiled
- [ ] Offline mode tested

## Building for Production

### Prerequisites
1. Expo account (https://expo.dev)
2. Apple Developer account (for iOS)
3. Google Play Developer account (for Android)
4. Signing certificates

### Build Configuration

Update `app.json`:
```json
{
  "expo": {
    "version": "1.0.0",
    "owner": "your-expo-username",
    "slug": "esgul-service-pro",
    "updates": {
      "enabled": true,
      "checkAutomatically": "ON_APP_LAUNCH",
      "fallbackToCacheTimeout": 30000
    },
    "runtimeVersion": "1.0.0"
  }
}
```

### Android Build

#### Step 1: Setup Credentials
```bash
# Login to Expo
expo login

# Configure Android credentials
eas build --platform android
```

#### Step 2: Build APK
```bash
# Create debug APK for testing
eas build --platform android --local

# Create production APK
eas build --platform android --release
```

#### Step 3: Upload to Google Play
1. Go to Google Play Console
2. Create new app
3. Upload APK/AAB file
4. Fill in app details, screenshots, privacy policy
5. Submit for review

### iOS Build

#### Step 1: Setup Certificates
```bash
# Configure iOS credentials
eas build --platform ios
```

#### Step 2: Build IPA
```bash
# Create production build
eas build --platform ios --release
```

#### Step 3: Upload to App Store
1. Go to App Store Connect
2. Create new app
3. Upload IPA with Xcode or transporter
4. Fill in app details, screenshots, privacy policy
5. Submit for review

### Web Deployment

#### Deploy to Vercel
```bash
# Build for web
npm run build:web

# Deploy to Vercel
vercel
```

#### Deploy to Netlify
```bash
# Build for web
npm run build:web

# Deploy to Netlify
netlify deploy --prod --dir=web-build
```

## Environment Management

### Development
```
EXPO_PUBLIC_SUPABASE_URL=https://dev-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=dev-key
NODE_ENV=development
```

### Production
```
EXPO_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=prod-key
NODE_ENV=production
```

## Supabase Production Setup

### 1. Enable Security Features
```sql
-- Enable row level security on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
```

### 2. Setup Backups
1. Go to Supabase Dashboard → Backups
2. Enable automated backups
3. Set backup frequency (daily recommended)

### 3. Monitor Performance
1. Setup database monitoring
2. Configure alerts for performance issues
3. Monitor authentication logs

### 4. Setup CDN
1. Enable Supabase CDN for static files
2. Configure caching headers

## Performance Optimization

### Frontend Optimization
```bash
# Analyze bundle size
npm run analyze

# Enable code splitting
# Use React.lazy for route components
# Optimize images
# Use memoization for heavy components
```

### Backend Optimization
1. Add database indexes
2. Optimize queries
3. Use connection pooling
4. Enable query caching

## Monitoring & Analytics

### Setup Sentry (Error Tracking)
```bash
npm install @sentry/react-native
```

```typescript
import * as Sentry from "@sentry/react-native"

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production",
})
```

### Setup Google Analytics
```bash
npm install @react-native-firebase/analytics
```

### App Center (Microsoft)
```bash
npm install appcenter appcenter-analytics
```

## Update Strategy

### Over-the-Air (OTA) Updates
```json
{
  "expo": {
    "updates": {
      "enabled": true,
      "checkAutomatically": "ON_APP_LAUNCH"
    }
  }
}
```

Publish updates:
```bash
expo publish
```

## Rollback Procedure

### If issue found in production:

1. **Immediate Action**
   - Disable new build in Stores
   - Revert to previous version
   - Notify users

2. **Identify Issue**
   - Check error logs
   - Review recent changes
   - Test locally

3. **Fix & Redeploy**
   - Fix the issue
   - Test thoroughly
   - Create new build
   - Upload to stores

## Post-Deployment

### Week 1
- Monitor crashes and errors
- Check user feedback
- Monitor analytics
- Review performance

### Week 2-4
- Analyze user behavior
- Collect feedback
- Plan improvements
- Document learnings

## Version Management

### Semantic Versioning
```
MAJOR.MINOR.PATCH
1.0.0 = initial release
1.0.1 = bug fix
1.1.0 = new feature
2.0.0 = breaking change
```

### Release Notes Template
```markdown
## Version 1.0.0 - Initial Release

### New Features
- User authentication
- Booking system
- Service catalog

### Bug Fixes
- Fixed navigation issues
- Improved performance

### Known Issues
- Location sharing requires permission

### Installation
- Download from App Store / Play Store
- Follow setup instructions in QUICKSTART.md
```

## Compliance & Legal

### Privacy Policy
- Add to app and website
- Include data handling practices
- Outline user rights

### Terms of Service
- Define service scope
- Outline limitations
- Specify liability

### App Store Requirements
- Review guidelines compliance
- Appropriate content rating
- Icon and screenshot specifications

## Support & Maintenance

### User Support
- Setup support email
- Create FAQ page
- Provide chat support

### App Maintenance
- Regular updates
- Bug fixes
- Feature improvements

### Performance Monitoring
- Monitor app performance
- Track crash rates
- Analyze user behavior

---

**Deployment Checklist Complete?** Start building! 🚀

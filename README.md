# ESGUL Service Pro - Digital Workshop Service Mobile App

A comprehensive React Native mobile application for digital workshop service management built with Expo and Supabase.

## 📱 Features

### Authentication & Role System
- User login, registration, and password recovery
- Role-based access control (User & Admin)
- Persistent authentication with AsyncStorage
- Automatic dashboard routing based on user role

### User Dashboard
- **Service Status Card** - Real-time status of bookings (Pending, Confirmed, In Progress, Completed, Cancelled)
- **Workshop Operating Hours** - Queue status per vehicle type and time slot
- **Promotions Section** - Active promotions with claim functionality
- **About Workshop** - Vision, mission, and description
- **Professional Team** - Display of mechanics and specialists
- **Location & Contact** - Address, phone, email with Google Maps integration

### Booking Service
- Complete booking form with:
  - Service selection (dropdown)
  - Date/time picker
  - Vehicle type selection (Mobil/Motor)
  - Vehicle brand and plate number
  - Additional notes
- Form validation
- Real-time notification triggers

### Booking History
- Structured booking list with:
  - Service name and vehicle type
  - Status badges with color coding
  - Date and time information
  - Additional notes
  - Total pricing
  - Rating option for completed services

### Service Catalog
- Browse all services with details:
  - Service title and description
  - Original and discounted pricing
  - Estimated duration
  - Promotion indicators

### Admin Dashboard
- View all user bookings
- Update booking status (workflow: Pending → Confirmed → In Progress → Completed/Cancelled)
- Manage service catalog
- Real-time status management

### Chat Feature
- Real-time user-admin messaging
- Message threading and replies
- Location sharing capability
- Integration with feedback system

### Feedback & Warranty System
- Post-service rating and review
- Auto-response flow:
  - **Sudah Aman (Safe)** - Closes feedback
  - **Ada Masalah (Issue)** - Opens live chat with admin

### Notifications
- Service status updates
- Booking reminders
- Maintenance reminders
- In-app notification display with badge counts

### User Profile
- Display user information
- Editable profile (name, phone, address)
- Logout with confirmation

## 🛠️ Tech Stack

- **Framework**: React Native with Expo
- **Backend**: Supabase (PostgreSQL, Authentication, Real-time)
- **UI Library**: React Native Paper
- **Navigation**: React Navigation (Bottom Tabs + Stack)
- **State Management**: Context API + AsyncStorage
- **Language**: TypeScript
- **Maps**: Expo Location API
- **Date/Time**: @react-native-community/datetimepicker

## 📋 Project Structure

```
esgul-service-pro/
├── src/
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   └── ForgotPasswordScreen.tsx
│   │   ├── user/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── BookingScreen.tsx
│   │   │   ├── BookingHistoryScreen.tsx
│   │   │   ├── ServiceCatalogScreen.tsx
│   │   │   ├── ChatScreen.tsx
│   │   │   ├── FeedbackScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   └── admin/
│   │       └── AdminDashboardScreen.tsx
│   ├── components/
│   │   └── AuthForm.tsx
│   ├── context/
│   │   └── AuthContext.tsx
│   ├── services/
│   │   └── supabaseClient.ts
│   ├── navigation/
│   │   └── RootNavigator.tsx
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   └── assets/
├── App.tsx
├── app.json
├── package.json
├── tsconfig.json
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 16+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- Supabase account and project

### Installation

1. **Clone the repository**
```bash
cd esgul-service-pro
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Configure Supabase**
   - Create a Supabase project at https://supabase.com
   - Copy your project URL and anon key
   - Update `.env` file:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

4. **Setup Supabase Database Schema**

Create the following tables in Supabase:

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  phone VARCHAR,
  address VARCHAR,
  role VARCHAR DEFAULT 'user',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Services table
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  price INTEGER,
  duration_minutes INTEGER,
  category VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  service_id UUID REFERENCES services(id),
  vehicle_type VARCHAR,
  status VARCHAR DEFAULT 'Pending',
  booking_date DATE,
  booking_time TIME,
  vehicle_brand VARCHAR,
  vehicle_plate VARCHAR,
  notes TEXT,
  total_price INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  reply_to_id UUID REFERENCES chat_messages(id),
  location_data JSONB,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews table
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID REFERENCES bookings(id),
  rating INTEGER,
  review_text TEXT,
  status VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Promotions table
CREATE TABLE promotions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR UNIQUE NOT NULL,
  discount_percent INTEGER,
  active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Mechanics table
CREATE TABLE mechanics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  bio TEXT,
  specialty VARCHAR,
  image_url VARCHAR,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type VARCHAR,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Running the App

**Development Mode (Web)**
```bash
npm start
# or
expo start
```

**Android**
```bash
npm run android
```

**iOS**
```bash
npm run ios
```

## 🔐 Authentication Flow

1. User opens app → checks for existing session
2. If no session → directs to Login/Register
3. After login → validates user role
4. Routes to appropriate dashboard:
   - User role → User dashboard with bottom tabs
   - Admin role → Admin dashboard

## 📲 Key Screens

| Screen | Type | Features |
|--------|------|----------|
| Login | Auth | Email/password login |
| Register | Auth | New account creation |
| Forgot Password | Auth | Password reset flow |
| Home | User | Dashboard with status, queue, promos |
| Booking | User | Service booking form |
| Booking History | User | List of past/current bookings |
| Service Catalog | User | Browse all available services |
| Chat | User | Real-time support chat |
| Feedback | User | Post-service rating & review |
| Profile | User | User info & settings |
| Admin Dashboard | Admin | Booking management |

## 🎨 UI/UX Design

- **Color Scheme**: Primary (#1976d2), Secondary (#d32f2f)
- **Typography**: Clean, minimal design
- **Components**: React Native Paper for consistent Material Design
- **Responsive**: Adapts to different screen sizes

## 📞 Support

For issues or questions:
1. Check the documentation
2. Review Supabase documentation
3. Check React Navigation docs

## 📄 License

This project is licensed under the MIT License.

## 🔄 Next Steps

1. **Implement Supabase RLS policies** for data security
2. **Setup push notifications** with Firebase Cloud Messaging
3. **Integrate Google Maps API** for location services
4. **Add image upload** for service photos
5. **Implement payment integration** for booking payments
6. **Add offline mode** with local caching
7. **Setup analytics** and crash reporting
8. **Deploy to TestFlight/Play Store**

## 📦 Available Scripts

- `npm start` - Start development server
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm run web` - Run on web browser
- `npm run build` - Build for production

---

Built with ❤️ for ESGUL Service Pro

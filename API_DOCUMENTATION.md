# ESGUL Service Pro - API Documentation

## Overview
All API calls are made through Supabase with TypeScript services. No direct HTTP calls needed - services handle database operations.

## Service Modules

### 1. Authentication Service (Via AuthContext)

**Location**: `src/context/AuthContext.tsx`

#### Methods

**login(email: string, password: string): Promise<void>**
```typescript
const { login } = useAuth()
await login('user@example.com', 'password123')
```

**register(email: string, password: string, name: string): Promise<void>**
```typescript
await register('user@example.com', 'password123', 'John Doe')
```

**logout(): Promise<void>**
```typescript
await logout()
```

**forgotPassword(email: string): Promise<void>**
```typescript
await forgotPassword('user@example.com')
```

---

### 2. Booking Service

**Location**: `src/services/bookingService.ts`

#### Methods

**createBooking(data): Promise<Booking>**
```typescript
import { bookingService } from '@/services/bookingService'

const booking = await bookingService.createBooking({
  user_id: 'user-123',
  service_id: 'service-456',
  vehicle_type: 'Mobil',
  status: 'Pending',
  booking_date: '2024-01-20',
  booking_time: '09:00',
  vehicle_brand: 'Toyota',
  vehicle_plate: 'B 1234 ABC',
  notes: 'Full service needed',
  total_price: 500000,
})
```

**getUserBookings(userId: string): Promise<Booking[]>**
```typescript
const bookings = await bookingService.getUserBookings('user-123')
```

**getBookingById(id: string): Promise<Booking>**
```typescript
const booking = await bookingService.getBookingById('booking-789')
```

**updateBookingStatus(id: string, status: string): Promise<Booking>**
```typescript
const updated = await bookingService.updateBookingStatus(
  'booking-789',
  'Confirmed'
)
```

**getAllBookings(): Promise<Booking[]>** (Admin only)
```typescript
const allBookings = await bookingService.getAllBookings()
```

**cancelBooking(id: string): Promise<Booking>**
```typescript
await bookingService.cancelBooking('booking-789')
```

---

### 3. Service Catalog Service

**Location**: `src/services/serviceService.ts`

#### Methods

**getServices(): Promise<Service[]>**
```typescript
import { serviceService } from '@/services/serviceService'

const services = await serviceService.getServices()
```

**getServiceById(id: string): Promise<Service>**
```typescript
const service = await serviceService.getServiceById('service-123')
```

**getServicesByCategory(category: string): Promise<Service[]>**
```typescript
const maintenanceServices = await serviceService.getServicesByCategory('Maintenance')
```

**createService(service): Promise<Service>** (Admin only)
```typescript
const newService = await serviceService.createService({
  title: 'AC Service',
  description: 'Air conditioning system service',
  price: 300000,
  duration_minutes: 60,
  category: 'Maintenance',
})
```

**updateService(id: string, updates): Promise<Service>** (Admin only)
```typescript
const updated = await serviceService.updateService('service-123', {
  price: 350000,
})
```

**deleteService(id: string): Promise<void>** (Admin only)
```typescript
await serviceService.deleteService('service-123')
```

**getActivePromotions(): Promise<Promotion[]>**
```typescript
const promos = await serviceService.getActivePromotions()
```

---

### 4. Chat Service

**Location**: `src/services/chatService.ts`

#### Methods

**getConversation(userId: string, adminId: string): Promise<ChatMessage[]>**
```typescript
import { chatService } from '@/services/chatService'

const messages = await chatService.getConversation('user-123', 'admin-456')
```

**sendMessage(senderId, receiverId, message, locationData?): Promise<ChatMessage>**
```typescript
const msg = await chatService.sendMessage(
  'user-123',
  'admin-456',
  'Apa status booking saya?'
)
```

**replyToMessage(senderId, receiverId, message, replyToId): Promise<ChatMessage>**
```typescript
const reply = await chatService.replyToMessage(
  'user-123',
  'admin-456',
  'Terima kasih!',
  'message-789'
)
```

**shareLocation(senderId, receiverId, latitude, longitude): Promise<ChatMessage>**
```typescript
const locationMsg = await chatService.shareLocation(
  'user-123',
  'admin-456',
  -6.2088,
  106.8456
)
```

**markAsRead(messageId: string): Promise<void>**
```typescript
await chatService.markAsRead('message-789')
```

**deleteMessage(messageId: string): Promise<void>**
```typescript
await chatService.deleteMessage('message-789')
```

---

### 5. Notification Service

**Location**: `src/services/notificationService.ts`

#### Methods

**getUserNotifications(userId: string): Promise<Notification[]>**
```typescript
import { notificationService } from '@/services/notificationService'

const notifications = await notificationService.getUserNotifications('user-123')
```

**getUnreadCount(userId: string): Promise<number>**
```typescript
const count = await notificationService.getUnreadCount('user-123')
```

**markAsRead(notificationId: string): Promise<void>**
```typescript
await notificationService.markAsRead('notif-789')
```

**markAllAsRead(userId: string): Promise<void>**
```typescript
await notificationService.markAllAsRead('user-123')
```

**createNotification(userId, type, message): Promise<Notification>**
```typescript
await notificationService.createNotification(
  'user-123',
  'service_update',
  'Booking Anda telah dikonfirmasi'
)
```

**notifyBookingStatusChange(userId, bookingId, newStatus): Promise<Notification>**
```typescript
await notificationService.notifyBookingStatusChange(
  'user-123',
  'booking-456',
  'Confirmed'
)
```

**sendMaintenanceReminder(userId, vehicleType, lastServiceDate): Promise<Notification>**
```typescript
await notificationService.sendMaintenanceReminder(
  'user-123',
  'Mobil',
  '2024-01-15'
)
```

---

### 6. Review Service

**Location**: `src/services/reviewService.ts`

#### Methods

**createReview(bookingId, rating, reviewText, status): Promise<Review>**
```typescript
import { reviewService } from '@/services/reviewService'

const review = await reviewService.createReview(
  'booking-789',
  5,
  'Pelayanan sangat memuaskan!',
  'Sudah Aman'
)
```

**getBookingReview(bookingId: string): Promise<Review | null>**
```typescript
const review = await reviewService.getBookingReview('booking-789')
```

**getServiceReviews(serviceId: string): Promise<Review[]>**
```typescript
const reviews = await reviewService.getServiceReviews('service-123')
```

**getAverageRating(serviceId: string): Promise<number>**
```typescript
const avgRating = await reviewService.getAverageRating('service-123')
// Returns: 4.5
```

**updateReviewStatus(reviewId, status): Promise<Review>**
```typescript
await reviewService.updateReviewStatus('review-123', 'Ada Masalah')
```

---

## Utility Functions

### Formatting (`src/utils/formatting.ts`)

```typescript
import { formatters } from '@/utils/formatting'

// Currency
formatters.currency(500000) // "Rp 500.000"

// Date
formatters.date('2024-01-20') // "20 Januari 2024"

// Time
formatters.time('09:30:00') // "09:30"

// Status label
formatters.statusLabel('Confirmed') // "Dikonfirmasi"

// Status color
formatters.statusColor('Pending') // "#FF9800"
```

### Validation (`src/utils/validation.ts`)

```typescript
import { validators } from '@/utils/validation'

// Email
validators.email('user@example.com') // true/false

// Password strength
validators.password('MyPass123!')
// { isValid: true, score: 5, feedback: "" }

// Phone number
validators.phone('+6281234567890') // true/false

// Booking form
validators.bookingForm({
  name: 'John',
  service: 'Oil Change',
  // ...
})
// { valid: true, errors: [] }
```

---

## Error Handling

All services throw errors that should be caught:

```typescript
try {
  const booking = await bookingService.createBooking(data)
} catch (error) {
  Alert.alert('Error', error.message)
  // Handle error
}
```

---

## Data Types

### User
```typescript
interface User {
  id: string
  email: string
  name: string
  phone: string
  address: string
  role: 'user' | 'admin'
  created_at: string
}
```

### Booking
```typescript
interface Booking {
  id: string
  user_id: string
  service_id: string
  vehicle_type: 'Mobil' | 'Motor'
  status: 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled'
  booking_date: string
  booking_time: string
  vehicle_brand: string
  vehicle_plate: string
  notes: string
  total_price: number
  created_at: string
}
```

### Service
```typescript
interface Service {
  id: string
  title: string
  description: string
  price: number
  duration_minutes: number
  category: string
  created_at: string
}
```

---

## Real-time Subscriptions (Advanced)

To enable real-time updates:

```typescript
import { supabase } from '@/services/supabaseClient'

const subscription = supabase
  .from('bookings')
  .on('*', payload => {
    console.log('Booking updated:', payload)
  })
  .subscribe()

// Cleanup
return () => subscription.unsubscribe()
```

---

## Rate Limiting & Best Practices

- Cache results when possible
- Use `eq()` filters to reduce data transfer
- Batch operations when possible
- Unsubscribe from real-time updates when component unmounts
- Handle network errors gracefully


import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Alert, Image } from 'react-native'
import { TextInput, Button } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabaseClient'

interface Booking {
  id: string
  service_id: string
  booking_date: string
  booking_time: string
  status: string
  services?: { title: string }
}

interface Service {
  id: string
  title: string
  description: string
  price: number
  estimated_duration: number
}

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth()
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')
  const [reviewCount, setReviewCount] = useState(0)
  const [nextReviewTime, setNextReviewTime] = useState<string | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState('User')

  useEffect(() => {
    loadReviewCount()
    fetchUserData()
    fetchBookings()
    fetchServices()
  }, [user?.id])

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, title, description, price, estimated_duration')
        .order('title', { ascending: true })
        .limit(4)

      if (error) {
        // If estimated_duration column doesn't exist, try without it
        if (error.code === '42703') {
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('services')
            .select('id, title, description, price')
            .order('title', { ascending: true })
            .limit(4)
          
          if (fallbackError) throw fallbackError
          setServices((fallbackData || []).map(item => ({ ...item, estimated_duration: 0 })))
        } else {
          throw error
        }
      } else {
        setServices(data || [])
      }
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  const fetchUserData = async () => {
    try {
      if (!user?.id) return
      const { data, error } = await supabase
        .from('users')
        .select('name')
        .eq('id', user.id)
        .single()
      
      if (error) throw error
      if (data) setUserName(data.name || 'User')
    } catch (error) {
      console.error('Error fetching user data:', error)
    }
  }

  const fetchBookings = async () => {
    try {
      setLoading(true)
      if (!user?.id) {
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          service_id,
          booking_date,
          booking_time,
          status,
          services(title)
        `)
        .eq('user_id', user.id)
        .order('booking_date', { ascending: true })

      if (error) throw error
      setBookings(data || [])
    } catch (error) {
      console.error('Error fetching bookings:', error)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const loadReviewCount = async () => {
    try {
      const stored = await AsyncStorage.getItem('reviewData')
      if (stored) {
        const data = JSON.parse(stored)
        const now = Date.now()
        const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000

        // Filter reviews from last 24 hours
        const recentReviews = data.timestamps.filter((ts: number) => ts > twentyFourHoursAgo)

        if (recentReviews.length >= 7) {
          // Calculate next available review time
          const oldestReview = Math.min(...recentReviews)
          const nextTime = new Date(oldestReview + 24 * 60 * 60 * 1000)
          setNextReviewTime(nextTime.toLocaleTimeString())
        }

        setReviewCount(recentReviews.length)
      }
    } catch (error) {
      console.error('Error loading review count:', error)
    }
  }

  const canReview = reviewCount < 7

  const handleOpenReview = async () => {
    if (!canReview) {
      Alert.alert(
        'Review Limit Reached',
        `You can only submit 7 reviews per 24 hours.\n\nNext review available at: ${nextReviewTime}`,
        [{ text: 'OK' }]
      )
      return
    }
    setShowReviewModal(true)
  }

    const lastBooking = bookings.length > 0 ? bookings[bookings.length - 1] : null
  const upcomingBookings = bookings.filter(b => new Date(b.booking_date) >= new Date())

  const handleSubmitReview = async () => {
    if (!review.trim()) {
      Alert.alert('Error', 'Please enter a review')
      return
    }

    try {
      // Save review timestamp
      const stored = await AsyncStorage.getItem('reviewData')
      const data = stored ? JSON.parse(stored) : { timestamps: [] }
      data.timestamps.push(Date.now())

      await AsyncStorage.setItem('reviewData', JSON.stringify(data))

      Alert.alert('Thank You', 'Your review has been submitted!')
      setReview('')
      setRating(5)
      setShowReviewModal(false)
      
      // Reload review count
      loadReviewCount()
    } catch (error) {
      Alert.alert('Error', 'Failed to submit review')
      console.error('Error submitting review:', error)
    }
  }

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Clean Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back</Text>
            <Text style={styles.userName}>{userName}</Text>
          </View>
          <View style={styles.headerBadge}>
            <Image
              source={require('../../assets/logo.jpg')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.quickActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Booking')}
            >
              <MaterialCommunityIcons name="wrench" size={28} color="#8B6914" />
              <Text style={styles.actionLabel}>Book Service</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('BookingHistory')}
            >
              <MaterialCommunityIcons name="history" size={28} color="#8B6914" />
              <Text style={styles.actionLabel}>History</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => navigation.navigate('Chat')}
            >
              <MaterialCommunityIcons name="chat-outline" size={28} color="#8B6914" />
              <Text style={styles.actionLabel}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.actionButton, !canReview && styles.actionButtonDisabled]}
              onPress={handleOpenReview}
            >
              <MaterialCommunityIcons name="star-outline" size={28} color="#8B6914" />
              <Text style={styles.actionLabel}>Review</Text>
              {!canReview && <Text style={styles.limitBadge}>{reviewCount}/7</Text>}
            </TouchableOpacity>
        </View>
      </View>

      {/* Next Appointment */}
      {upcomingBookings.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Next Appointment</Text>
          <View style={styles.appointmentCard}>
            <View style={styles.appointmentLeft}>
              <Text style={styles.appointmentService}>{upcomingBookings[0].services?.title || 'Service'}</Text>
              <View style={styles.appointmentMeta}>
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons name="calendar" size={14} color="#8a8a8a" />
                  <Text style={styles.appointmentMetaText}>{upcomingBookings[0].booking_date}</Text>
                </View>
                <View style={styles.metaItem}>
                  <MaterialCommunityIcons name="clock-outline" size={14} color="#8a8a8a" />
                  <Text style={styles.appointmentMetaText}>{upcomingBookings[0].booking_time}</Text>
                </View>
              </View>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: '#8B6914' }]}>
              <Text style={styles.statusBadgeText}>{upcomingBookings[0].status}</Text>
            </View>
          </View>
        </View>
      )}
      {upcomingBookings.length === 0 && !loading && (
        <View style={styles.section}>
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="calendar-plus" size={40} color="#8B6914" />
            <Text style={styles.emptyStateText}>No upcoming appointments</Text>
            <Text style={styles.emptyStateSubtext}>Book a service to get started</Text>
          </View>
        </View>
      )}

      {/* Popular Services - Load from Real Data */}
      {services.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Popular Services</Text>
            <TouchableOpacity onPress={() => navigation.navigate('ServiceCatalog')}>
              <Text style={styles.seeAll}>View All →</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.serviceGrid}>
            {services.slice(0, 4).map((service) => (
              <View key={service.id} style={styles.serviceCard}>
                <Text style={styles.serviceCardPrice}>Rp {service.price.toLocaleString('id-ID')}</Text>
                <Text style={styles.serviceCardName}>{service.title}</Text>
                <Text style={styles.serviceCardDuration}>{service.estimated_duration} min</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Info Card */}
      <View style={styles.section}>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>⚡ Operating Hours</Text>
          <Text style={styles.infoText}>Mon - Fri: 08:00 - 17:00</Text>
          <Text style={styles.infoText}>Sat: 08:00 - 15:00</Text>
          <Text style={styles.infoText}>Sun: Closed</Text>
        </View>
      </View>

      <View style={styles.spacer} />
    </ScrollView>

    {/* Review Modal */}
    <Modal
      visible={showReviewModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowReviewModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Service Review</Text>
            <TouchableOpacity onPress={() => setShowReviewModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Modal Body */}
          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Booking Info */}
            {lastBooking ? (
              <View style={styles.bookingInfo}>
                <Text style={styles.bookingInfoLabel}>Last Service</Text>
                <Text style={styles.bookingInfoService}>{lastBooking.services?.title || 'Service'}</Text>
                <View style={styles.bookingInfoMeta}>
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons name="calendar" size={14} color="#8a8a8a" />
                    <Text style={styles.bookingInfoMetaText}>{lastBooking.booking_date}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <MaterialCommunityIcons name="clock-outline" size={14} color="#8a8a8a" />
                    <Text style={styles.bookingInfoMetaText}>{lastBooking.booking_time}</Text>
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.bookingInfo}>
                <Text style={styles.bookingInfoLabel}>No recent service</Text>
              </View>
            )}

            {/* Rating */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>How was your experience?</Text>
              <View style={styles.ratingStars}>
                {[1, 2, 3, 4, 5].map((r) => (
                  <TouchableOpacity
                    key={r}
                    style={[
                      styles.starButton,
                      rating === r && styles.starButtonActive,
                    ]}
                    onPress={() => setRating(r)}
                  >
                    <Text style={styles.starButtonText}>{r}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.ratingText}>
                {rating === 1 && '😞 Poor'}
                {rating === 2 && '😕 Fair'}
                {rating === 3 && '😐 OK'}
                {rating === 4 && '😊 Good'}
                {rating === 5 && '😍 Excellent'}
              </Text>
            </View>

            {/* Review Text */}
            <View style={styles.modalSection}>
              <Text style={styles.modalSectionTitle}>Your feedback</Text>
              <TextInput
                value={review}
                onChangeText={setReview}
                multiline
                numberOfLines={4}
                style={styles.reviewInput}
                mode="outlined"
                outlineColor="#3a3a3a"
                activeOutlineColor="#8B6914"
                textColor="#ffffff"
                placeholderTextColor="#6a6a6a"
                placeholder="Tell us about your experience..."
                theme={{
                  colors: {
                    primary: '#8B6914',
                    background: '#1f1f1f',
                    surface: '#2a2a2a',
                  },
                }}
              />
            </View>

            {/* Submit Button */}
            <Button
              mode="contained"
              onPress={handleSubmitReview}
              style={styles.submitBtn}
              buttonColor="#8B6914"
              textColor="#ffffff"
              labelStyle={styles.submitBtnLabel}
            >
              Submit Review
            </Button>

            <View style={{ height: 20 }} />
          </ScrollView>
        </View>
      </View>
    </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f1f1f',
  },
  header: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 13,
    color: '#8a8a8a',
    fontWeight: '400',
    marginBottom: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerBadge: {
    backgroundColor: '#8B6914',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  logoImage: {
    width: 50,
    height: 50,
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  seeAll: {
    fontSize: 13,
    color: '#8B6914',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  actionIcon: {
    // Icons now handled by MaterialCommunityIcons component
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
    textAlign: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  limitBadge: {
    fontSize: 9,
    fontWeight: '600',
    color: '#FF5252',
    marginTop: 2,
  },
  appointmentCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: '#8B6914',
  },
  appointmentLeft: {
    flex: 1,
  },
  appointmentService: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  appointmentMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  appointmentMetaText: {
    fontSize: 12,
    color: '#b0b0b0',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  card: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    overflow: 'hidden',
  },
  serviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  serviceCardPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#8B6914',
  },
  serviceCardName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  serviceCardDuration: {
    fontSize: 11,
    color: '#8a8a8a',
  },
  serviceItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  serviceIcon: {
    fontSize: 28,
  },
  serviceLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
  },
  servicePrice: {
    fontSize: 11,
    color: '#8B6914',
    fontWeight: '700',
  },
  infoCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#8B6914',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 10,
  },
  infoText: {
    fontSize: 12,
    color: '#b0b0b0',
    marginBottom: 6,
    lineHeight: 18,
  },
  spacer: {
    height: 24,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#2a2a2a',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  closeButton: {
    fontSize: 24,
    color: '#8B6914',
    fontWeight: '600',
  },
  modalBody: {
    padding: 24,
  },
  bookingInfo: {
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#8B6914',
    marginBottom: 24,
  },
  bookingInfoLabel: {
    fontSize: 12,
    color: '#8a8a8a',
    fontWeight: '600',
    marginBottom: 4,
  },
  bookingInfoService: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
  },
  bookingInfoMeta: {
    gap: 8,
  },
  bookingInfoMetaText: {
    fontSize: 12,
    color: '#b0b0b0',
  },
  modalSection: {
    gap: 12,
    marginBottom: 24,
  },
  modalSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#ffffff',
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 8,
  },
  starButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    alignItems: 'center',
  },
  starButtonActive: {
    backgroundColor: '#8B6914',
    borderColor: '#8B6914',
  },
  starButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  ratingText: {
    fontSize: 12,
    color: '#8B6914',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
  },
  reviewInput: {
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    textAlignVertical: 'top',
  },
  submitBtn: {
    marginTop: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  submitBtnLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 13,
    color: '#8a8a8a',
    marginTop: 6,
  },
})

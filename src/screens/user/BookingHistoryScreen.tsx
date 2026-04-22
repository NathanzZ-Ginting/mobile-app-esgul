import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, FlatList, Text, TouchableOpacity, Modal, Alert, ActivityIndicator } from 'react-native'
import { Button, TextInput } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabaseClient'

interface Booking {
  id: string
  service_id: string
  user_id: string
  booking_date: string
  booking_time: string
  status: string
  notes?: string
  price?: number
  services?: { title: string; price: number }
  rating?: number
}

export const BookingHistoryScreen: React.FC = () => {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const [showReviewModal, setShowReviewModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [rating, setRating] = useState(5)
  const [review, setReview] = useState('')
  const [reviewCount, setReviewCount] = useState(0)
  const [nextReviewTime, setNextReviewTime] = useState<string | null>(null)

  useEffect(() => {
    loadReviewCount()
    fetchBookings()
  }, [user?.id])

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
          user_id,
          booking_date,
          booking_time,
          status,
          notes,
          services(title, price)
        `)
        .eq('user_id', user.id)
        .order('booking_date', { ascending: false })

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

  const handleOpenReview = (booking: Booking) => {
    if (!canReview) {
      Alert.alert(
        'Review Limit Reached',
        `You can only submit 7 reviews per 24 hours.\n\nNext review available at: ${nextReviewTime}`,
        [{ text: 'OK' }]
      )
      return
    }
    setSelectedBooking(booking)
    setRating(5)
    setReview('')
    setShowReviewModal(true)
  }

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Menunggu Konfirmasi':
        return '#FF9800'
      case 'Dikonfirmasi':
        return '#2196F3'
      case 'Sedang Dikerjakan':
        return '#4CAF50'
      case 'Selesai':
        return '#8BC34A'
      case 'Dibatalkan':
        return '#F44336'
      default:
        return '#999'
    }
  }

  // Unused - keeping for reference
  // const getStatusIcon = (status: string) => {
  //   switch (status) {
  //     case 'Menunggu Konfirmasi':
  //       return '⏳'
  //     case 'Dikonfirmasi':
  //       return '✓'
  //     case 'Sedang Dikerjakan':
  //       return '⚙️'
  //     case 'Selesai':
  //       return '✓✓'
  //     case 'Dibatalkan':
  //       return '✕'
  //     default:
  //       return '◯'
  //   }
  // }

  const renderBooking = ({ item }: { item: Booking }) => (
    <View style={styles.bookingCard}>
      <View style={styles.cardContent}>
        {/* Header with Service and Status */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.serviceName}>{item.services?.title || 'Service'}</Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(item.status)}20` },
            ]}
          >
            <Text
              style={[styles.status, { color: getStatusColor(item.status) }]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        {/* DateTime */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="calendar" size={14} color="#8a8a8a" />
            <Text style={styles.infoLabel}>{item.booking_date}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialCommunityIcons name="clock-outline" size={14} color="#8a8a8a" />
            <Text style={styles.infoLabel}>{item.booking_time}</Text>
          </View>
        </View>

        {/* Notes */}
        {item.notes && (
          <View style={styles.notesSection}>
            <View style={styles.notesLabelContainer}>
              <MaterialCommunityIcons name="note-text-outline" size={14} color="#8a8a8a" />
              <Text style={styles.notesLabel}>Catatan</Text>
            </View>
            <Text style={styles.notesValue}>{item.notes}</Text>
          </View>
        )}

        {/* Footer - Price and Rating */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.priceLabel}>Total Harga</Text>
            <Text style={styles.price}>
              Rp {(item.services?.price || 0).toLocaleString('id-ID')}
            </Text>
          </View>
          {item.status === 'Selesai' && (
            <Button
              mode="contained"
              labelStyle={styles.reviewButtonLabel}
              style={styles.reviewButton}
              onPress={() => handleOpenReview(item)}
            >
              Review
            </Button>
          )}
        </View>
      </View>
    </View>
  )

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>Booking History</Text>
        <Text style={styles.pageSubtitle}>Manage your service bookings</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B6914" />
        </View>
      ) : bookings.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="calendar-blank" size={50} color="#8B6914" />
          <Text style={styles.emptyText}>No bookings yet</Text>
          <Text style={styles.emptySubtext}>Your booking history will appear here</Text>
        </View>
      ) : (
        <FlatList
          data={bookings}
          renderItem={renderBooking}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={styles.list}
        />
      )}

      {/* Review Modal */}
      <Modal visible={showReviewModal} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Write Your Review</Text>
              <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView style={styles.modalBody}>
              {/* Booking Info */}
               {selectedBooking && (
                 <View style={styles.bookingInfo}>
                   <Text style={styles.bookingInfoLabel}>Service</Text>
                   <Text style={styles.bookingInfoService}>
                    {selectedBooking.services?.title || 'Service'}
                   </Text>
                   <View style={styles.bookingInfoMeta}>
                     <View style={styles.metaItem}>
                       <MaterialCommunityIcons name="calendar" size={14} color="#8a8a8a" />
                        <Text style={styles.bookingInfoMetaText}>{selectedBooking.booking_date}</Text>
                     </View>
                     <View style={styles.metaItem}>
                       <MaterialCommunityIcons name="clock-outline" size={14} color="#8a8a8a" />
                        <Text style={styles.bookingInfoMetaText}>{selectedBooking.booking_time}</Text>
                     </View>
                   </View>
                 </View>
               )}

              {/* Rating */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Your Rating</Text>
                <View style={styles.ratingStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity
                      key={star}
                      style={[
                        styles.starButton,
                        rating >= star && styles.starButtonActive,
                      ]}
                      onPress={() => setRating(star)}
                    >
                      <MaterialCommunityIcons 
                        name={rating >= star ? 'star' : 'star-outline'} 
                        size={20} 
                        color={rating >= star ? '#8B6914' : '#666666'} 
                      />
                      <Text style={styles.starButtonText}>{star}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {rating > 0 && (
                  <Text style={styles.ratingText}>{rating} out of 5 stars</Text>
                )}
              </View>

              {/* Review Text */}
              <View style={styles.modalSection}>
                <Text style={styles.modalSectionTitle}>Your Review</Text>
                <TextInput
                  mode="outlined"
                  multiline
                  numberOfLines={5}
                  placeholder="Share your experience..."
                  placeholderTextColor="#666"
                  value={review}
                  onChangeText={setReview}
                  style={styles.reviewInput}
                  outlineColor="#3a3a3a"
                  activeOutlineColor="#8B6914"
                  textColor="#ffffff"
                />
              </View>

              {/* Submit Button */}
              <Button
                mode="contained"
                style={styles.submitBtn}
                labelStyle={styles.submitBtnLabel}
                onPress={handleSubmitReview}
                buttonColor="#8B6914"
              >
                Submit Review
              </Button>

              <View style={{ height: 24 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f1f1f',
  },
  pageHeader: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#8B6914',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  pageSubtitle: {
    fontSize: 13,
    color: 'rgba(224, 224, 224, 0.7)',
    marginTop: 4,
  },
  list: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  bookingCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 1,
    overflow: 'hidden',
  },
  cardContent: {
    padding: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerLeft: {
    flex: 1,
    marginRight: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  vehicleTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  vehicleType: {
    fontSize: 12,
    color: '#b0b0b0',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  statusIcon: {
    fontSize: 12,
    lineHeight: 12,
  },
  status: {
    fontSize: 11,
    fontWeight: '700',
  },
  infoSection: {
    gap: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoLabel: {
    fontSize: 12,
    color: '#d0d0d0',
    fontWeight: '500',
  },
  notesSection: {
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  notesLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8a8a8a',
  },
  notesValue: {
    fontSize: 12,
    color: '#b0b0b0',
    lineHeight: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  priceLabel: {
    fontSize: 11,
    color: '#8a8a8a',
    fontWeight: '500',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B6914',
    marginTop: 2,
  },
  reviewButton: {
    borderRadius: 8,
    backgroundColor: '#8B6914',
  },
  reviewButtonLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
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
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    justifyContent: 'center',
    gap: 4,
    flexDirection: 'column',
  },
  starButtonActive: {
    backgroundColor: '#8B6914',
    borderColor: '#8B6914',
  },
  starButtonText: {
    fontSize: 12,
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
  ratingButton: {
    borderRadius: 8,
    borderColor: '#8B6914',
  },
  ratingButtonLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#8a8a8a',
    marginTop: 6,
  },
})

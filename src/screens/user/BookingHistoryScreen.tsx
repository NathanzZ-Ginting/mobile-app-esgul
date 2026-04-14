import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, FlatList, Text, TouchableOpacity } from 'react-native'
import { Button } from 'react-native-paper'

interface Booking {
  id: string
  service: string
  vehicleType: string
  status: 'Menunggu Konfirmasi' | 'Dikonfirmasi' | 'Sedang Dikerjakan' | 'Selesai' | 'Dibatalkan'
  date: string
  time: string
  notes: string
  totalPrice: number
  rating?: number
}

export const BookingHistoryScreen: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: '1',
      service: 'Oil Change',
      vehicleType: 'Mobil',
      status: 'Selesai',
      date: '2024-01-15',
      time: '09:00',
      notes: 'Regular maintenance',
      totalPrice: 150000,
      rating: 4.5,
    },
    {
      id: '2',
      service: 'Tire Installation',
      vehicleType: 'Motor',
      status: 'Dikonfirmasi',
      date: '2024-01-18',
      time: '10:00',
      notes: 'Replace worn tires',
      totalPrice: 200000,
    },
  ])

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Menunggu Konfirmasi':
        return '⏳'
      case 'Dikonfirmasi':
        return '✓'
      case 'Sedang Dikerjakan':
        return '⚙️'
      case 'Selesai':
        return '✓✓'
      case 'Dibatalkan':
        return '✕'
      default:
        return '◯'
    }
  }

  const renderBooking = ({ item }: { item: Booking }) => (
    <View style={styles.bookingCard}>
      <View style={styles.cardContent}>
        {/* Header with Service and Status */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.serviceName}>{item.service}</Text>
            <Text style={styles.vehicleType}>
              {item.vehicleType === 'Mobil' ? '🚗' : '🏍️'} {item.vehicleType}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(item.status)}20` },
            ]}
          >
            <Text style={styles.statusIcon}>{getStatusIcon(item.status)}</Text>
            <Text
              style={[styles.status, { color: getStatusColor(item.status) }]}
            >
              {item.status}
            </Text>
          </View>
        </View>

        {/* DateTime */}
        <View style={styles.infoSection}>
          <Text style={styles.infoLabel}>📅 {item.date}</Text>
          <Text style={styles.infoLabel}>⏰ {item.time}</Text>
        </View>

        {/* Notes */}
        {item.notes && (
          <View style={styles.notesSection}>
            <Text style={styles.notesLabel}>📝 Catatan</Text>
            <Text style={styles.notesValue}>{item.notes}</Text>
          </View>
        )}

        {/* Footer - Price and Rating */}
        <View style={styles.footer}>
          <View>
            <Text style={styles.priceLabel}>Total Harga</Text>
            <Text style={styles.price}>
              Rp {item.totalPrice.toLocaleString('id-ID')}
            </Text>
          </View>
          {item.status === 'Selesai' && (
            <Button
              mode={item.rating ? 'text' : 'outlined'}
              size="small"
              labelStyle={styles.ratingButtonLabel}
              style={styles.ratingButton}
            >
              {item.rating ? `⭐ ${item.rating}` : 'Rate'}
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

      <FlatList
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.list}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  pageHeader: {
    backgroundColor: '#2c5aa0',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  pageSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  list: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  bookingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
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
    color: '#1a1a1a',
  },
  vehicleType: {
    fontSize: 12,
    color: '#8a8a8a',
    marginTop: 4,
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
    flexDirection: 'row',
    gap: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: '#5a5a5a',
    fontWeight: '500',
  },
  notesSection: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  notesLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  notesValue: {
    fontSize: 12,
    color: '#5a5a5a',
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
    color: '#2c5aa0',
    marginTop: 2,
  },
  ratingButton: {
    borderRadius: 8,
    borderColor: '#2c5aa0',
  },
  ratingButtonLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
})

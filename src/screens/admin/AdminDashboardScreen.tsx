import React, { useState, useEffect } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  Text,
  Alert,
  TouchableOpacity,
  Modal,
  Dimensions,
  ActivityIndicator,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Menu, TextInput } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabaseClient'

interface AdminBooking {
  id: string
  users?: { name: string }
  user_id: string
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

interface Review {
  id: string
  booking_id: string
  rating: number
  review_text?: string
  created_at: string
  bookings?: { users?: { name: string }; services?: { title: string } }
}

interface DashboardStats {
  totalBookings: number
  pendingBookings: number
  completedBookings: number
  totalServices: number
}

type TabType = 'overview' | 'bookings' | 'services' | 'reviews'

export const AdminDashboardScreen: React.FC = () => {
  const { logout } = useAuth()
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [menuVisible, setMenuVisible] = useState<{ [key: string]: boolean }>({})
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [reviews, setReviews] = useState<Review[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalServices: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const [bookingsData, servicesDataResult, reviewsData] = await Promise.all([
        supabase
          .from('bookings')
          .select('id, user_id, service_id, booking_date, booking_time, status, users(name), services(title)'),
        supabase
          .from('services')
          .select('id, title, description, price, estimated_duration'),
        supabase
          .from('reviews')
          .select('id, booking_id, rating, review_text, created_at, bookings(users(name), services(title))'),
      ])

      if (bookingsData.error) throw bookingsData.error
      
      let servicesData = servicesDataResult

      // Handle missing estimated_duration column
      if (servicesData.error && servicesData.error.code === '42703') {
        const fallbackResult = await supabase
          .from('services')
          .select('id, title, description, price')
        if (fallbackResult.error) throw fallbackResult.error
        servicesData = {
          data: (fallbackResult.data || []).map(item => ({ ...item, estimated_duration: 0 })),
          error: null,
        }
      } else if (servicesData.error) {
        throw servicesData.error
      }

      const bookingsList = (bookingsData.data || []) as AdminBooking[]
      const servicesList = (servicesData.data || []) as Service[]
      const reviewsList = (reviewsData.data || []) as Review[]

      setBookings(bookingsList)
      setServices(servicesList)
      setReviews(reviewsList)

      // Calculate stats
      setStats({
        totalBookings: bookingsList.length,
        pendingBookings: bookingsList.filter((b) => b.status === 'Pending').length,
        completedBookings: bookingsList.filter((b) => b.status === 'Completed').length,
        totalServices: servicesList.length,
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const [showServiceModal, setShowServiceModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [newService, setNewService] = useState<Service>({
    id: '',
    title: '',
    description: '',
    price: 0,
    estimated_duration: 0,
  })
  const [deleteServiceId, setDeleteServiceId] = useState<string | null>(null)

  const statuses = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled']

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  const handleLogout = () => {
    console.log('🚪 Logout button clicked')
    setShowLogoutConfirm(true)
  }

  const confirmLogout = async () => {
    try {
      console.log('🔄 Admin logout...')
      setShowLogoutConfirm(false)
      await logout()
      console.log('✅ Admin logout successful')
    } catch (error) {
      console.error('❌ Admin logout error:', error)
      setShowLogoutConfirm(false)
    }
  }

  const updateStatus = async (bookingId: string, newStatus: string) => {
    try {
      // Find the current booking to check its status
      const currentBooking = bookings.find((b) => b.id === bookingId)
      if (!currentBooking) {
        Alert.alert('Error', 'Booking not found')
        return
      }

      // Prevent status changes if already completed or cancelled
      if (currentBooking.status === 'Completed' || currentBooking.status === 'Cancelled') {
        Alert.alert('Cannot Update', `Status cannot be changed from ${currentBooking.status}`)
        setMenuVisible({ ...menuVisible, [bookingId]: false })
        return
      }

      const { error } = await supabase
        .from('bookings')
        .update({ status: newStatus })
        .eq('id', bookingId)

      if (error) throw error

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: newStatus } : b
        )
      )
      setMenuVisible({ ...menuVisible, [bookingId]: false })
      Alert.alert('Success', `Status updated to ${newStatus}`)
    } catch (error) {
      console.error('Error updating booking status:', error)
      Alert.alert('Error', 'Failed to update status')
    }
  }

  // Service add/edit functionality disabled - loading real data from Supabase
  // const handleAddService = () => {
  //   if (!newService.title || !newService.price || !newService.estimated_duration) {
  //     Alert.alert('Error', 'Please fill all fields')
  //     return
  //   }
  //
  //   if (editingService) {
  //     setServices((prev) =>
  //       prev.map((s) => (s.id === editingService.id ? newService : s))
  //     )
  //     Alert.alert('Success', 'Service updated')
  //   } else {
  //     const service = {
  //       ...newService,
  //       id: Date.now().toString(),
  //     }
  //     setServices((prev) => [...prev, service])
  //     Alert.alert('Success', 'Service added')
  //   }
  //
  //   setShowServiceModal(false)
  //   setNewService({
  //     id: '',
  //     title: '',
  //     description: '',
  //     price: 0,
  //     estimated_duration: 0,
  //   })
  //   setEditingService(null)
  // }

  const handleAddService = async () => {
    if (!newService.title || !newService.description || !newService.price || !newService.estimated_duration) {
      Alert.alert('Error', 'Please fill all fields')
      return
    }

    try {
      if (editingService) {
        // Update existing service
        const { error } = await supabase
          .from('services')
          .update({
            title: newService.title,
            description: newService.description,
            price: newService.price,
            estimated_duration: newService.estimated_duration,
          })
          .eq('id', editingService.id)

        if (error) throw error

        setServices((prev) =>
          prev.map((s) => (s.id === editingService.id ? newService : s))
        )
        Alert.alert('Success', 'Service updated')
      } else {
        // Add new service
        const { data, error } = await supabase
          .from('services')
          .insert({
            title: newService.title,
            description: newService.description,
            price: newService.price,
            estimated_duration: newService.estimated_duration,
          })
          .select()

        if (error) throw error

        if (data && data.length > 0) {
          setServices((prev) => [...prev, data[0]])
          Alert.alert('Success', 'Service added')
        }
      }

      setShowServiceModal(false)
      setNewService({
        id: '',
        title: '',
        description: '',
        price: 0,
        estimated_duration: 0,
      })
      setEditingService(null)
    } catch (error) {
      console.error('Error saving service:', error)
      Alert.alert('Error', 'Failed to save service')
    }
  }

  const handleEditService = (service: Service) => {
    setEditingService(service)
    setNewService(service)
    setShowServiceModal(true)
  }

  const handleDeleteService = (serviceId: string) => {
    console.log('🗑️ Delete button clicked for service:', serviceId)
    setDeleteServiceId(serviceId)
  }

  const confirmDeleteService = async () => {
    if (!deleteServiceId) return

    console.log('🗑️ Delete confirmed for service:', deleteServiceId)
    try {
      console.log('📡 Sending delete request to Supabase for service:', deleteServiceId)
      const { data, error, status } = await supabase
        .from('services')
        .delete()
        .eq('id', deleteServiceId)
        .select()

      console.log('📡 Delete response:', { status, data, error })

      if (error) {
        console.error('❌ Delete error:', error)
        Alert.alert('Error', error.message || 'Failed to delete service')
        setDeleteServiceId(null)
        return
      }

      console.log('✅ Service deleted successfully from DB')
      setServices((prev) => {
        const updated = prev.filter((s) => s.id !== deleteServiceId)
        console.log('Updated services list, removed:', deleteServiceId)
        return updated
      })
      Alert.alert('Success', 'Service deleted')
      setDeleteServiceId(null)
    } catch (error: any) {
      console.error('❌ Exception during delete:', error?.message, error)
      Alert.alert('Error', error?.message || 'Failed to delete service')
      setDeleteServiceId(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return '#FF9800'
      case 'Confirmed': return '#2196F3'
      case 'In Progress': return '#4CAF50'
      case 'Completed': return '#8BC34A'
      case 'Cancelled': return '#F44336'
      default: return '#999'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending': return 'P'
      case 'Confirmed': return 'C'
      case 'In Progress': return 'IP'
      case 'Completed': return 'D'
      case 'Cancelled': return 'X'
      default: return 'O'
    }
  }

  const renderBooking = ({ item }: { item: AdminBooking }) => (
    <View style={styles.bookingCard}>
      <View style={styles.cardInner}>
        {/* Top Row: User + Status */}
        <View style={styles.topRow}>
          <View style={styles.userSection}>
            <Text style={styles.userName}>{item.users?.name || 'Unknown'}</Text>
            <Text style={styles.serviceText}>{item.services?.title || 'Service'}</Text>
          </View>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: `${getStatusColor(item.status)}20` },
            ]}
          >
            <Text style={[styles.statusLabel, { color: getStatusColor(item.status) }]}>
              {item.status}
            </Text>
          </View>
        </View>

        {/* Middle Row: Details */}
        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="calendar" size={16} color="#8B6914" />
            <Text style={styles.detail}>{item.booking_date}</Text>
          </View>
          <View style={styles.detailItem}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#8B6914" />
            <Text style={styles.detail}>{item.booking_time}</Text>
          </View>
        </View>

        {/* Bottom Row: Status Button */}
        {item.status !== 'Completed' && item.status !== 'Cancelled' ? (
          <Menu
            visible={menuVisible[item.id] || false}
            onDismiss={() => setMenuVisible({ ...menuVisible, [item.id]: false })}
            anchor={
              <TouchableOpacity
                style={styles.statusChangeBtn}
                onPress={() => setMenuVisible({ ...menuVisible, [item.id]: true })}
              >
                <Text style={styles.statusChangeBtnText}>Change Status</Text>
              </TouchableOpacity>
            }
          >
            {statuses.map((status) => (
              <Menu.Item
                key={status}
                onPress={() => updateStatus(item.id, status)}
                title={status}
              />
            ))}
          </Menu>
        ) : (
          <View style={[styles.statusChangeBtn, { opacity: 0.5 }]}>
            <Text style={[styles.statusChangeBtnText, { color: '#999' }]}>Status Locked</Text>
          </View>
        )}
      </View>
    </View>
  )

  const renderService = ({ item }: { item: Service }) => (
    <View style={styles.serviceCard}>
      <View style={styles.cardInner}>
        <View style={styles.serviceTop}>
          <View style={{ flex: 1 }}>
            <Text style={styles.serviceName}>{item.title}</Text>
            <Text style={styles.serviceDescription}>{item.description}</Text>
          </View>
        </View>

        <View style={styles.serviceMeta}>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>💰 Price</Text>
            <Text style={styles.metaValue}>Rp {item.price.toLocaleString('id-ID')}</Text>
          </View>
          <View style={styles.metaItem}>
            <Text style={styles.metaLabel}>⏱️ Duration</Text>
            <Text style={styles.metaValue}>{item.estimated_duration} min</Text>
          </View>
        </View>

        <View style={styles.serviceActions}>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => handleEditService(item)}
          >
            <Text style={styles.editBtnText}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => handleDeleteService(item.id)}
          >
            <Text style={styles.deleteBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )

  const renderReview = ({ item }: { item: Review }) => {
    const avgRating = reviews.length > 0 
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : '0'
    
    return (
      <View style={styles.bookingCard}>
        <View style={styles.cardInner}>
          <View style={styles.topRow}>
            <View style={styles.userSection}>
              <Text style={styles.userName}>
                {item.bookings?.users?.name || 'Unknown User'}
              </Text>
              <Text style={styles.serviceText}>
                {item.bookings?.services?.title || 'Service'}
              </Text>
            </View>
            <View style={styles.ratingContainer}>
              <MaterialCommunityIcons name="star" size={20} color="#FFD700" />
              <Text style={styles.ratingText}>{item.rating}/5</Text>
            </View>
          </View>

          {item.review_text && (
            <View style={styles.reviewTextContainer}>
              <Text style={styles.reviewText}>{item.review_text}</Text>
            </View>
          )}

          <View style={styles.detailsRow}>
            <MaterialCommunityIcons name="calendar" size={16} color="#8B6914" />
            <Text style={styles.detail}>
              {new Date(item.created_at).toLocaleDateString('id-ID')}
            </Text>
          </View>
        </View>
      </View>
    )
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Admin Control</Text>
            <Text style={styles.headerSubtitle}>Manage workshop operations</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Navigation Tabs */}
      <View style={styles.tabBar}>
        {(['overview', 'bookings', 'services', 'reviews'] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[
                styles.tabButtonText,
                activeTab === tab && styles.activeTabButtonText,
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B6914" />
        </View>
      ) : (
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'overview' && (
          <View style={styles.section}>
            {/* Welcome Card */}
            <View style={styles.welcomeCard}>
              <View>
                <Text style={styles.welcomeTitle}>Welcome Back! 👋</Text>
                <Text style={styles.welcomeSubtitle}>Workshop Admin Dashboard</Text>
              </View>
              <Text style={styles.welcomeTime}>Today's Overview</Text>
            </View>

            {/* Main Stats Grid */}
            <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>Key Metrics</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCardLarge, { backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }]}>
                <MaterialCommunityIcons name="calendar-range" size={32} color="#8B6914" />
                <Text style={styles.statCardLabel}>Total Bookings</Text>
                <Text style={[styles.statCardValueLarge, { color: '#8B6914' }]}>{stats.totalBookings}</Text>
              </View>
              <View style={[styles.statCardLarge, { backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }]}>
                <MaterialCommunityIcons name="clock-check-outline" size={32} color="#8B6914" />
                <Text style={styles.statCardLabel}>Pending Review</Text>
                <Text style={[styles.statCardValueLarge, { color: '#8B6914' }]}>{stats.pendingBookings}</Text>
              </View>
              <View style={[styles.statCardLarge, { backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }]}>
                <MaterialCommunityIcons name="check-circle-outline" size={32} color="#8B6914" />
                <Text style={styles.statCardLabel}>Completed</Text>
                <Text style={[styles.statCardValueLarge, { color: '#8B6914' }]}>{stats.completedBookings}</Text>
              </View>
              <View style={[styles.statCardLarge, { backgroundColor: '#2a2a2a', borderColor: '#3a3a3a' }]}>
                <MaterialCommunityIcons name="wrench" size={32} color="#8B6914" />
                <Text style={styles.statCardLabel}>Services</Text>
                <Text style={[styles.statCardValueLarge, { color: '#8B6914' }]}>{stats.totalServices}</Text>
              </View>
            </View>

            {/* Progress Section */}
            <View style={styles.progressSection}>
              <View style={styles.progressCard}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressTitle}>Booking Progress</Text>
                  <Text style={styles.progressPercent}>
                    {Math.round((stats.completedBookings / stats.totalBookings) * 100)}%
                  </Text>
                </View>
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${(stats.completedBookings / stats.totalBookings) * 100}%`,
                      },
                    ]}
                  />
                </View>
                <View style={styles.progressStats}>
                  <View style={styles.progressStat}>
                    <Text style={styles.progressStatLabel}>Completed</Text>
                    <Text style={styles.progressStatValue}>{stats.completedBookings}</Text>
                  </View>
                  <View style={styles.progressDivider} />
                  <View style={styles.progressStat}>
                    <Text style={styles.progressStatLabel}>Remaining</Text>
                    <Text style={styles.progressStatValue}>
                      {stats.totalBookings - stats.completedBookings}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Quick Stats */}
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Quick Overview</Text>
            <View style={styles.quickStatsContainer}>
              <TouchableOpacity
                style={styles.quickStatItem}
                onPress={() => {
                  console.log('Active Bookings clicked')
                  setActiveTab('bookings')
                }}
              >
                <View style={styles.quickStatIconBox}>
                  <MaterialCommunityIcons name="lightning-bolt" size={24} color="#8B6914" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.quickStatTitle}>Active Bookings</Text>
                  <Text style={styles.quickStatValue}>
                    {bookings.filter((b) => b.status === 'In Progress' || b.status === 'Confirmed').length}
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#8B6914" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickStatItem}
                onPress={() => {
                  console.log('Need Attention clicked')
                  setActiveTab('bookings')
                }}
              >
                <View style={[styles.quickStatIconBox, { backgroundColor: '#fff3e0' }]}>
                  <MaterialCommunityIcons name="alert-circle-outline" size={24} color="#FF9800" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.quickStatTitle}>Need Attention</Text>
                  <Text style={styles.quickStatValue}>{stats.pendingBookings}</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#FF9800" />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.quickStatItem}
                onPress={() => {
                  console.log('Avg. Rating clicked')
                  setActiveTab('reviews')
                }}
              >
                <View style={[styles.quickStatIconBox, { backgroundColor: '#e8f5e9' }]}>
                  <MaterialCommunityIcons name="star" size={24} color="#4CAF50" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.quickStatTitle}>Avg. Rating</Text>
                  <Text style={styles.quickStatValue}>4.8</Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={24} color="#4CAF50" />
              </TouchableOpacity>
            </View>

            {/* Recent Bookings */}
            <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Latest Bookings</Text>
            <FlatList
              data={bookings.slice(0, 3)}
              renderItem={renderBooking}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.listContainer}
            />
          </View>
        )}

        {activeTab === 'bookings' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>All Bookings ({bookings.length})</Text>
            <FlatList
              data={bookings}
              renderItem={renderBooking}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.listContainer}
            />
          </View>
        )}

        {activeTab === 'services' && (
          <View style={styles.section}>
            <View style={styles.serviceHeader}>
              <Text style={styles.sectionTitle}>Service Catalog</Text>
              <TouchableOpacity
                style={styles.addBtn}
                onPress={() => {
                  setEditingService(null)
                  setNewService({
                    id: '',
                    title: '',
                    description: '',
                    price: 0,
                    estimated_duration: 0,
                  })
                  setShowServiceModal(true)
                }}
              >
                <Text style={styles.addBtnText}>+ Add Service</Text>
              </TouchableOpacity>
            </View>
            {services.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No services available</Text>
              </View>
            ) : (
            <FlatList
              data={services}
              renderItem={renderService}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.listContainer}
            />
            )}
          </View>
        )}

        {activeTab === 'reviews' && (
          <View style={styles.section}>
            <View style={styles.serviceHeader}>
              <Text style={styles.sectionTitle}>Customer Reviews</Text>
              <View style={styles.avgRatingBadge}>
                <MaterialCommunityIcons name="star" size={18} color="#FFD700" />
                <Text style={styles.avgRatingText}>
                  {reviews.length > 0 
                    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
                    : '0'}
                </Text>
              </View>
            </View>
            {reviews.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No reviews yet</Text>
              </View>
            ) : (
            <FlatList
              data={reviews}
              renderItem={renderReview}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={styles.listContainer}
            />
            )}
          </View>
        )}

        <View style={styles.bottomSpacer} />
      </ScrollView>
      )}

      {/* Service Modal */}
      <Modal visible={showServiceModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingService ? 'Edit Service' : 'Add New Service'}
              </Text>
              <TouchableOpacity onPress={() => setShowServiceModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalForm}>
              <TextInput
                label="Service Name"
                value={newService.title}
                onChangeText={(text) => setNewService({ ...newService, title: text })}
                mode="outlined"
                outlineColor="#e8e8e8"
                activeOutlineColor="#2c5aa0"
                textColor="#ffffff"
                style={styles.input}
              />

              <TextInput
                label="Description"
                value={newService.description}
                onChangeText={(text) => setNewService({ ...newService, description: text })}
                mode="outlined"
                outlineColor="#e8e8e8"
                activeOutlineColor="#2c5aa0"
                textColor="#ffffff"
                multiline
                numberOfLines={3}
                style={[styles.input, { marginTop: 12 }]}
              />

              <TextInput
                label="Price (Rp)"
                value={newService.price.toString()}
                onChangeText={(text) =>
                  setNewService({ ...newService, price: parseInt(text) || 0 })
                }
                keyboardType="numeric"
                mode="outlined"
                outlineColor="#e8e8e8"
                activeOutlineColor="#2c5aa0"
                textColor="#ffffff"
                style={[styles.input, { marginTop: 12 }]}
              />

              <TextInput
                label="Duration (minutes)"
                value={newService.estimated_duration.toString()}
                onChangeText={(text) =>
                  setNewService({ ...newService, estimated_duration: parseInt(text) || 0 })
                }
                keyboardType="numeric"
                mode="outlined"
                outlineColor="#e8e8e8"
                activeOutlineColor="#2c5aa0"
                textColor="#ffffff"
                style={[styles.input, { marginTop: 12, marginBottom: 24 }]}
              />
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowServiceModal(false)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.submitBtn} onPress={handleAddService}>
                <Text style={styles.submitBtnText}>
                  {editingService ? 'Update' : 'Add'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete Service Confirmation Modal */}
      <Modal visible={deleteServiceId !== null} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.logoutModalContent}>
            <Text style={styles.logoutModalTitle}>Delete Service</Text>
            <Text style={styles.logoutModalMessage}>
              Are you sure you want to delete this service?
            </Text>

            <View style={styles.logoutModalButtons}>
              <TouchableOpacity
                style={styles.logoutCancelButton}
                onPress={() => setDeleteServiceId(null)}
              >
                <Text style={styles.logoutCancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.logoutConfirmButton, { backgroundColor: '#F44336' }]}
                onPress={confirmDeleteService}
              >
                <Text style={styles.logoutConfirmButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal visible={showLogoutConfirm} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.logoutModalContent}>
            <Text style={styles.logoutModalTitle}>Logout</Text>
            <Text style={styles.logoutModalMessage}>
              Are you sure you want to logout?
            </Text>

            <View style={styles.logoutModalButtons}>
              <TouchableOpacity
                style={styles.logoutCancelButton}
                onPress={() => setShowLogoutConfirm(false)}
              >
                <Text style={styles.logoutCancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.logoutConfirmButton}
                onPress={confirmLogout}
              >
                <Text style={styles.logoutConfirmButtonText}>Logout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#2a2a2a',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2a2a2a',
  },
  header: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#8B6914',
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(224, 224, 224, 0.7)',
    marginTop: 4,
  },
  logoutBtn: {
    backgroundColor: '#8B6914',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#2a2a2a',
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTabButton: {
    borderBottomColor: '#8B6914',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#999999',
  },
  activeTabButtonText: {
    color: '#8B6914',
  },
  content: {
    flex: 1,
    backgroundColor: '#2a2a2a',
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e0e0e0',
    marginBottom: 16,
  },
  listContainer: {
    gap: 12,
  },
  bookingCard: {
    backgroundColor: 'rgba(45, 45, 45, 0.95)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6B5D47',
    overflow: 'hidden',
  },
  serviceCard: {
    backgroundColor: 'rgba(45, 45, 45, 0.95)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#6B5D47',
    overflow: 'hidden',
  },
  cardInner: {
    padding: 14,
    gap: 12,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userSection: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#e0e0e0',
  },
  serviceText: {
    fontSize: 12,
    color: '#a89968',
    marginTop: 2,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
    gap: 3,
  },
  statusIconSmall: {
    fontSize: 10,
    lineHeight: 10,
  },
  statusLabel: {
    fontSize: 10,
    fontWeight: '700',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 12,
    flexWrap: 'wrap',
  },
  detailsRow: {
    flexDirection: 'row',
    gap: 16,
    marginVertical: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detail: {
    fontSize: 11,
    color: '#b0b0b0',
  },
  statusChangeBtn: {
    backgroundColor: 'rgba(139, 105, 20, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusChangeBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a89968',
  },
  serviceTop: {
    marginBottom: 4,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e0e0e0',
  },
  serviceDescription: {
    fontSize: 12,
    color: '#a89968',
    marginTop: 2,
  },
  serviceMeta: {
    flexDirection: 'row',
    gap: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#3a3a3a',
  },
  metaItem: {
    flex: 1,
  },
  metaLabel: {
    fontSize: 11,
    color: '#999999',
    fontWeight: '500',
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8B6914',
    marginTop: 2,
  },
  serviceActions: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#8B6914',
    alignItems: 'center',
  },
  editBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a89968',
  },
  deleteBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d32f2f',
    alignItems: 'center',
  },
  deleteBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ff6b6b',
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addBtn: {
    backgroundColor: '#8B6914',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 12,
  },
  bottomSpacer: {
    height: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'rgba(45, 45, 45, 0.95)',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    maxHeight: '90%',
    borderWidth: 2,
    borderColor: '#6B5D47',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#e0e0e0',
  },
  closeBtn: {
    fontSize: 20,
    color: '#999999',
  },
  modalForm: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  input: {
    marginBottom: 12,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#3a3a3a',
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#6B5D47',
    alignItems: 'center',
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#a89968',
  },
  submitBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#8B6914',
    alignItems: 'center',
  },
  submitBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  welcomeCard: {
    backgroundColor: 'rgba(139, 105, 20, 0.15)',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#6B5D47',
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#e0e0e0',
  },
  welcomeSubtitle: {
    fontSize: 13,
    color: 'rgba(224, 224, 224, 0.8)',
    marginTop: 4,
  },
  welcomeTime: {
    fontSize: 11,
    color: 'rgba(224, 224, 224, 0.6)',
    fontWeight: '500',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCardLarge: {
    width: '48%',
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#6B5D47',
  },
  statCardIcon: {
    marginBottom: 12,
  },
  statCardLabel: {
    fontSize: 12,
    color: '#a89968',
    fontWeight: '600',
    marginBottom: 6,
  },
  statCardValueLarge: {
    fontSize: 28,
    fontWeight: '800',
    color: '#8B6914',
  },
  progressSection: {
    marginTop: 24,
  },
  progressCard: {
    backgroundColor: 'rgba(45, 45, 45, 0.95)',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#6B5D47',
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e0e0e0',
  },
  progressPercent: {
    fontSize: 16,
    fontWeight: '700',
    color: '#8B6914',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#3a3a3a',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8B6914',
    borderRadius: 4,
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressStat: {
    flex: 1,
    alignItems: 'center',
  },
  progressStatLabel: {
    fontSize: 11,
    color: '#999999',
    fontWeight: '500',
  },
  progressStatValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e0e0e0',
    marginTop: 4,
  },
  progressDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#3a3a3a',
  },
  quickStatsContainer: {
    gap: 10,
  },
  quickStatItem: {
    backgroundColor: 'rgba(45, 45, 45, 0.95)',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#6B5D47',
  },
  quickStatIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(139, 105, 20, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickStatIcon: {
    // No longer needed - using MaterialCommunityIcons instead
  },
  quickStatTitle: {
    fontSize: 13,
    color: '#999999',
    fontWeight: '600',
  },
  quickStatValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#8B6914',
    marginTop: 2,
  },
  // Icon styling no longer needed for arrows - using MaterialCommunityIcons
  quickStatArrow: {
    // No longer needed - using chevron-right icon
  },
  // Logout Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutModalContent: {
    backgroundColor: '#2a2a2a',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
    width: '85%',
    maxWidth: 300,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  logoutModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  logoutModalMessage: {
    fontSize: 14,
    color: '#b0b0b0',
    marginBottom: 20,
    lineHeight: 20,
  },
  logoutModalButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  logoutCancelButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    alignItems: 'center',
  },
  logoutCancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#b0b0b0',
  },
  logoutConfirmButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FF5252',
    alignItems: 'center',
  },
  logoutConfirmButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#8a8a8a',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFD700',
  },
  reviewTextContainer: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(139, 105, 20, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#8B6914',
    borderRadius: 4,
  },
  reviewText: {
    fontSize: 13,
    color: '#e0e0e0',
    lineHeight: 18,
  },
  avgRatingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  avgRatingText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFD700',
  },
})

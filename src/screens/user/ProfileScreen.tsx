import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Alert, Text, TouchableOpacity, Modal } from 'react-native'
import { TextInput, Button } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabaseClient'

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || 'User',
    phone: user?.phone || '',
    address: user?.address || '',
  })
  const [stats, setStats] = useState({
    bookings: 0,
    rating: 0,
    reviews: 0,
  })

  // Load latest user data and stats from Supabase
  useEffect(() => {
    loadUserProfile()
    loadUserStats()
  }, [user?.id])

  const loadUserProfile = async () => {
    try {
      if (!user?.id) return
      const { data, error } = await supabase
        .from('users')
        .select('name, phone, address')
        .eq('id', user.id)
        .single()

      if (error) throw error
      if (data) {
        setFormData({
          name: data.name || 'User',
          phone: data.phone || '',
          address: data.address || '',
        })
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const loadUserStats = async () => {
    try {
      if (!user?.id) return

      // Get total bookings
      const { count: bookingCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      // Get reviews for user's bookings
      const { data: reviewsData } = await supabase
        .from('reviews')
        .select('rating')
        .in(
          'booking_id',
          (
            await supabase
              .from('bookings')
              .select('id')
              .eq('user_id', user.id)
          ).data?.map((b: any) => b.id) || []
        )

      const reviewCount = reviewsData?.length || 0
      const avgRating =
        reviewCount > 0
          ? (
              reviewsData?.reduce((sum: number, r: any) => sum + r.rating, 0) /
              reviewCount
            ).toFixed(1)
          : 0

      setStats({
        bookings: bookingCount || 0,
        rating: parseFloat(String(avgRating)) || 0,
        reviews: reviewCount,
      })
    } catch (error) {
      console.error('Error loading user stats:', error)
    }
  }

  const handleLogout = () => {
    console.log('🚪 Logout button clicked')
    setShowLogoutConfirm(true)
  }

  const confirmLogout = async () => {
    try {
      console.log('🔄 User logout...')
      setShowLogoutConfirm(false)
      await logout()
      console.log('✅ User logout successful')
    } catch (error) {
      console.error('❌ User logout error:', error)
      setShowLogoutConfirm(false)
    }
  }

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Name cannot be empty')
      return
    }

    try {
      setSaving(true)
      if (!user?.id) throw new Error('No user ID')

      const { error } = await supabase
        .from('users')
        .update({
          name: formData.name,
          phone: formData.phone,
          address: formData.address,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)

      if (error) throw error

      Alert.alert('Success', 'Profile updated successfully')
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving profile:', error)
      Alert.alert('Error', 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || 'User',
      phone: user?.phone || '',
      address: user?.address || '',
    })
    setIsEditing(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  return (
    <>
      <ScrollView 
        style={styles.container} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
      {/* Profile Header Card */}
      <View style={styles.profileCard}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarWrapper}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(formData.name)}</Text>
            </View>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.userName}>{formData.name}</Text>
            <Text style={styles.userEmail}>{user?.email}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusDot}>●</Text>
              <Text style={styles.statusText}>Active</Text>
            </View>
          </View>

          {!isEditing && (
            <TouchableOpacity
              style={styles.editIcon}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editIconText}>✏️</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.bookings}</Text>
            <Text style={styles.statLabel}>Bookings</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.rating > 0 ? stats.rating : '—'}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{stats.reviews}</Text>
            <Text style={styles.statLabel}>Reviews</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* Contact Information Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📱</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Phone Number</Text>
                {isEditing ? (
                  <TextInput
                    value={formData.phone}
                    onChangeText={(v) => setFormData({ ...formData, phone: v })}
                    keyboardType="phone-pad"
                    placeholder="Enter phone number"
                    style={styles.editInput}
                    mode="outlined"
                    outlineColor="#3a3a3a"
                    activeOutlineColor="#8B6914"
                    textColor="#ffffff"
                    placeholderTextColor="#6a6a6a"
                    theme={{
                      colors: {
                        primary: '#8B6914',
                        background: '#1f1f1f',
                        surface: '#2a2a2a',
                      },
                    }}
                  />
                ) : (
                  <Text style={styles.infoValue}>{formData.phone || '—'}</Text>
                )}
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <Text style={styles.infoIcon}>📍</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Address</Text>
                {isEditing ? (
                  <TextInput
                    value={formData.address}
                    onChangeText={(v) => setFormData({ ...formData, address: v })}
                    placeholder="Enter your address"
                    multiline
                    numberOfLines={2}
                    style={[styles.editInput, styles.addressEditInput]}
                    mode="outlined"
                    outlineColor="#3a3a3a"
                    activeOutlineColor="#8B6914"
                    textColor="#ffffff"
                    placeholderTextColor="#6a6a6a"
                    theme={{
                      colors: {
                        primary: '#8B6914',
                        background: '#1f1f1f',
                        surface: '#2a2a2a',
                      },
                    }}
                  />
                ) : (
                  <Text style={styles.infoValue}>{formData.address || '—'}</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Full Name Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <MaterialCommunityIcons name="account-circle-outline" size={24} color="#8B6914" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Full Name</Text>
                {isEditing ? (
                  <TextInput
                    value={formData.name}
                    onChangeText={(v) => setFormData({ ...formData, name: v })}
                    style={styles.editInput}
                    mode="outlined"
                    outlineColor="#3a3a3a"
                    activeOutlineColor="#8B6914"
                    textColor="#ffffff"
                    theme={{
                      colors: {
                        primary: '#8B6914',
                        background: '#1f1f1f',
                        surface: '#2a2a2a',
                      },
                    }}
                  />
                ) : (
                  <Text style={styles.infoValue}>{formData.name}</Text>
                )}
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {isEditing && (
          <View style={styles.section}>
            <View style={styles.buttonGroup}>
              <Button
                mode="contained"
                onPress={handleSave}
                disabled={saving}
                style={styles.saveButton}
                buttonColor="#8B6914"
                textColor="#ffffff"
                labelStyle={styles.buttonLabel}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                mode="outlined"
                onPress={handleCancel}
                disabled={saving}
                style={styles.cancelButton}
                textColor="#b0b0b0"
                labelStyle={styles.buttonLabel}
              >
                Cancel
              </Button>
            </View>
          </View>
        )}

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account</Text>

          <View style={styles.menuCard}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>🔒</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Change Password</Text>
                <Text style={styles.menuDesc}>Update your password</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIconContainer}>
                <Text style={styles.menuIcon}>🔔</Text>
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuLabel}>Notifications</Text>
                <Text style={styles.menuDesc}>Manage alerts & notifications</Text>
              </View>
              <Text style={styles.menuArrow}>›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <Button
            mode="contained"
            onPress={handleLogout}
            style={styles.logoutButton}
            buttonColor="#FF5252"
            textColor="#ffffff"
            labelStyle={styles.buttonLabel}
          >
            Logout
          </Button>
        </View>

        <View style={styles.flexSpacer} />
      </View>
      </ScrollView>

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
    </>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f1f1f',
  },
  scrollContent: {
    flexGrow: 1,
  },
  // Profile Card Styles
  profileCard: {
    backgroundColor: '#2a2a2a',
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    gap: 16,
    position: 'relative',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: '#8B6914',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(139, 105, 20, 0.5)',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
  },
  profileInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: '#b0b0b0',
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
  },
  statusDot: {
    fontSize: 12,
    color: '#4CAF50',
  },
  statusText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '600',
  },
  editIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#8B6914',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIconText: {
    fontSize: 18,
  },
  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#3a3a3a',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#8B6914',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    color: '#8a8a8a',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#3a3a3a',
  },
  // Content Styles
  content: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 12,
    letterSpacing: 0.3,
  },
  // Info Card
  infoCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    overflow: 'hidden',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  infoIcon: {
    fontSize: 24,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    color: '#8a8a8a',
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  infoValue: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#3a3a3a',
    marginHorizontal: 16,
  },
  editInput: {
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    marginTop: 4,
  },
  addressEditInput: {
    minHeight: 70,
  },
  // Menu Card
  menuCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#1f1f1f',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuIcon: {
    fontSize: 20,
  },
  menuContent: {
    flex: 1,
    gap: 2,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  menuDesc: {
    fontSize: 11,
    color: '#8a8a8a',
  },
  menuArrow: {
    fontSize: 16,
    color: '#8B6914',
    fontWeight: '600',
  },
  menuDivider: {
    height: 1,
    backgroundColor: '#3a3a3a',
    marginHorizontal: 16,
  },
  // Button Styles
  buttonGroup: {
    gap: 10,
  },
  saveButton: {
    borderRadius: 10,
    paddingVertical: 6,
  },
  cancelButton: {
    borderRadius: 10,
    paddingVertical: 6,
    borderColor: '#3a3a3a',
  },
  logoutButton: {
    borderRadius: 10,
    paddingVertical: 6,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  spacer: {
    height: 24,
  },
  flexSpacer: {
    flex: 1,
    minHeight: 24,
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
})

import React, { useState, useEffect } from 'react'
import { View, StyleSheet, ScrollView, Alert, Text, TouchableOpacity } from 'react-native'
import { TextInput, Button, Menu } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabaseClient'

interface Service {
  id: string
  title: string
  price: number
}

export const BookingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    service: '',
    serviceId: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    vehicleType: '',
    vehicleBrand: '',
    vehiclePlate: '',
    notes: '',
  })

  const [services, setServices] = useState<Service[]>([])
  const [serviceMenuVisible, setServiceMenuVisible] = useState(false)
  const [vehicleMenuVisible, setVehicleMenuVisible] = useState(false)
  const [timeMenuVisible, setTimeMenuVisible] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const timeSlots = ['09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00']

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select('id, title, price')
      
      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  const handleSubmit = async () => {
    if (!formData.serviceId || !formData.vehicleType || !formData.vehicleBrand || !formData.vehiclePlate) {
      Alert.alert('Error', 'Please fill all required fields')
      return
    }

    if (!user?.id) {
      Alert.alert('Error', 'User not authenticated')
      return
    }

    try {
      setIsSubmitting(true)
      
      const selectedService = services.find(s => s.id === formData.serviceId)
      const totalPrice = selectedService?.price || 0

      const { error } = await supabase
        .from('bookings')
        .insert({
          user_id: user.id,
          service_id: formData.serviceId,
          vehicle_type: formData.vehicleType,
          vehicle_brand: formData.vehicleBrand,
          vehicle_plate: formData.vehiclePlate,
          booking_date: formData.date,
          booking_time: formData.time,
          notes: formData.notes,
          status: 'Pending',
          total_price: totalPrice,
        })

      if (error) throw error

      Alert.alert('Success', 'Booking created successfully!')
      setFormData({
        service: '',
        serviceId: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        vehicleType: '',
        vehicleBrand: '',
        vehiclePlate: '',
        notes: '',
      })
      navigation.navigate('BookingHistory')
    } catch (error: any) {
      console.error('Error creating booking:', error)
      Alert.alert('Error', error.message || 'Failed to create booking')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header Card */}
      <View style={styles.headerCard}>
        <Text style={styles.headerTitle}>Book Your Service</Text>
        <Text style={styles.headerSubtitle}>Schedule a maintenance for your vehicle</Text>
      </View>

      {/* Service Selection Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Select Service</Text>
        </View>

        <View style={styles.card}>
          <Menu
            visible={serviceMenuVisible}
            onDismiss={() => setServiceMenuVisible(false)}
            anchor={
              <TouchableOpacity
                onPress={() => setServiceMenuVisible(true)}
                style={styles.menuButton}
              >
                <MaterialCommunityIcons name="wrench" size={20} color="#8B6914" />
                <View style={styles.menuButtonContent}>
                  <Text style={styles.menuButtonLabel}>Service Type</Text>
                  <Text style={[styles.menuButtonValue, { color: formData.service ? '#8B6914' : '#b0b0b0' }]}>
                    {formData.service || 'Choose a service'}
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#8B6914" />
              </TouchableOpacity>
            }
          >
            {services.map((s) => (
              <Menu.Item
                key={s.id}
                onPress={() => {
                  setFormData({ ...formData, service: s.title, serviceId: s.id })
                  setServiceMenuVisible(false)
                }}
                title={s.title}
              />
            ))}
          </Menu>
        </View>
      </View>

      {/* Vehicle Information Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vehicle Details</Text>
        </View>

        <View style={styles.card}>
          {/* Vehicle Type */}
          <Menu
            visible={vehicleMenuVisible}
            onDismiss={() => setVehicleMenuVisible(false)}
            anchor={
              <TouchableOpacity
                onPress={() => setVehicleMenuVisible(true)}
                style={styles.menuButton}
              >
                <MaterialCommunityIcons name="car" size={20} color="#8B6914" />
                <View style={styles.menuButtonContent}>
                  <Text style={styles.menuButtonLabel}>Vehicle Type</Text>
                  <Text style={[styles.menuButtonValue, { color: formData.vehicleType ? '#8B6914' : '#b0b0b0' }]}>
                    {formData.vehicleType || 'Choose vehicle'}
                  </Text>
                </View>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#8B6914" />
              </TouchableOpacity>
            }
          >
            {['Car', 'Truck', 'Motorcycle'].map((v) => (
              <Menu.Item
                key={v}
                onPress={() => {
                  setFormData({ ...formData, vehicleType: v })
                  setVehicleMenuVisible(false)
                }}
                title={v}
              />
            ))}
          </Menu>

          <View style={styles.divider} />

          {/* Brand and Plate Row */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Vehicle Brand</Text>
            <TextInput
              placeholder="e.g., Toyota"
              value={formData.vehicleBrand}
              onChangeText={(text) => setFormData({ ...formData, vehicleBrand: text })}
              style={styles.input}
              placeholderTextColor="#6a6a6a"
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>License Plate</Text>
            <TextInput
              placeholder="e.g., ABC-123"
              value={formData.vehiclePlate}
              onChangeText={(text) => setFormData({ ...formData, vehiclePlate: text })}
              style={styles.input}
              placeholderTextColor="#6a6a6a"
            />
          </View>
        </View>
      </View>

      {/* Schedule Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Schedule</Text>
        </View>

        <View style={styles.card}>
          {/* Date (Read Only) */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Date</Text>
            <TouchableOpacity style={styles.readOnlyButton}>
              <MaterialCommunityIcons name="calendar" size={18} color="#8B6914" />
              <Text style={styles.readOnlyText}>{formData.date}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Time */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Time</Text>
            <Menu
              visible={timeMenuVisible}
              onDismiss={() => setTimeMenuVisible(false)}
              anchor={
                <TouchableOpacity
                  onPress={() => setTimeMenuVisible(true)}
                  style={styles.selectButton}
                >
                  <MaterialCommunityIcons name="clock-outline" size={18} color="#8B6914" />
                  <Text style={[styles.selectText, { color: formData.time ? '#ffffff' : '#b0b0b0' }]}>
                    {formData.time || 'Select time'}
                  </Text>
                </TouchableOpacity>
              }
            >
              {timeSlots.map((t) => (
                <Menu.Item
                  key={t}
                  onPress={() => {
                    setFormData({ ...formData, time: t })
                    setTimeMenuVisible(false)
                  }}
                  title={t}
                />
              ))}
            </Menu>
          </View>
        </View>
      </View>

      {/* Additional Notes Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Additional Notes</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.fieldGroup}>
            <TextInput
              placeholder="Add any special requests or notes..."
              value={formData.notes}
              onChangeText={(text) => setFormData({ ...formData, notes: text })}
              multiline
              numberOfLines={4}
              style={[styles.input, styles.notesInput]}
              placeholderTextColor="#6a6a6a"
            />
          </View>
        </View>
      </View>

      {/* Submit Button */}
      <View style={styles.section}>
        <Button
          mode="contained"
          onPress={handleSubmit}
          disabled={isSubmitting}
          style={styles.submitButton}
          buttonColor="#8B6914"
          textColor="#ffffff"
          labelStyle={styles.submitButtonLabel}
        >
          {isSubmitting ? 'Booking...' : 'Confirm Booking'}
        </Button>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
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
  // Header Card
  headerCard: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#b0b0b0',
  },
  // Section Styles
  section: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.3,
  },
  // Card Styles
  card: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3a3a3a',
    overflow: 'hidden',
  },
  fieldGroup: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8a8a8a',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  // Menu Button Styles
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuButtonIcon: {
    fontSize: 20,
  },
  menuButtonContent: {
    flex: 1,
    gap: 2,
  },
  menuButtonLabel: {
    fontSize: 12,
    color: '#8a8a8a',
    fontWeight: '600',
  },
  menuButtonValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  menuButtonArrow: {
    fontSize: 16,
    color: '#8B6914',
    fontWeight: '600',
  },
  // Input Styles
  input: {
    backgroundColor: '#1f1f1f',
    borderRadius: 8,
    fontSize: 14,
    color: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  notesInput: {
    textAlignVertical: 'top',
    minHeight: 100,
    color: '#e0e0e0',
  },
  // Select Button
  selectButton: {
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#1f1f1f',
    gap: 10,
  },
  selectIcon: {
    fontSize: 18,
  },
  selectText: {
    fontSize: 14,
    fontWeight: '500',
  },
  // Read Only Button
  readOnlyButton: {
    borderWidth: 1,
    borderColor: '#3a3a3a',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#1f1f1f',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  readOnlyIcon: {
    fontSize: 18,
  },
  readOnlyText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  // Divider
  divider: {
    height: 1,
    backgroundColor: '#3a3a3a',
    marginHorizontal: 16,
  },
  // Submit Button
  submitButton: {
    borderRadius: 10,
    paddingVertical: 8,
    marginBottom: 12,
  },
  submitButtonLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  spacer: {
    height: 24,
  },
})

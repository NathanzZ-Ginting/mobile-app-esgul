import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, Alert, Text, TouchableOpacity } from 'react-native'
import { TextInput, Button, Menu } from 'react-native-paper'

export const BookingScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: 'Yoel',
    service: '',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    vehicleType: '',
    vehicleBrand: '',
    vehiclePlate: '',
    notes: '',
  })

  const [serviceMenuVisible, setServiceMenuVisible] = useState(false)
  const [vehicleMenuVisible, setVehicleMenuVisible] = useState(false)
  const services = ['Oil Change', 'Tire Installation', 'Battery Replacement', 'Full Service']

  const handleSubmit = async () => {
    if (!formData.service || !formData.vehicleType || !formData.vehicleBrand || !formData.vehiclePlate) {
      Alert.alert('Error', 'Please fill all required fields')
      return
    }

    try {
      Alert.alert('Success', 'Booking created successfully!')
      setFormData({
        name: 'Yoel',
        service: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        vehicleType: '',
        vehicleBrand: '',
        vehiclePlate: '',
        notes: '',
      })
      navigation.navigate('BookingHistory')
    } catch (error: any) {
      Alert.alert('Error', error.message)
    }
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Book Service</Text>
        <Text style={styles.headerSubtitle}>Fill in your service details</Text>
      </View>

      <View style={styles.content}>
        {/* Form Card */}
        <View style={styles.formCard}>
          {/* Name Field */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>📝 Nama</Text>
            <TextInput
              value={formData.name}
              onChangeText={(v) => setFormData({ ...formData, name: v })}
              style={styles.input}
              mode="outlined"
              outlineColor="#e8e8e8"
              activeOutlineColor="#2c5aa0"
              textColor="#1a1a1a"
              theme={{
                colors: {
                  primary: '#2c5aa0',
                  background: '#ffffff',
                  surface: '#ffffff',
                },
              }}
            />
          </View>

          {/* Service Selection */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>🔧 Layanan</Text>
            <Menu
              visible={serviceMenuVisible}
              onDismiss={() => setServiceMenuVisible(false)}
              anchor={
                <TouchableOpacity
                  onPress={() => setServiceMenuVisible(true)}
                  style={styles.selectButton}
                >
                  <Text style={[styles.selectText, { color: formData.service ? '#1a1a1a' : '#a0a0a0' }]}>
                    {formData.service || 'Select Service'}
                  </Text>
                  <Text style={styles.selectArrow}>▼</Text>
                </TouchableOpacity>
              }
            >
              {services.map((s) => (
                <Menu.Item
                  key={s}
                  onPress={() => {
                    setFormData({ ...formData, service: s })
                    setServiceMenuVisible(false)
                  }}
                  title={s}
                />
              ))}
            </Menu>
          </View>

          {/* Date and Time Row */}
          <View style={styles.rowContainer}>
            <View style={[styles.fieldSection, { flex: 1 }]}>
              <Text style={styles.fieldLabel}>📅 Tanggal</Text>
              <View style={styles.readOnlyInput}>
                <Text style={styles.readOnlyText}>{formData.date}</Text>
              </View>
            </View>
            <View style={[styles.fieldSection, { flex: 1, marginLeft: 12 }]}>
              <Text style={styles.fieldLabel}>⏰ Waktu</Text>
              <View style={styles.readOnlyInput}>
                <Text style={styles.readOnlyText}>{formData.time}</Text>
              </View>
            </View>
          </View>

          {/* Vehicle Type */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>🚗 Jenis Kendaraan</Text>
            <Menu
              visible={vehicleMenuVisible}
              onDismiss={() => setVehicleMenuVisible(false)}
              anchor={
                <TouchableOpacity
                  onPress={() => setVehicleMenuVisible(true)}
                  style={styles.selectButton}
                >
                  <Text style={[styles.selectText, { color: formData.vehicleType ? '#1a1a1a' : '#a0a0a0' }]}>
                    {formData.vehicleType || 'Select Vehicle Type'}
                  </Text>
                  <Text style={styles.selectArrow}>▼</Text>
                </TouchableOpacity>
              }
            >
              <Menu.Item
                onPress={() => {
                  setFormData({ ...formData, vehicleType: 'Mobil' })
                  setVehicleMenuVisible(false)
                }}
                title="🚗 Mobil"
              />
              <Menu.Item
                onPress={() => {
                  setFormData({ ...formData, vehicleType: 'Motor' })
                  setVehicleMenuVisible(false)
                }}
                title="🏍️ Motor"
              />
            </Menu>
          </View>

          {/* Vehicle Brand */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>🏷️ Merk Kendaraan</Text>
            <TextInput
              value={formData.vehicleBrand}
              onChangeText={(v) => setFormData({ ...formData, vehicleBrand: v })}
              placeholder="e.g., Toyota, Honda"
              style={styles.input}
              mode="outlined"
              outlineColor="#e8e8e8"
              activeOutlineColor="#2c5aa0"
              textColor="#1a1a1a"
              placeholderTextColor="#a0a0a0"
              theme={{
                colors: {
                  primary: '#2c5aa0',
                  background: '#ffffff',
                  surface: '#ffffff',
                },
              }}
            />
          </View>

          {/* Vehicle Plate */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>🔢 Plat Nomor</Text>
            <TextInput
              value={formData.vehiclePlate}
              onChangeText={(v) => setFormData({ ...formData, vehiclePlate: v })}
              placeholder="e.g., B 1234 ABC"
              style={styles.input}
              mode="outlined"
              outlineColor="#e8e8e8"
              activeOutlineColor="#2c5aa0"
              textColor="#1a1a1a"
              placeholderTextColor="#a0a0a0"
              theme={{
                colors: {
                  primary: '#2c5aa0',
                  background: '#ffffff',
                  surface: '#ffffff',
                },
              }}
            />
          </View>

          {/* Additional Notes */}
          <View style={styles.fieldSection}>
            <Text style={styles.fieldLabel}>📝 Catatan Tambahan</Text>
            <TextInput
              value={formData.notes}
              onChangeText={(v) => setFormData({ ...formData, notes: v })}
              placeholder="Describe your service needs..."
              style={[styles.input, styles.notesInput]}
              mode="outlined"
              outlineColor="#e8e8e8"
              activeOutlineColor="#2c5aa0"
              textColor="#1a1a1a"
              placeholderTextColor="#a0a0a0"
              multiline
              numberOfLines={4}
              theme={{
                colors: {
                  primary: '#2c5aa0',
                  background: '#ffffff',
                  surface: '#ffffff',
                },
              }}
            />
          </View>

          {/* Submit Button */}
          <Button
            mode="contained"
            onPress={handleSubmit}
            style={styles.submitButton}
            buttonColor="#2c5aa0"
            textColor="#ffffff"
            labelStyle={styles.buttonLabel}
          >
            Confirm Booking
          </Button>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    backgroundColor: '#2c5aa0',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  formCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: 16,
  },
  fieldSection: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1a1a1a',
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    fontSize: 14,
  },
  notesInput: {
    textAlignVertical: 'top',
    minHeight: 100,
  },
  rowContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  selectButton: {
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  selectText: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  selectArrow: {
    fontSize: 12,
    color: '#2c5aa0',
    fontWeight: '600',
  },
  readOnlyInput: {
    borderWidth: 1,
    borderColor: '#e8e8e8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 14,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
  },
  readOnlyText: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  submitButton: {
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 10,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
})

import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, Alert, Text, TouchableOpacity } from 'react-native'
import { TextInput, Button } from 'react-native-paper'
import { useAuth } from '../../context/AuthContext'

export const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || 'User',
    phone: user?.phone || '',
    address: user?.address || '',
  })

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', onPress: () => {}, style: 'cancel' },
      {
        text: 'Logout',
        onPress: async () => {
          await logout()
        },
        style: 'destructive',
      },
    ])
  }

  const handleSave = async () => {
    Alert.alert('Success', 'Profile updated successfully')
    setIsEditing(false)
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || 'User',
      phone: user?.phone || '',
      address: user?.address || '',
    })
    setIsEditing(false)
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Premium Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarEmoji}>👤</Text>
          </View>
          <View style={styles.headerInfo}>
            <Text style={styles.profileName}>{formData.name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        {/* Profile Information Card */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>📋 Profile Information</Text>
          </View>

          <View style={styles.card}>
            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Full Name</Text>
              <TextInput
                value={formData.name}
                onChangeText={(v) => setFormData({ ...formData, name: v })}
                editable={isEditing}
                style={styles.input}
                mode="outlined"
                outlineColor={isEditing ? '#e8e8e8' : '#f0f0f0'}
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

            {/* Phone Number */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Phone Number</Text>
              <TextInput
                value={formData.phone}
                onChangeText={(v) => setFormData({ ...formData, phone: v })}
                keyboardType="phone-pad"
                editable={isEditing}
                placeholder={isEditing ? 'Enter phone number' : '—'}
                style={styles.input}
                mode="outlined"
                outlineColor={isEditing ? '#e8e8e8' : '#f0f0f0'}
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

            {/* Address */}
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Address</Text>
              <TextInput
                value={formData.address}
                onChangeText={(v) => setFormData({ ...formData, address: v })}
                placeholder={isEditing ? 'Enter your address' : '—'}
                multiline
                numberOfLines={3}
                editable={isEditing}
                style={[styles.input, styles.addressInput]}
                mode="outlined"
                outlineColor={isEditing ? '#e8e8e8' : '#f0f0f0'}
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
          </View>
        </View>

        {/* Account Actions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>⚙️ Actions</Text>
          </View>

          <View style={styles.card}>
            {isEditing ? (
              <View style={styles.buttonGroup}>
                <Button
                  mode="contained"
                  onPress={handleSave}
                  style={styles.primaryButton}
                  buttonColor="#2c5aa0"
                  textColor="#ffffff"
                  labelStyle={styles.buttonLabel}
                >
                  Save Changes
                </Button>
                <Button
                  mode="outlined"
                  onPress={handleCancel}
                  style={styles.secondaryButton}
                  textColor="#2c5aa0"
                  labelStyle={styles.buttonLabel}
                >
                  Cancel
                </Button>
              </View>
            ) : (
              <Button
                mode="contained"
                onPress={() => setIsEditing(true)}
                style={styles.fullButton}
                buttonColor="#2c5aa0"
                textColor="#ffffff"
                labelStyle={styles.buttonLabel}
              >
                Edit Profile
              </Button>
            )}
          </View>
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Button
              mode="outlined"
              onPress={handleLogout}
              style={styles.fullButton}
              textColor="#ff6b6b"
              labelStyle={[styles.buttonLabel, { color: '#ff6b6b' }]}
            >
              Logout
            </Button>
          </View>
        </View>

        <View style={styles.spacer} />
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
    paddingBottom: 28,
  },
  avatarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarEmoji: {
    fontSize: 32,
    lineHeight: 32,
  },
  headerInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  email: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: 0.2,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
    gap: 12,
  },
  fieldGroup: {
    gap: 6,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: '#ffffff',
    borderRadius: 10,
    fontSize: 14,
  },
  addressInput: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  buttonGroup: {
    gap: 10,
  },
  primaryButton: {
    borderRadius: 10,
    paddingVertical: 4,
  },
  secondaryButton: {
    borderRadius: 10,
    paddingVertical: 4,
    borderColor: '#2c5aa0',
  },
  fullButton: {
    borderRadius: 10,
    paddingVertical: 4,
  },
  buttonLabel: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  spacer: {
    height: 24,
  },
})

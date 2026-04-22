import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, Alert, Text, TouchableOpacity, Dimensions } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { AuthForm } from '../../components/AuthForm'
import { useAuth } from '../../context/AuthContext'

const { height: screenHeight } = Dimensions.get('window')

export const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { register, isLoading } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleRegister = async (credentials: Record<string, string>) => {
    if (credentials.password !== credentials.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match')
      return
    }

    setLoading(true)
    try {
      await register(credentials.email, credentials.password, credentials.name)
      Alert.alert('Success', 'Account created. Please log in.')
      navigation.navigate('Login')
    } catch (error: any) {
      Alert.alert('Registration Error', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <LinearGradient
      colors={['#1f1f1f', '#2a2a2a', '#1f1f1f']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.gradient}
    >
      {/* Background Pattern - Garage/Mechanic Theme */}
      <View style={styles.patternOverlay}>
        {/* Horizontal lines pattern like garage door */}
        <View style={styles.linePattern}>
          <View style={styles.horizontalLine} />
          <View style={styles.horizontalLine} />
          <View style={styles.horizontalLine} />
          <View style={styles.horizontalLine} />
          <View style={styles.horizontalLine} />
          <View style={styles.horizontalLine} />
          <View style={styles.horizontalLine} />
          <View style={styles.horizontalLine} />
          <View style={styles.horizontalLine} />
          <View style={styles.horizontalLine} />
        </View>
        {/* Diagonal accent stripes */}
        <View style={[styles.diagonalStripe, styles.stripe1]} />
        <View style={[styles.diagonalStripe, styles.stripe2]} />
      </View>

      <ScrollView
        style={styles.container}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Top Accent Line - Warm brown for workshop theme */}
        <View style={styles.topAccent} />

        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.description}>
              Join us to start managing your service bookings
            </Text>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            <AuthForm
              title=""
              fields={[
                {
                  name: 'name',
                  label: 'Full Name',
                  placeholder: 'John Doe',
                },
                {
                  name: 'email',
                  label: 'Email',
                  placeholder: 'user@example.com',
                },
                {
                  name: 'password',
                  label: 'Password',
                  placeholder: '••••••••',
                  secureTextEntry: true,
                },
                {
                  name: 'confirmPassword',
                  label: 'Confirm Password',
                  placeholder: '••••••••',
                  secureTextEntry: true,
                },
              ]}
              onSubmit={handleRegister}
              isLoading={loading || isLoading}
              buttonText="Register"
            />
          </View>

          {/* Login Link */}
          <View style={styles.links}>
            <Text style={styles.text}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    position: 'relative',
  },
  patternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
    zIndex: 1,
  },
  linePattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-evenly',
    paddingVertical: 20,
  },
  horizontalLine: {
    height: 2,
    backgroundColor: '#8B6914',
    opacity: 0.04,
  },
  diagonalStripe: {
    position: 'absolute',
    backgroundColor: '#8B6914',
    opacity: 0.03,
  },
  stripe1: {
    width: 400,
    height: 400,
    transform: [{ rotate: '45deg' }],
    top: -100,
    right: -150,
  },
  stripe2: {
    width: 400,
    height: 400,
    transform: [{ rotate: '45deg' }],
    bottom: -100,
    left: -150,
  },
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  topAccent: {
    height: 6,
    backgroundColor: '#8B6914',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 28,
    gap: 20,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 6,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 10,
    textAlign: 'center',
    color: '#ffffff',
  },
  description: {
    fontSize: 13,
    color: 'rgba(224, 224, 224, 0.8)',
    textAlign: 'center',
    lineHeight: 19,
  },
  formContainer: {
    backgroundColor: 'rgba(45, 45, 45, 0.95)',
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderWidth: 2,
    borderColor: '#6B5D47',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  links: {
    marginTop: 8,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 13,
    color: 'rgba(224, 224, 224, 0.7)',
  },
  link: {
    fontSize: 13,
    color: '#a89968',
    fontWeight: '600',
  },
})

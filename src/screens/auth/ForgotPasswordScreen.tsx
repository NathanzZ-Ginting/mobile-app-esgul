import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, Alert, Text, TouchableOpacity } from 'react-native'
import { TextInput, Button } from 'react-native-paper'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuth } from '../../context/AuthContext'

export const ForgotPasswordScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { forgotPassword, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const validateEmail = (emailValue: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(emailValue)
  }

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address')
      return
    }

    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address')
      return
    }

    setLoading(true)
    try {
      await forgotPassword(email)
      Alert.alert(
        'Check Your Email',
        'We\'ve sent a password reset link to ' + email + '\n\nPlease check your email and follow the instructions to reset your password.',
        [
          {
            text: 'Back to Login',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      )
    } catch (error: any) {
      if (error.message.includes('not found')) {
        Alert.alert('User Not Found', 'No account exists with this email address')
      } else {
        Alert.alert('Error', error.message || 'Failed to send reset email')
      }
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
        {/* Top Accent Line - Orange for workshop theme */}
        <View style={styles.topAccent} />

        <View style={styles.content}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.description}>
              Enter your email address and we'll send you a link to reset your password
            </Text>
          </View>

          {/* Form Container */}
          <View style={styles.formContainer}>
            <TextInput
              label="Email"
              placeholder="user@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading && !isLoading}
              mode="outlined"
              style={styles.input}
              outlineColor="#666666"
              activeOutlineColor="#8B6914"
              textColor="#e0e0e0"
              placeholderTextColor="#999999"
              theme={{
                colors: {
                  primary: '#8B6914',
                  background: 'rgba(45, 45, 45, 0.95)',
                  surface: 'rgba(45, 45, 45, 0.95)',
                },
              }}
            />

            <Button
              mode="contained"
              onPress={handleForgotPassword}
              loading={loading || isLoading}
              disabled={loading || isLoading}
              style={styles.button}
              buttonColor="#6B5D47"
              textColor="#ffffff"
              labelStyle={styles.buttonLabel}
            >
              Send Reset Email
            </Button>
          </View>

          {/* Back to Login Link */}
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>← Back to Login</Text>
          </TouchableOpacity>
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
    paddingVertical: 32,
    gap: 22,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 8,
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
    paddingVertical: 22,
    paddingHorizontal: 18,
    borderWidth: 2,
    borderColor: '#6B5D47',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    gap: 14,
  },
  input: {
    backgroundColor: 'rgba(55, 55, 55, 0.95)',
    borderRadius: 10,
    fontSize: 14,
  },
  label: {
    fontSize: 12,
  },
  button: {
    marginTop: 6,
    paddingVertical: 6,
    borderRadius: 10,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  link: {
    fontSize: 13,
    color: '#a89968',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 6,
  },
})

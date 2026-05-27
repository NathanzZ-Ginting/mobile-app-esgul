import React, { useState } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
  Dimensions,
} from 'react-native'
import { Text } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { AuthForm } from '../../components/AuthForm'
import { useAuth } from '../../context/AuthContext'

const { height: screenHeight } = Dimensions.get('window')

export const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { login, isLoading } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleLogin = async (credentials: Record<string, string>) => {
    setLoading(true)
    try {
      await login(credentials.email, credentials.password)
    } catch (error: any) {
      Alert.alert('Login Error', error.message)
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
        scrollEnabled={false}
      >
        {/* Top Accent Line - Orange for workshop theme */}
        <View style={styles.topAccent} />

        <View style={styles.content}>
        {/* Logo Section - Compact */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <MaterialCommunityIcons name="cog" size={40} color="#8B6914" />
          </View>
          <Text style={styles.brandName}>ESGUL online booking service</Text>
          <Text style={styles.brandSub}>Service Pro</Text>
        </View>

        {/* Form Section */}
        <View style={styles.formContainer}>
          <Text style={styles.welcomeText}>Welcome</Text>

          <View style={styles.formWrapper}>
            <AuthForm
              title=""
              fields={[
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
              ]}
              onSubmit={handleLogin}
              isLoading={loading || isLoading}
              buttonText="Sign In"
            />
          </View>
        </View>

        {/* Links Section */}
        <View style={styles.linksContainer}>
          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.signupRow}>
            <Text style={styles.noAccountText}>No account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signupText}>Create account</Text>
            </TouchableOpacity>
          </View>
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
  topAccent: {
    height: 6,
    backgroundColor: '#8B6914',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    justifyContent: 'center',
    minHeight: screenHeight - 6,
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 65,
    height: 65,
    borderRadius: 14,
    backgroundColor: '#6B5D47',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 3,
    borderColor: '#8B6914',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 12,
  },
  logoIcon: {
    fontSize: 28,
    lineHeight: 28,
    color: '#ffffff',
    fontWeight: '800',
  },
  brandName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.8,
  },
  brandSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a89968',
    marginTop: 3,
    letterSpacing: 0.5,
  },
  formContainer: {
    marginBottom: 20,
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
  },
  welcomeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#e0e0e0',
    marginBottom: 12,
  },
  formWrapper: {
    marginTop: 6,
  },
  linksContainer: {
    alignItems: 'center',
    gap: 10,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#a89968',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(139, 105, 20, 0.2)',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noAccountText: {
    fontSize: 12,
    color: 'rgba(224, 224, 224, 0.7)',
    fontWeight: '400',
  },
  signupText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#a89968',
  },
})

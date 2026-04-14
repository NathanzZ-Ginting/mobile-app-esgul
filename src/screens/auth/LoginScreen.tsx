import React, { useState } from 'react'
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  TouchableOpacity,
} from 'react-native'
import { Text } from 'react-native'
import { AuthForm } from '../../components/AuthForm'
import { useAuth } from '../../context/AuthContext'

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
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      scrollEnabled={false}
    >
      {/* Top Accent Line */}
      <View style={styles.topAccent} />

      <View style={styles.content}>
        {/* Logo Section - Compact */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>⚙️</Text>
          </View>
          <Text style={styles.brandName}>ESGUL</Text>
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
              <Text style={styles.signupText}>Create one</Text>
            </TouchableOpacity>
          </View>
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
  topAccent: {
    height: 4,
    backgroundColor: '#2c5aa0',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    justifyContent: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoContainer: {
    width: 60,
    height: 60,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#e8e8e8',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  logoIcon: {
    fontSize: 28,
    lineHeight: 28,
  },
  brandName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    letterSpacing: 0.5,
  },
  brandSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c5aa0',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  formContainer: {
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 20,
    paddingHorizontal: 18,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 14,
  },
  formWrapper: {
    marginTop: 8,
  },
  linksContainer: {
    alignItems: 'center',
    gap: 10,
  },
  forgotText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c5aa0',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#e8e8e8',
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noAccountText: {
    fontSize: 12,
    color: '#8a8a8a',
    fontWeight: '400',
  },
  signupText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2c5aa0',
  },
})

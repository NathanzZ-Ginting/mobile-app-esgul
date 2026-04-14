import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, Alert, Text } from 'react-native'
import { AuthForm } from '../../components/AuthForm'
import { useAuth } from '../../context/AuthContext'

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
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <AuthForm
          title="Create Account"
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

        <View style={styles.links}>
          <Text style={styles.text}>Already have an account? </Text>
          <Text
            style={styles.link}
            onPress={() => navigation.navigate('Login')}
          >
            Login
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingVertical: 40,
  },
  links: {
    marginTop: 24,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 14,
    color: '#666',
  },
  link: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '600',
  },
})

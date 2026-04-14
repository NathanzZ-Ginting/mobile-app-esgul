import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, Alert, Text } from 'react-native'
import { TextInput, Button } from 'react-native-paper'
import { useAuth } from '../../context/AuthContext'

export const ForgotPasswordScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { forgotPassword, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email')
      return
    }

    setLoading(true)
    try {
      await forgotPassword(email)
      Alert.alert('Success', 'Password reset email has been sent')
      navigation.navigate('Login')
    } catch (error: any) {
      Alert.alert('Error', error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.description}>
          Enter your email address and we'll send you a link to reset your password
        </Text>

        <TextInput
          label="Email"
          placeholder="user@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          editable={!loading && !isLoading}
          style={styles.input}
        />

        <Button
          mode="contained"
          onPress={handleForgotPassword}
          loading={loading || isLoading}
          disabled={loading || isLoading}
          style={styles.button}
        >
          Send Reset Email
        </Button>

        <Text
          style={styles.link}
          onPress={() => navigation.navigate('Login')}
        >
          Back to Login
        </Text>
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
    padding: 16,
    paddingVertical: 40,
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginVertical: 8,
  },
  button: {
    marginVertical: 16,
    paddingVertical: 6,
  },
  link: {
    fontSize: 14,
    color: '#1976d2',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 16,
  },
})

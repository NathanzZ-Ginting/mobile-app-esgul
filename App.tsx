import React, { useEffect } from 'react'
import { PaperProvider } from 'react-native-paper'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AuthProvider } from './src/context/AuthContext'
import { NotificationProvider } from './src/context/NotificationContext'
import { RootNavigator } from './src/navigation/RootNavigator'
import { NotificationOverlay } from './src/components/NotificationOverlay'

export default function App() {
  useEffect(() => {
    const clearStorage = async () => {
      await AsyncStorage.clear()
      console.log('✅ AsyncStorage cleared - old login data removed')
    }
    clearStorage()
  }, [])

  return (
    <PaperProvider>
      <NotificationProvider>
        <AuthProvider>
          <RootNavigator />
          <NotificationOverlay />
        </AuthProvider>
      </NotificationProvider>
    </PaperProvider>
  )
}

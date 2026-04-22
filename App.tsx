import React, { useEffect } from 'react'
import { PaperProvider } from 'react-native-paper'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { AuthProvider } from './src/context/AuthContext'
import { RootNavigator } from './src/navigation/RootNavigator'

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
      <AuthProvider>
        <RootNavigator />
      </AuthProvider>
    </PaperProvider>
  )
}

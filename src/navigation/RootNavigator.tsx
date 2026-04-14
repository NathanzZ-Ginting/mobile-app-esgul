import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Ionicons } from '@expo/vector-icons'
import { ActivityIndicator, View } from 'react-native'
import { useAuth } from '../context/AuthContext'

import { LoginScreen } from '../screens/auth/LoginScreen'
import { RegisterScreen } from '../screens/auth/RegisterScreen'
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen'
import { HomeScreen } from '../screens/user/HomeScreen'
import { BookingScreen } from '../screens/user/BookingScreen'
import { BookingHistoryScreen } from '../screens/user/BookingHistoryScreen'
import { ProfileScreen } from '../screens/user/ProfileScreen'
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

const AuthNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
  </Stack.Navigator>
)

const UserTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: true,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: any
        if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline'
        else if (route.name === 'Booking') iconName = focused ? 'add-circle' : 'add-circle-outline'
        else if (route.name === 'BookingHistory') iconName = focused ? 'list' : 'list-outline'
        else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline'
        return <Ionicons name={iconName} size={size} color={color} />
      },
      tabBarActiveTintColor: '#2c5aa0',
      tabBarInactiveTintColor: '#999',
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Booking" component={BookingScreen} />
    <Tab.Screen name="BookingHistory" component={BookingHistoryScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
)

const AdminNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
  </Stack.Navigator>
)

export const RootNavigator = () => {
  const { isLoading, isSignedIn, role } = useAuth()

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#1976d2" />
      </View>
    )
  }

  return (
    <NavigationContainer>
      {isSignedIn ? (
        role === 'admin' ? <AdminNavigator /> : <UserTabNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  )
}

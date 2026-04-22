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
import { ChatScreen } from '../screens/user/ChatScreen'
import { ProfileScreen } from '../screens/user/ProfileScreen'
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen'
import { AdminChatScreen } from '../screens/admin/AdminChatScreen'

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
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: any
        if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline'
        else if (route.name === 'Booking') iconName = focused ? 'add-circle' : 'add-circle-outline'
        else if (route.name === 'BookingHistory') iconName = focused ? 'list' : 'list-outline'
        else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline'
        return <Ionicons name={iconName} size={size} color={color} />
      },
      tabBarActiveTintColor: '#8B6914',
      tabBarInactiveTintColor: '#666',
      tabBarStyle: {
        backgroundColor: '#2a2a2a',
        borderTopColor: '#3a3a3a',
        borderTopWidth: 1,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500',
      },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Booking" component={BookingScreen} />
    <Tab.Screen name="BookingHistory" component={BookingHistoryScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
)

const UserNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="UserTabs" component={UserTabNavigator} />
    <Stack.Screen 
      name="Chat" 
      component={ChatScreen}
      options={{
        cardStyle: { backgroundColor: '#1f1f1f' },
      }}
    />
  </Stack.Navigator>
)

const AdminTabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ focused, color, size }) => {
        let iconName: any
        if (route.name === 'AdminDashboard') iconName = focused ? 'speedometer' : 'speedometer'
        else if (route.name === 'AdminChat') iconName = focused ? 'chatbubble' : 'chatbubble-outline'
        return <Ionicons name={iconName} size={size} color={color} />
      },
      tabBarActiveTintColor: '#8B6914',
      tabBarInactiveTintColor: '#666',
      tabBarStyle: {
        backgroundColor: '#2a2a2a',
        borderTopColor: '#3a3a3a',
        borderTopWidth: 1,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: '500',
      },
    })}
  >
    <Tab.Screen name="AdminDashboard" component={AdminDashboardScreen} />
    <Tab.Screen name="AdminChat" component={AdminChatScreen} />
  </Tab.Navigator>
)

const AdminNavigator = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
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
        role === 'admin' ? <AdminNavigator /> : <UserNavigator />
      ) : (
        <AuthNavigator />
      )}
    </NavigationContainer>
  )
}

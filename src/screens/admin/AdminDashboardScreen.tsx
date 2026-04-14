import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, FlatList, Text, Alert } from 'react-native'
import { Card, Button, Menu } from 'react-native-paper'
import { useAuth } from '../../context/AuthContext'

interface AdminBooking {
  id: string
  userName: string
  service: string
  vehicleType: string
  status: string
  date: string
  time: string
}

export const AdminDashboardScreen: React.FC = () => {
  const { logout } = useAuth()
  const [bookings, setBookings] = useState<AdminBooking[]>([
    {
      id: '1',
      userName: 'John Doe',
      service: 'Oil Change',
      vehicleType: 'Mobil',
      status: 'Pending',
      date: '2024-01-20',
      time: '09:00',
    },
    {
      id: '2',
      userName: 'Jane Smith',
      service: 'Tire Installation',
      vehicleType: 'Motor',
      status: 'Confirmed',
      date: '2024-01-21',
      time: '10:00',
    },
  ])

  const [menuVisible, setMenuVisible] = useState<{ [key: string]: boolean }>({})

  const statuses = ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled']

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {
        text: 'Cancel',
        onPress: () => {},
        style: 'cancel',
      },
      {
        text: 'Logout',
        onPress: async () => {
          await logout()
        },
        style: 'destructive',
      },
    ])
  }

  const updateStatus = (bookingId: string, newStatus: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, status: newStatus } : b
      )
    )
    setMenuVisible({ ...menuVisible, [bookingId]: false })
  }

  const renderBooking = ({ item }: { item: AdminBooking }) => (
    <Card style={styles.bookingCard}>
      <Card.Content>
        <View style={styles.bookingHeader}>
          <View>
            <Text style={styles.userName}>{item.userName}</Text>
            <Text style={styles.serviceInfo}>
              {item.service} - {item.vehicleType}
            </Text>
          </View>
          <Text style={styles.dateTime}>{item.date} {item.time}</Text>
        </View>

        <View style={styles.statusRow}>
          <Text style={styles.label}>Status:</Text>
          <Menu
            visible={menuVisible[item.id] || false}
            onDismiss={() => setMenuVisible({ ...menuVisible, [item.id]: false })}
            anchor={
              <Button
                mode="outlined"
                size="small"
                onPress={() => setMenuVisible({ ...menuVisible, [item.id]: true })}
              >
                {item.status}
              </Button>
            }
          >
            {statuses.map((status) => (
              <Menu.Item
                key={status}
                onPress={() => updateStatus(item.id, status)}
                title={status}
              />
            ))}
          </Menu>
        </View>
      </Card.Content>
    </Card>
  )

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Admin Dashboard</Text>
            <Text style={styles.subtitle}>Manage Bookings & Services</Text>
          </View>
          <Button
            mode="contained"
            onPress={handleLogout}
            buttonColor="#ff6b6b"
            textColor="#fff"
            size="small"
          >
            Logout
          </Button>
        </View>
      </View>

      <FlatList
        data={bookings}
        renderItem={renderBooking}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.list}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#d32f2f',
    padding: 20,
    paddingTop: 40,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 4,
  },
  list: {
    padding: 12,
    gap: 12,
  },
  bookingCard: {
    marginVertical: 4,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  serviceInfo: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  dateTime: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    color: '#999',
    fontWeight: '500',
  },
})

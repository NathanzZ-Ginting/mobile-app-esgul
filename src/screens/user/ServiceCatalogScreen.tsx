import React, { useState } from 'react'
import { View, StyleSheet, FlatList, Text } from 'react-native'
import { Card, Chip } from 'react-native-paper'

interface Service {
  id: string
  title: string
  description: string
  price: number
  discountPercent?: number
  estimatedDuration: number
}

export const ServiceCatalogScreen: React.FC = () => {
  const [services] = useState<Service[]>([
    {
      id: '1',
      title: 'Oil Change',
      description: 'Complete oil and filter replacement',
      price: 150000,
      discountPercent: 20,
      estimatedDuration: 30,
    },
    {
      id: '2',
      title: 'Tire Installation',
      description: 'Professional tire installation service',
      price: 200000,
      estimatedDuration: 45,
    },
    {
      id: '3',
      title: 'Battery Replacement',
      description: 'Replace vehicle battery',
      price: 350000,
      estimatedDuration: 20,
    },
    {
      id: '4',
      title: 'Full Service',
      description: 'Complete vehicle maintenance and checkup',
      price: 500000,
      estimatedDuration: 120,
    },
  ])

  const renderService = ({ item }: { item: Service }) => {
    const discountedPrice = item.discountPercent
      ? Math.round(item.price * (1 - item.discountPercent / 100))
      : null

    return (
      <Card style={styles.serviceCard}>
        <Card.Content>
          <View style={styles.header}>
            <Text style={styles.title}>{item.title}</Text>
            {item.discountPercent && (
              <Chip
                label={`${item.discountPercent}% OFF`}
                style={styles.discountChip}
              />
            )}
          </View>

          <Text style={styles.description}>{item.description}</Text>

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Duration:</Text>
              <Text style={styles.value}>{item.estimatedDuration} min</Text>
            </View>

            <View style={styles.priceRow}>
              {discountedPrice ? (
                <>
                  <Text style={[styles.price, styles.originalPrice]}>
                    Rp {item.price.toLocaleString('id-ID')}
                  </Text>
                  <Text style={[styles.price, styles.discountedPrice]}>
                    Rp {discountedPrice.toLocaleString('id-ID')}
                  </Text>
                </>
              ) : (
                <Text style={[styles.price, styles.currentPrice]}>
                  Rp {item.price.toLocaleString('id-ID')}
                </Text>
              )}
            </View>
          </View>
        </Card.Content>
      </Card>
    )
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>Service Catalog</Text>
      </View>
      <FlatList
        data={services}
        renderItem={renderService}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        scrollEnabled={true}
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
    backgroundColor: '#1976d2',
    padding: 16,
    paddingTop: 40,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  list: {
    padding: 12,
    gap: 12,
  },
  serviceCard: {
    marginVertical: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  discountChip: {
    backgroundColor: '#FF5252',
  },
  description: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 12,
    color: '#999',
  },
  value: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  priceRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
  },
  originalPrice: {
    color: '#999',
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    color: '#FF5252',
  },
  currentPrice: {
    color: '#1976d2',
  },
})

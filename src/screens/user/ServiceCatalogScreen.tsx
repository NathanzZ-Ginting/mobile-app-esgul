import React, { useState, useEffect } from 'react'
import { View, StyleSheet, FlatList, Text, ActivityIndicator } from 'react-native'
import { Card, Chip } from 'react-native-paper'
import { supabase } from '../../services/supabaseClient'

interface Service {
  id: string
  title: string
  description: string
  price: number
  discount_percent?: number
  estimated_duration: number
}

export const ServiceCatalogScreen: React.FC = () => {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('services')
        .select('id, title, description, price, discount_percent, estimated_duration')
        .order('title', { ascending: true })

      if (error) throw error
      setServices(data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
      setServices([])
    } finally {
      setLoading(false)
    }
  }

  const renderService = ({ item }: { item: Service }) => {
    const discountedPrice = item.discount_percent
      ? Math.round(item.price * (1 - item.discount_percent / 100))
      : null

    return (
      <Card style={styles.serviceCard}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.title}>{item.title}</Text>
            {item.discount_percent && (
              <Chip
                label={`${item.discount_percent}% OFF`}
                style={styles.discountChip}
              />
            )}
          </View>

          <Text style={styles.description}>{item.description}</Text>

          <View style={styles.details}>
            <View style={styles.detailRow}>
              <Text style={styles.label}>Duration:</Text>
              <Text style={styles.value}>{item.estimated_duration} min</Text>
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
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B6914" />
        </View>
      ) : services.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No services available</Text>
        </View>
      ) : (
        <FlatList
          data={services}
          renderItem={renderService}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          scrollEnabled={true}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f1f1f',
  },
  header: {
    backgroundColor: '#2a2a2a',
    padding: 16,
    paddingTop: 40,
    borderBottomWidth: 2,
    borderBottomColor: '#8B6914',
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  list: {
    padding: 12,
    gap: 12,
  },
  serviceCard: {
    marginVertical: 4,
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  discountChip: {
    backgroundColor: '#FF5252',
  },
  description: {
    fontSize: 13,
    color: '#b0b0b0',
    marginBottom: 12,
    lineHeight: 18,
  },
  details: {
    borderTopWidth: 1,
    borderTopColor: '#3a3a3a',
    paddingTop: 12,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 12,
    color: '#6a6a6a',
  },
  value: {
    fontSize: 12,
    color: '#ffffff',
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
    color: '#666',
    textDecorationLine: 'line-through',
  },
  discountedPrice: {
    color: '#FF5252',
  },
  currentPrice: {
    color: '#8B6914',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8a8a8a',
  },
})

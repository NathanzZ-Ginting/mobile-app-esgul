import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'

export const HomeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Premium Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.greeting}>Good Morning</Text>
            <Text style={styles.title}>ESGUL Service</Text>
          </View>
          <Text style={styles.headerIcon}>🔧</Text>
        </View>
      </View>

      {/* Service Status Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Service Status</Text>
        <View style={styles.statusGrid}>
          <StatusCard label="Pending" count={2} color="#FF9800" icon="⏳" />
          <StatusCard label="Confirmed" count={1} color="#2196F3" icon="✓" />
          <StatusCard label="In Progress" count={0} color="#4CAF50" icon="⚙️" />
          <StatusCard label="Completed" count={5} color="#8BC34A" icon="✓✓" />
        </View>
      </View>

      {/* Queue Availability */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Queue Availability</Text>
        <View style={styles.card}>
          <QueueItem label="Mobil 08:00-10:00" status="Full" statusColor="#FF5252" />
          <QueueItem label="Motor 08:00-10:00" status="Full" statusColor="#FF5252" />
          <QueueItem label="Motor 10:00-12:00" status="Available" statusColor="#4CAF50" />
          <QueueItem label="Mobil 10:00-12:00" status="Full" statusColor="#FF5252" />
          <QueueItem label="Mobil 13:00-17:00" status="Full" statusColor="#FF5252" />
          <QueueItem label="Motor 13:00-17:00" status="Available" statusColor="#4CAF50" />
        </View>
      </View>

      {/* Active Promotions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Active Promotions</Text>
        <TouchableOpacity
          style={styles.promoCard}
          onPress={() => navigation.navigate('Booking')}
        >
          <View style={styles.promoContent}>
            <Text style={styles.promoEmoji}>🎉</Text>
            <View style={styles.promoText}>
              <Text style={styles.promoTitle}>Get 20% Off Oil Changes</Text>
              <Text style={styles.promoDesc}>Limited time offer</Text>
            </View>
          </View>
          <Text style={styles.promoArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Professional Team */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Team</Text>
        <View style={styles.card}>
          <TeamMember name="Budi Santoso" role="Senior Mechanic - Mobil" />
          <TeamMember name="Rakhman Wijaya" role="Specialist - Motor" />
        </View>
      </View>

      {/* About Workshop */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About Workshop</Text>
        <View style={styles.card}>
          <Text style={styles.description}>
            ESGUL Service Pro is a modern digital workshop service platform providing
            professional maintenance and repair services for your vehicles.
          </Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vision</Text>
            <Text style={styles.infoValue}>To be the most trusted digital workshop</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mission</Text>
            <Text style={styles.infoValue}>Deliver quality service with convenience</Text>
          </View>
        </View>
      </View>

      {/* Contact Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Location & Contact</Text>
        <View style={styles.card}>
          <ContactItem icon="📍" text="Jl. Merdeka No. 123, Jakarta 12345" />
          <ContactItem icon="📞" text="+62 21 555-0123" />
          <ContactItem icon="📧" text="contact@esgulservice.com" />
        </View>
      </View>

      <View style={styles.spacer} />
    </ScrollView>
  )
}

const StatusCard: React.FC<{
  label: string
  count: number
  color: string
  icon: string
}> = ({ label, count, color, icon }) => (
  <View style={[styles.statusCard, { borderLeftColor: color }]}>
    <Text style={styles.statusIcon}>{icon}</Text>
    <View style={styles.statusInfo}>
      <Text style={styles.statusLabel}>{label}</Text>
      <Text style={styles.statusCount}>{count}</Text>
    </View>
  </View>
)

const QueueItem: React.FC<{
  label: string
  status: string
  statusColor: string
}> = ({ label, status, statusColor }) => (
  <View style={styles.queueRow}>
    <Text style={styles.queueLabel}>{label}</Text>
    <View
      style={[
        styles.statusBadge,
        { backgroundColor: `${statusColor}20`, borderColor: statusColor },
      ]}
    >
      <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
    </View>
  </View>
)

const TeamMember: React.FC<{ name: string; role: string }> = ({ name, role }) => (
  <View style={styles.teamRow}>
    <View style={styles.teamAvatar}>
      <Text style={styles.avatarEmoji}>👨‍🔧</Text>
    </View>
    <View style={styles.teamDetails}>
      <Text style={styles.teamName}>{name}</Text>
      <Text style={styles.teamRole}>{role}</Text>
    </View>
  </View>
)

const ContactItem: React.FC<{ icon: string; text: string }> = ({ icon, text }) => (
  <View style={styles.contactRow}>
    <Text style={styles.contactIcon}>{icon}</Text>
    <Text style={styles.contactText}>{text}</Text>
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  header: {
    backgroundColor: '#2c5aa0',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 32,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 4,
  },
  headerIcon: {
    fontSize: 32,
    lineHeight: 32,
  },
  section: {
    paddingHorizontal: 24,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    letterSpacing: 0.2,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderLeftWidth: 4,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  statusIcon: {
    fontSize: 24,
    marginRight: 10,
    lineHeight: 24,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 12,
    color: '#8a8a8a',
    fontWeight: '500',
  },
  statusCount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  queueRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  queueLabel: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  promoCard: {
    backgroundColor: '#fff8e1',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ffe082',
  },
  promoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  promoEmoji: {
    fontSize: 24,
    marginRight: 12,
    lineHeight: 24,
  },
  promoText: {
    flex: 1,
  },
  promoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1a1a1a',
  },
  promoDesc: {
    fontSize: 12,
    color: '#8a8a8a',
    marginTop: 2,
  },
  promoArrow: {
    fontSize: 16,
    color: '#FF9800',
    fontWeight: '600',
    lineHeight: 16,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  teamAvatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#e3f2fd',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 20,
    lineHeight: 20,
  },
  teamDetails: {
    flex: 1,
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  teamRole: {
    fontSize: 12,
    color: '#8a8a8a',
    marginTop: 2,
  },
  description: {
    fontSize: 13,
    color: '#5a5a5a',
    lineHeight: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    marginBottom: 12,
  },
  infoRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#f5f5f5',
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2c5aa0',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 13,
    color: '#5a5a5a',
    lineHeight: 18,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  contactIcon: {
    fontSize: 18,
    marginRight: 12,
    lineHeight: 18,
  },
  contactText: {
    fontSize: 13,
    color: '#5a5a5a',
    flex: 1,
    lineHeight: 18,
  },
  spacer: {
    height: 24,
  },
})

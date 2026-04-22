import React, { useState, useEffect, useRef } from 'react'
import { 
  View, 
  StyleSheet, 
  FlatList, 
  Text, 
  TouchableOpacity, 
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { TextInput, IconButton } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { useAuth } from '../../context/AuthContext'
import { supabase } from '../../services/supabaseClient'

interface Message {
  id: string
  senderId: string
  receiverId: string
  text: string
  timestamp: Date
  read: boolean
  senderType: 'user' | 'admin'
}

const ADMIN_USER_ID = 'admin-support-team'

export const ChatScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [showInfo, setShowInfo] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const flatListRef = useRef<FlatList>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadMessages()
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('chat_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `or(sender_id.eq.${user?.id},receiver_id.eq.${user?.id})`
        },
        (payload: any) => {
          if (payload.new) {
            const newMsg: Message = {
              id: payload.new.id,
              senderId: payload.new.sender_id,
              receiverId: payload.new.receiver_id,
              text: payload.new.message,
              timestamp: new Date(payload.new.created_at),
              read: payload.new.read,
              senderType: payload.new.sender_id === user?.id ? 'user' : 'admin',
            }
            setMessages(prev => {
              const exists = prev.some(m => m.id === newMsg.id)
              return exists ? prev : [...prev, newMsg]
            })
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user?.id])

  const loadMessages = async () => {
    try {
      setLoading(true)
      if (!user?.id) return

      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order('created_at', { ascending: true })

      if (error) throw error

      const formattedMessages: Message[] = (data || []).map((msg: any) => ({
        id: msg.id,
        senderId: msg.sender_id,
        receiverId: msg.receiver_id,
        text: msg.message,
        timestamp: new Date(msg.created_at),
        read: msg.read,
        senderType: msg.sender_id === user.id ? 'user' : 'admin',
      }))

      setMessages(formattedMessages)
      
      const unreadMessageIds = formattedMessages
        .filter(m => m.receiverId === user.id && !m.read)
        .map(m => m.id)

      if (unreadMessageIds.length > 0) {
        await supabase
          .from('chat_messages')
          .update({ read: true })
          .in('id', unreadMessageIds)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const count = messages.filter(m => m.senderType === 'admin' && !m.read).length
    setUnreadCount(count)
  }, [messages])

  const sendMessage = async () => {
    if (!newMessage.trim() || !user?.id) return

    try {
      setSending(true)
      
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          sender_id: user.id,
          receiver_id: ADMIN_USER_ID,
          message: newMessage,
          read: true,
        })

      if (error) throw error

      setNewMessage('')
      flatListRef.current?.scrollToEnd({ animated: true })
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setSending(false)
    }
  }

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  const formatDate = (date: Date): string => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const shouldShowDateSeparator = (currentIndex: number): boolean => {
    if (currentIndex === 0) return true
    const currentDate = messages[currentIndex].timestamp.toDateString()
    const prevDate = messages[currentIndex - 1].timestamp.toDateString()
    return currentDate !== prevDate
  }

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const showDate = shouldShowDateSeparator(index)
    
    return (
      <View>
        {showDate && (
          <View style={styles.dateSeparator}>
            <Text style={styles.dateSeparatorText}>{formatDate(item.timestamp)}</Text>
          </View>
        )}
        <View
          style={[
            styles.messageContainer,
            item.senderType === 'user' ? styles.userMessageContainer : styles.adminMessageContainer,
          ]}
        >
          <View
            style={[
              styles.messageBubble,
              item.senderType === 'user' ? styles.userMessage : styles.adminMessage,
            ]}
          >
            <Text style={styles.messageText}>{item.text}</Text>
            <View style={styles.messageFooter}>
              <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
              {item.senderType === 'user' && (
                <MaterialCommunityIcons 
                  name={item.read ? 'check-all' : 'check'} 
                  size={14} 
                  color="#b0b0b0"
                  style={{ marginLeft: 4 }}
                />
              )}
            </View>
          </View>
        </View>
      </View>
    )
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="chevron-left" size={28} color="#8B6914" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>Workshop Support</Text>
            <Text style={styles.subtitle}>Usually responds in minutes</Text>
          </View>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{unreadCount}</Text>
            </View>
          )}
        </View>
        <TouchableOpacity 
          onPress={() => setShowInfo(true)}
          style={styles.infoButton}
        >
          <MaterialCommunityIcons name="information-outline" size={24} color="#8B6914" />
        </TouchableOpacity>
      </View>

      {/* Messages List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B6914" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          scrollEnabled={true}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialCommunityIcons name="chat-outline" size={48} color="#8a8a8a" />
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Start a conversation with our support team</Text>
            </View>
          }
        />
      )}

      {/* Input Area */}
      <View style={styles.inputArea}>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Type your message..."
            placeholderTextColor="#666666"
            value={newMessage}
            onChangeText={setNewMessage}
            editable={!sending}
            multiline
            maxLength={500}
            style={styles.input}
            mode="outlined"
            outlineColor="#3a3a3a"
            activeOutlineColor="#8B6914"
            textColor="#ffffff"
            theme={{
              colors: {
                background: '#1f1f1f',
              },
            }}
          />
          {sending ? (
            <View style={styles.sendButton}>
              <ActivityIndicator size="small" color="#8B6914" />
            </View>
          ) : (
            <IconButton
              icon="send"
              iconColor={newMessage.trim() ? '#8B6914' : '#666666'}
              onPress={sendMessage}
              disabled={!newMessage.trim()}
              style={styles.sendButton}
            />
          )}
        </View>
        <Text style={styles.charCount}>
          {newMessage.length}/500
        </Text>
      </View>

      {/* Info Modal */}
      <Modal visible={showInfo} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chat Info</Text>
              <TouchableOpacity onPress={() => setShowInfo(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* Modal Body */}
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Chat Guidelines */}
              <View style={styles.infoSection}>
                <View style={styles.infoHeader}>
                  <MaterialCommunityIcons name="chat-plus-outline" size={20} color="#8B6914" />
                  <Text style={styles.infoTitle}>Chat Guidelines</Text>
                </View>
                <View style={styles.guidelineItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.guidelineText}>Be clear and specific about your issue</Text>
                </View>
                <View style={styles.guidelineItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.guidelineText}>Include booking reference if available</Text>
                </View>
                <View style={styles.guidelineItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.guidelineText}>Provide photos if reporting issues</Text>
                </View>
                <View style={styles.guidelineItem}>
                  <Text style={styles.bulletPoint}>•</Text>
                  <Text style={styles.guidelineText}>Response time varies by time of day</Text>
                </View>
              </View>

              {/* Support Hours */}
              <View style={styles.infoSection}>
                <View style={styles.infoHeader}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color="#8B6914" />
                  <Text style={styles.infoTitle}>Support Hours</Text>
                </View>
                <View style={styles.hoursItem}>
                  <Text style={styles.hoursDay}>Monday - Friday</Text>
                  <Text style={styles.hoursTime}>09:00 - 17:00</Text>
                </View>
                <View style={styles.hoursItem}>
                  <Text style={styles.hoursDay}>Saturday</Text>
                  <Text style={styles.hoursTime}>10:00 - 16:00</Text>
                </View>
                <View style={styles.hoursItem}>
                  <Text style={styles.hoursDay}>Sunday</Text>
                  <Text style={styles.hoursTime}>Closed</Text>
                </View>
              </View>

              {/* Common Issues */}
              <View style={styles.infoSection}>
                <View style={styles.infoHeader}>
                  <MaterialCommunityIcons name="help-circle-outline" size={20} color="#8B6914" />
                  <Text style={styles.infoTitle}>Common Issues</Text>
                </View>
                <View style={styles.issueItem}>
                  <Text style={styles.issueTitle}>How to reschedule?</Text>
                  <Text style={styles.issueDesc}>Go to Booking History and click "Edit" on your booking</Text>
                </View>
                <View style={styles.issueItem}>
                  <Text style={styles.issueTitle}>How to cancel?</Text>
                  <Text style={styles.issueDesc}>Click "Cancel" button on your active booking before 24 hours</Text>
                </View>
                <View style={styles.issueItem}>
                  <Text style={styles.issueTitle}>Pricing question?</Text>
                  <Text style={styles.issueDesc}>Check Service Catalog for detailed pricing and duration</Text>
                </View>
              </View>

              <View style={styles.spacer} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1f1f1f',
  },
  header: {
    backgroundColor: '#2a2a2a',
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#8a8a8a',
    fontWeight: '500',
  },
  unreadBadge: {
    backgroundColor: '#8B6914',
    borderRadius: 50,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 12,
  },
  unreadCount: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  infoButton: {
    padding: 8,
    marginRight: -8,
  },
  messagesList: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 4,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 16,
    marginTop: 8,
  },
  dateSeparatorText: {
    fontSize: 11,
    color: '#8a8a8a',
    fontWeight: '600',
    backgroundColor: '#1f1f1f',
    paddingHorizontal: 8,
  },
  messageContainer: {
    marginVertical: 4,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  adminMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  userMessage: {
    backgroundColor: '#8B6914',
  },
  adminMessage: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  messageText: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 18,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    justifyContent: 'flex-end',
  },
  timestamp: {
    fontSize: 11,
    color: '#b0b0b0',
    marginTop: 2,
  },
  inputArea: {
    backgroundColor: '#2a2a2a',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#3a3a3a',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 4,
  },
  input: {
    flex: 1,
    maxHeight: 100,
    fontSize: 14,
  },
  sendButton: {
    margin: 0,
  },
  charCount: {
    fontSize: 10,
    color: '#8a8a8a',
    marginTop: 4,
    textAlign: 'right',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1f1f1f',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingTop: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  infoSection: {
    marginBottom: 24,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
  guidelineItem: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  bulletPoint: {
    fontSize: 14,
    color: '#8B6914',
    fontWeight: '700',
  },
  guidelineText: {
    fontSize: 13,
    color: '#b0b0b0',
    flex: 1,
    lineHeight: 18,
  },
  hoursItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  hoursDay: {
    fontSize: 13,
    color: '#ffffff',
    fontWeight: '600',
  },
  hoursTime: {
    fontSize: 13,
    color: '#8B6914',
    fontWeight: '700',
  },
  issueItem: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
  },
  issueTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  issueDesc: {
    fontSize: 12,
    color: '#b0b0b0',
    lineHeight: 16,
  },
  spacer: {
    height: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1f1f1f',
  },
  loadingText: {
    fontSize: 14,
    color: '#b0b0b0',
    marginTop: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
    minHeight: 300,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
    marginTop: 12,
  },
  emptySubtext: {
    fontSize: 13,
    color: '#8a8a8a',
    marginTop: 6,
  },
})

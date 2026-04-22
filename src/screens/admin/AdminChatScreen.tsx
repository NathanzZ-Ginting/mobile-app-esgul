import React, { useState, useEffect, useRef } from 'react'
import { 
  View, 
  StyleSheet, 
  FlatList, 
  Text, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native'
import { TextInput, IconButton } from 'react-native-paper'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { supabase } from '../../services/supabaseClient'

interface ChatUser {
  id: string
  name: string
  lastMessage: string
  lastMessageTime: Date
  unreadCount: number
}

interface Message {
  id: string
  senderId: string
  receiverId: string
  text: string
  timestamp: Date
  read: boolean
}

const ADMIN_USER_ID = 'admin-support-team'

export const AdminChatScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [view, setView] = useState<'list' | 'chat'>('list')
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([])
  const [selectedUser, setSelectedUser] = useState<ChatUser | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const flatListRef = useRef<FlatList>(null)

  useEffect(() => {
    loadChatUsers()
    
    // Subscribe to new messages from users
    const channel = supabase
      .channel('admin_chat_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chat_messages',
          filter: `receiver_id.eq.${ADMIN_USER_ID}`
        },
        (payload: any) => {
          if (payload.new) {
            // Add message if user is selected
            if (selectedUser?.id === payload.new.sender_id) {
              setMessages(prev => {
                const exists = prev.some(m => m.id === payload.new.id)
                return exists ? prev : [...prev, {
                  id: payload.new.id,
                  senderId: payload.new.sender_id,
                  receiverId: payload.new.receiver_id,
                  text: payload.new.message,
                  timestamp: new Date(payload.new.created_at),
                  read: payload.new.read,
                }]
              })
              flatListRef.current?.scrollToEnd({ animated: true })
            }
            
            // Update chat users list
            setChatUsers(prev => {
              const userExists = prev.find(u => u.id === payload.new.sender_id)
              if (userExists) {
                return prev.map(u => 
                  u.id === payload.new.sender_id 
                    ? {
                        ...u,
                        lastMessage: payload.new.message,
                        lastMessageTime: new Date(payload.new.created_at),
                      }
                    : u
                )
              }
              return prev
            })
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [selectedUser?.id])

  const loadChatUsers = async () => {
    try {
      setLoading(true)
      
      // Get all unique users who have sent messages
      const { data, error } = await supabase
        .from('chat_messages')
        .select('sender_id, message, created_at, read, users(id, name)')
        .eq('receiver_id', ADMIN_USER_ID)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Group by user and get latest message
      const userMap = new Map<string, any>()
      
      data?.forEach((msg: any) => {
        if (!userMap.has(msg.sender_id)) {
          userMap.set(msg.sender_id, {
            id: msg.sender_id,
            name: msg.users?.[0]?.name || 'Unknown User',
            lastMessage: msg.message,
            lastMessageTime: new Date(msg.created_at),
            unreadCount: msg.read ? 0 : 1,
          })
        } else if (!msg.read && !userMap.get(msg.sender_id).hasBeenCounted) {
          const existing = userMap.get(msg.sender_id)
          existing.unreadCount += 1
        }
      })

      setChatUsers(Array.from(userMap.values()))
    } catch (error) {
      console.error('Error loading chat users:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .or(`and(sender_id.eq.${userId},receiver_id.eq.${ADMIN_USER_ID}),and(sender_id.eq.${ADMIN_USER_ID},receiver_id.eq.${userId})`)
        .order('created_at', { ascending: true })

      if (error) throw error

      const formattedMessages: Message[] = (data || []).map((msg: any) => ({
        id: msg.id,
        senderId: msg.sender_id,
        receiverId: msg.receiver_id,
        text: msg.message,
        timestamp: new Date(msg.created_at),
        read: msg.read,
      }))

      setMessages(formattedMessages)

      // Mark messages from user as read
      const unreadMessageIds = formattedMessages
        .filter(m => m.senderId === userId && !m.read)
        .map(m => m.id)

      if (unreadMessageIds.length > 0) {
        await supabase
          .from('chat_messages')
          .update({ read: true })
          .in('id', unreadMessageIds)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    }
  }

  const handleOpenChat = async (user: ChatUser) => {
    setSelectedUser(user)
    await loadMessages(user.id)
    setChatUsers(prev =>
      prev.map(u => (u.id === user.id ? { ...u, unreadCount: 0 } : u))
    )
    setView('chat')
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return

    try {
      setSending(true)
      
      const { error } = await supabase
        .from('chat_messages')
        .insert({
          sender_id: ADMIN_USER_ID,
          receiver_id: selectedUser.id,
          message: newMessage,
          read: false,
        })

      if (error) throw error

      setNewMessage('')
      flatListRef.current?.scrollToEnd({ animated: true })

      // Reload chat users to update last message
      await loadChatUsers()
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
      hour12: true,
    })
  }

  const formatLastSeen = (date: Date): string => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  const getTotalUnread = () => chatUsers.reduce((sum, user) => sum + user.unreadCount, 0)

  const renderChatUser = ({ item }: { item: ChatUser }) => (
    <TouchableOpacity
      style={[styles.chatUserItem, selectedUser?.id === item.id && styles.chatUserItemActive]}
      onPress={() => handleOpenChat(item)}
    >
      <View style={styles.avatarContainer}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {item.name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </Text>
        </View>
        {item.unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.userContent}>
        <Text style={styles.userName}>{item.name}</Text>
        <Text style={styles.lastMessage} numberOfLines={1}>
          {item.lastMessage}
        </Text>
      </View>

      <View style={styles.userTime}>
        <Text style={styles.timeText}>{formatLastSeen(item.lastMessageTime)}</Text>
      </View>
    </TouchableOpacity>
  )

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.senderId === ADMIN_USER_ID ? styles.adminMessageContainer : styles.userMessageContainer,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          item.senderId === ADMIN_USER_ID ? styles.adminMessage : styles.userMessage,
        ]}
      >
        <Text style={styles.messageText}>{item.text}</Text>
        <Text style={styles.timestamp}>{formatTime(item.timestamp)}</Text>
      </View>
    </View>
  )

  if (view === 'list') {
    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Customer Chat</Text>
            <Text style={styles.headerSubtitle}>
              {getTotalUnread() > 0 ? `${getTotalUnread()} unread` : 'All caught up'}
            </Text>
          </View>
          <View style={styles.unreadBadgeHeader}>
            <Text style={styles.unreadBadgeHeaderText}>{getTotalUnread()}</Text>
          </View>
        </View>

        {/* Chat Users List */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#8B6914" />
          </View>
        ) : chatUsers.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="chat-outline" size={48} color="#8a8a8a" />
            <Text style={styles.emptyText}>No conversations yet</Text>
          </View>
        ) : (
          <FlatList
            data={chatUsers}
            renderItem={renderChatUser}
            keyExtractor={(item) => item.id}
            scrollEnabled={true}
          />
        )}
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
          onPress={() => setView('list')}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="chevron-left" size={28} color="#8B6914" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{selectedUser?.name || 'Chat'}</Text>
          <Text style={styles.headerSubtitle}>Last message {formatLastSeen(selectedUser?.lastMessageTime || new Date())}</Text>
        </View>
      </View>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        ListEmptyComponent={
          <View style={styles.emptyMessages}>
            <Text style={styles.emptyText}>No messages yet</Text>
          </View>
        }
      />

      {/* Input Area */}
      <View style={styles.inputArea}>
        <View style={styles.inputContainer}>
          <TextInput
            placeholder="Type your reply..."
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
      </View>
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
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8a8a8a',
    fontWeight: '500',
  },
  headerContent: {
    flex: 1,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  unreadBadgeHeader: {
    backgroundColor: '#8B6914',
    borderRadius: 50,
    minWidth: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unreadBadgeHeaderText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  // Chat Users List
  chatUserItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#3a3a3a',
    gap: 12,
  },
  chatUserItemActive: {
    backgroundColor: 'rgba(139, 105, 20, 0.1)',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#8B6914',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  unreadBadge: {
    position: 'absolute',
    bottom: -4,
    right: -4,
    backgroundColor: '#FF5252',
    borderRadius: 50,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1f1f1f',
  },
  unreadBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '700',
  },
  userContent: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  lastMessage: {
    fontSize: 12,
    color: '#b0b0b0',
  },
  userTime: {
    alignItems: 'flex-end',
  },
  timeText: {
    fontSize: 11,
    color: '#8a8a8a',
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
  emptyMessages: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyText: {
    fontSize: 14,
    color: '#8a8a8a',
    marginTop: 12,
  },
  // Messages
  messagesList: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 8,
  },
  messageContainer: {
    marginVertical: 4,
  },
  userMessageContainer: {
    alignItems: 'flex-start',
  },
  adminMessageContainer: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  userMessage: {
    backgroundColor: '#2a2a2a',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  adminMessage: {
    backgroundColor: '#8B6914',
  },
  messageText: {
    fontSize: 14,
    color: '#ffffff',
    lineHeight: 18,
  },
  timestamp: {
    fontSize: 10,
    color: '#b0b0b0',
    marginTop: 4,
  },
  // Input Area
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
})

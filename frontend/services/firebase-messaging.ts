import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface Message {
  id?: string
  chatId: string
  senderId: string
  senderName: string
  content: string
  timestamp: Date
  read: boolean
  type: 'text' | 'image' | 'file'
}

export interface Chat {
  id?: string
  jobId: string
  employerId: string
  workerId: string
  employerName: string
  workerName: string
  lastMessage?: string
  lastMessageTime?: Date
  unreadCount: number
  createdAt: Date
  updatedAt: Date
}

class FirebaseMessagingService {
  // Create or get chat between employer and worker
  async getOrCreateChat(jobId: string, employerId: string, workerId: string, employerName: string, workerName: string): Promise<{ success: boolean; chatId?: string; error?: string }> {
    try {
      // Check if chat already exists
      const q = query(
        collection(db, 'chats'),
        where('jobId', '==', jobId),
        where('employerId', '==', employerId),
        where('workerId', '==', workerId)
      )

      const snapshot = await getDocs(q)
      
      if (!snapshot.empty) {
        // Chat exists, return the first one
        const chatId = snapshot.docs[0].id
        return { success: true, chatId }
      } else {
        // Create new chat
        const chatData = {
          jobId,
          employerId,
          workerId,
          employerName,
          workerName,
          unreadCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }

        const docRef = await addDoc(collection(db, 'chats'), chatData)
        return { success: true, chatId: docRef.id }
      }
    } catch (error: any) {
      console.error('Error getting or creating chat:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to get or create chat' 
      }
    }
  }

  // Send a message
  async sendMessage(chatId: string, senderId: string, senderName: string, content: string, type: Message['type'] = 'text'): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const messageData = {
        chatId,
        senderId,
        senderName,
        content,
        type,
        timestamp: new Date(),
        read: false
      }

      const docRef = await addDoc(collection(db, 'messages'), messageData)

      // Update chat with last message
      await updateDoc(doc(db, 'chats', chatId), {
        lastMessage: content,
        lastMessageTime: new Date(),
        updatedAt: new Date()
      })

      return { success: true, messageId: docRef.id }
    } catch (error: any) {
      console.error('Error sending message:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to send message' 
      }
    }
  }

  // Get messages for a chat
  async getMessages(chatId: string, limitCount: number = 50): Promise<{ success: boolean; messages?: Message[]; error?: string }> {
    try {
      const q = query(
        collection(db, 'messages'),
        where('chatId', '==', chatId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      )

      const snapshot = await getDocs(q)
      const messages: Message[] = []

      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as Message)
      })

      // Reverse to get chronological order
      messages.reverse()

      return { success: true, messages }
    } catch (error: any) {
      console.error('Error getting messages:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to get messages' 
      }
    }
  }

  // Listen to messages in real-time
  subscribeToMessages(chatId: string, callback: (messages: Message[]) => void): () => void {
    const q = query(
      collection(db, 'messages'),
      where('chatId', '==', chatId),
      orderBy('timestamp', 'asc')
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages: Message[] = []
      snapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() } as Message)
      })
      callback(messages)
    })

    return unsubscribe
  }

  // Mark messages as read
  async markMessagesAsRead(chatId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const q = query(
        collection(db, 'messages'),
        where('chatId', '==', chatId),
        where('senderId', '!=', userId),
        where('read', '==', false)
      )

      const snapshot = await getDocs(q)
      const updatePromises = snapshot.docs.map(doc => 
        updateDoc(doc.ref, { read: true })
      )

      await Promise.all(updatePromises)

      // Update chat unread count
      await updateDoc(doc(db, 'chats', chatId), {
        unreadCount: 0,
        updatedAt: new Date()
      })

      return { success: true }
    } catch (error: any) {
      console.error('Error marking messages as read:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to mark messages as read' 
      }
    }
  }

  // Get user's chats
  async getUserChats(userId: string): Promise<{ success: boolean; chats?: Chat[]; error?: string }> {
    try {
      const q = query(
        collection(db, 'chats'),
        where('employerId', '==', userId),
        orderBy('updatedAt', 'desc')
      )

      const snapshot = await getDocs(q)
      const chats: Chat[] = []

      snapshot.forEach((doc) => {
        chats.push({ id: doc.id, ...doc.data() } as Chat)
      })

      // Also get chats where user is worker
      const workerQ = query(
        collection(db, 'chats'),
        where('workerId', '==', userId),
        orderBy('updatedAt', 'desc')
      )

      const workerSnapshot = await getDocs(workerQ)
      workerSnapshot.forEach((doc) => {
        chats.push({ id: doc.id, ...doc.data() } as Chat)
      })

      // Sort by updatedAt
      chats.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())

      return { success: true, chats }
    } catch (error: any) {
      console.error('Error getting user chats:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to get user chats' 
      }
    }
  }

  // Get chat by ID
  async getChatById(chatId: string): Promise<{ success: boolean; chat?: Chat; error?: string }> {
    try {
      const docRef = doc(db, 'chats', chatId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const chat = { id: docSnap.id, ...docSnap.data() } as Chat
        return { success: true, chat }
      } else {
        return { success: false, error: 'Chat not found' }
      }
    } catch (error: any) {
      console.error('Error getting chat:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to get chat' 
      }
    }
  }
}

export const firebaseMessagingService = new FirebaseMessagingService() 
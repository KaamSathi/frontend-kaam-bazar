import { firebaseMessagingService, Message, Chat } from './firebase-messaging'

// Re-export Firebase messaging types for compatibility
export type { Message, Chat }

// Messaging service using Firebase
export const messagingService = {
  // Create or get chat between employer and worker
  async getOrCreateChat(jobId: string, employerId: string, workerId: string, employerName: string, workerName: string) {
    return firebaseMessagingService.getOrCreateChat(jobId, employerId, workerId, employerName, workerName)
  },

  // Send a message
  async sendMessage(chatId: string, senderId: string, senderName: string, content: string, type: Message['type'] = 'text') {
    return firebaseMessagingService.sendMessage(chatId, senderId, senderName, content, type)
  },

  // Get messages for a chat
  async getMessages(chatId: string, limitCount: number = 50) {
    return firebaseMessagingService.getMessages(chatId, limitCount)
  },

  // Subscribe to messages in real-time
  subscribeToMessages(chatId: string, callback: (messages: Message[]) => void) {
    return firebaseMessagingService.subscribeToMessages(chatId, callback)
  },

  // Mark messages as read
  async markMessagesAsRead(chatId: string, userId: string) {
    return firebaseMessagingService.markMessagesAsRead(chatId, userId)
  },

  // Get user's chats
  async getUserChats(userId: string) {
    return firebaseMessagingService.getUserChats(userId)
  },

  // Get chat by ID
  async getChatById(chatId: string) {
    return firebaseMessagingService.getChatById(chatId)
  },

  // Helper function to format message for display
  formatMessageForDisplay(message: Message, currentUserId: string) {
    return {
      ...message,
      isOwnMessage: message.senderId === currentUserId,
      formattedTime: new Date(message.timestamp).toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      formattedDate: new Date(message.timestamp).toLocaleDateString('en-IN'),
    }
  },

  // Helper function to format chat for display
  formatChatForDisplay(chat: Chat, currentUserId: string) {
    const otherPartyName = chat.employerId === currentUserId 
      ? chat.workerName 
      : chat.employerName

    return {
      ...chat,
      otherPartyName,
      isEmployer: chat.employerId === currentUserId,
      formattedLastMessageTime: chat.lastMessageTime 
        ? new Date(chat.lastMessageTime).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit'
          })
        : null,
      hasUnreadMessages: chat.unreadCount > 0,
    }
  },

  // Helper function to validate message
  validateMessage(content: string) {
    const errors: string[] = []

    if (!content.trim()) {
      errors.push('Message content is required')
    }

    if (content.length > 1000) {
      errors.push('Message is too long (max 1000 characters)')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
} 
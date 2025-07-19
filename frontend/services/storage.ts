import { firebaseStorageService } from './firebase-storage'

// Storage service using Firebase
export const storageService = {
  // Upload profile image
  async uploadProfileImage(file: File, userId: string) {
    return firebaseStorageService.uploadProfileImage(file, userId)
  },

  // Upload job images
  async uploadJobImages(files: File[], jobId: string) {
    return firebaseStorageService.uploadJobImages(files, jobId)
  },

  // Upload document
  async uploadDocument(file: File, userId: string, type: 'id-proof' | 'skill-certificate' | 'other') {
    return firebaseStorageService.uploadDocument(file, userId, type)
  },

  // Delete file
  async deleteFile(filePath: string) {
    return firebaseStorageService.deleteFile(filePath)
  },

  // Delete all files in a folder
  async deleteFolder(folderPath: string) {
    return firebaseStorageService.deleteFolder(folderPath)
  },

  // Get file URL
  async getFileURL(filePath: string) {
    return firebaseStorageService.getFileURL(filePath)
  },

  // Helper function to validate file
  validateFile(file: File, maxSize: number = 5 * 1024 * 1024) { // 5MB default
    const errors: string[] = []

    // Check file size
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`)
    }

    // Check file type for images
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    const isImage = imageTypes.includes(file.type)
    
    if (!isImage) {
      errors.push('Only JPEG, PNG, and WebP images are allowed')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  },

  // Helper function to get file extension
  getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || ''
  },

  // Helper function to generate unique filename
  generateUniqueFilename(originalName: string, userId: string): string {
    const extension = this.getFileExtension(originalName)
    const timestamp = Date.now()
    return `${userId}_${timestamp}.${extension}`
  },

  // Helper function to format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
} 
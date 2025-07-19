import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage'
import { storage } from '@/lib/firebase'

class FirebaseStorageService {
  // Upload profile image
  async uploadProfileImage(file: File, userId: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const fileExtension = file.name.split('.').pop()
      const fileName = `profile-images/${userId}.${fileExtension}`
      const storageRef = ref(storage, fileName)

      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)

      return { success: true, url: downloadURL }
    } catch (error: any) {
      console.error('Error uploading profile image:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to upload profile image' 
      }
    }
  }

  // Upload job images
  async uploadJobImages(files: File[], jobId: string): Promise<{ success: boolean; urls?: string[]; error?: string }> {
    try {
      const uploadPromises = files.map(async (file, index) => {
        const fileExtension = file.name.split('.').pop()
        const fileName = `job-images/${jobId}/image-${index}.${fileExtension}`
        const storageRef = ref(storage, fileName)

        const snapshot = await uploadBytes(storageRef, file)
        return getDownloadURL(snapshot.ref)
      })

      const urls = await Promise.all(uploadPromises)
      return { success: true, urls }
    } catch (error: any) {
      console.error('Error uploading job images:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to upload job images' 
      }
    }
  }

  // Upload document
  async uploadDocument(file: File, userId: string, type: 'id-proof' | 'skill-certificate' | 'other'): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const fileExtension = file.name.split('.').pop()
      const fileName = `documents/${userId}/${type}/${Date.now()}.${fileExtension}`
      const storageRef = ref(storage, fileName)

      const snapshot = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(snapshot.ref)

      return { success: true, url: downloadURL }
    } catch (error: any) {
      console.error('Error uploading document:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to upload document' 
      }
    }
  }

  // Delete file
  async deleteFile(filePath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const fileRef = ref(storage, filePath)
      await deleteObject(fileRef)
      return { success: true }
    } catch (error: any) {
      console.error('Error deleting file:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to delete file' 
      }
    }
  }

  // Delete all files in a folder
  async deleteFolder(folderPath: string): Promise<{ success: boolean; error?: string }> {
    try {
      const folderRef = ref(storage, folderPath)
      const result = await listAll(folderRef)
      
      const deletePromises = result.items.map(itemRef => deleteObject(itemRef))
      await Promise.all(deletePromises)

      return { success: true }
    } catch (error: any) {
      console.error('Error deleting folder:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to delete folder' 
      }
    }
  }

  // Get file URL
  async getFileURL(filePath: string): Promise<{ success: boolean; url?: string; error?: string }> {
    try {
      const fileRef = ref(storage, filePath)
      const url = await getDownloadURL(fileRef)
      return { success: true, url }
    } catch (error: any) {
      console.error('Error getting file URL:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to get file URL' 
      }
    }
  }
}

export const firebaseStorageService = new FirebaseStorageService() 
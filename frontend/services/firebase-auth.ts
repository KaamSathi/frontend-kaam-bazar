import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile
} from 'firebase/auth'
import { getFirestore, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

interface UserProfile {
  name: string
  role: 'employer' | 'worker'
  email: string
  phone?: string
  createdAt: Date
  updatedAt: Date
}

interface AuthResult {
  success: boolean
  error?: string
  user?: FirebaseUser
}

export class FirebaseAuthService {
  private auth = auth
  private db = db

  // Email/Password Registration
  async registerWithEmail(email: string, password: string, userData: { name: string; role: 'employer' | 'worker' }): Promise<AuthResult> {
    try {
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password)
      const user = userCredential.user

      // Update user profile
      await updateProfile(user, {
        displayName: userData.name
      })

      // Save user profile to Firestore
      await this.saveUserProfile(user.uid, {
        ...userData,
        email: email,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      return { success: true, user }
    } catch (error: any) {
      console.error('Registration error:', error)
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      }
    }
  }

  // Email/Password Login
  async loginWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password)
      const user = userCredential.user

      // Update last login
      await this.updateLastLogin(user.uid)

      return { success: true, user }
    } catch (error: any) {
      console.error('Login error:', error)
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      }
    }
  }

  // Phone/Password Registration (for development)
  async registerWithPhone(phone: string, password: string, userData: { name: string; role: 'employer' | 'worker' }): Promise<AuthResult> {
    try {
      // Create email from phone for Firebase Auth
      const email = `${phone}@kaambazar.local`
      
      const userCredential = await createUserWithEmailAndPassword(this.auth, email, password)
      const user = userCredential.user

      // Update user profile
      await updateProfile(user, {
        displayName: userData.name
      })

      // Save user profile to Firestore
      await this.saveUserProfile(user.uid, {
        ...userData,
        email: email,
        phone: phone,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      return { success: true, user }
    } catch (error: any) {
      console.error('Phone registration error:', error)
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      }
    }
  }

  // Phone/Password Login (for development)
  async loginWithPhone(phone: string, password: string): Promise<AuthResult> {
    try {
      // Create email from phone for Firebase Auth
      const email = `${phone}@kaambazar.local`
      
      const userCredential = await signInWithEmailAndPassword(this.auth, email, password)
      const user = userCredential.user

      // Update last login
      await this.updateLastLogin(user.uid)

      return { success: true, user }
    } catch (error: any) {
      console.error('Phone login error:', error)
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      }
    }
  }

  private getErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/email-already-in-use':
        return 'An account with this email already exists'
      case 'auth/invalid-email':
        return 'Please enter a valid email address'
      case 'auth/weak-password':
        return 'Password should be at least 6 characters long'
      case 'auth/user-not-found':
        return 'No account found with this email/password'
      case 'auth/wrong-password':
        return 'Incorrect password'
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later'
      default:
        return 'Authentication failed. Please try again'
    }
  }

  private async saveUserProfile(uid: string, profile: UserProfile): Promise<void> {
    try {
      await setDoc(doc(this.db, 'users', uid), profile)
    } catch (error) {
      console.error('Error saving user profile:', error)
    }
  }

  private async updateLastLogin(uid: string): Promise<void> {
    try {
      await updateDoc(doc(this.db, 'users', uid), {
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error updating last login:', error)
    }
  }

  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const docRef = doc(this.db, 'users', uid)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile
      }
      return null
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(this.auth)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  getCurrentUser(): FirebaseUser | null {
    return this.auth.currentUser
  }

  onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(this.auth, callback)
  }
}

// Export singleton instance
export const firebaseAuthService = new FirebaseAuthService() 
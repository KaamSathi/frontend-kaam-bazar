import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  Timestamp,
  Query,
  CollectionReference
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export interface Job {
  id?: string
  title: string
  description: string
  category: 'construction' | 'delivery' | 'cleaning' | 'electrical' | 'plumbing' | 'carpentry' | 'painting' | 'other'
  location: string
  hourlyRate: number
  duration: 'hourly' | 'daily' | 'weekly' | 'monthly'
  employerId: string
  employerName: string
  status: 'open' | 'in-progress' | 'completed' | 'cancelled'
  skills?: string[]
  experience?: string
  createdAt: Date
  updatedAt: Date
  applications?: JobApplication[]
}

export interface JobApplication {
  id?: string
  jobId: string
  workerId: string
  workerName: string
  workerPhone: string
  status: 'pending' | 'accepted' | 'rejected' | 'completed'
  message?: string
  appliedAt: Date
  updatedAt: Date
}

class FirebaseJobsService {
  // Create a new job
  async createJob(jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>): Promise<{ success: boolean; jobId?: string; error?: string }> {
    try {
      const job = {
        ...jobData,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      const docRef = await addDoc(collection(db, 'jobs'), job)
      return { success: true, jobId: docRef.id }
    } catch (error: any) {
      console.error('Error creating job:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to create job' 
      }
    }
  }

  // Get all jobs with pagination
  async getJobs(
    filters?: {
      category?: string
      location?: string
      status?: string
      minRate?: number
      maxRate?: number
    },
    pageSize: number = 10,
    lastDoc?: any
  ): Promise<{ success: boolean; jobs?: Job[]; lastDoc?: any; error?: string }> {
    try {
      let q: Query = collection(db, 'jobs')

      // Apply filters
      if (filters?.category) {
        q = query(q, where('category', '==', filters.category))
      }
      if (filters?.location) {
        q = query(q, where('location', '==', filters.location))
      }
      if (filters?.status) {
        q = query(q, where('status', '==', filters.status))
      }
      if (filters?.minRate) {
        q = query(q, where('hourlyRate', '>=', filters.minRate))
      }
      if (filters?.maxRate) {
        q = query(q, where('hourlyRate', '<=', filters.maxRate))
      }

      // Order by creation date
      q = query(q, orderBy('createdAt', 'desc'))

      // Apply pagination
      if (lastDoc) {
        q = query(q, startAfter(lastDoc))
      }
      q = query(q, limit(pageSize))

      const snapshot = await getDocs(q)
      const jobs: Job[] = []

      snapshot.forEach((doc) => {
        jobs.push({ id: doc.id, ...doc.data() } as Job)
      })

      const lastVisible = snapshot.docs[snapshot.docs.length - 1]

      return { 
        success: true, 
        jobs, 
        lastDoc: lastVisible 
      }
    } catch (error: any) {
      console.error('Error getting jobs:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to get jobs' 
      }
    }
  }

  // Get job by ID
  async getJobById(jobId: string): Promise<{ success: boolean; job?: Job; error?: string }> {
    try {
      const docRef = doc(db, 'jobs', jobId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const job = { id: docSnap.id, ...docSnap.data() } as Job
        return { success: true, job }
      } else {
        return { success: false, error: 'Job not found' }
      }
    } catch (error: any) {
      console.error('Error getting job:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to get job' 
      }
    }
  }

  // Update job
  async updateJob(jobId: string, updates: Partial<Job>): Promise<{ success: boolean; error?: string }> {
    try {
      await updateDoc(doc(db, 'jobs', jobId), {
        ...updates,
        updatedAt: new Date()
      })
      return { success: true }
    } catch (error: any) {
      console.error('Error updating job:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to update job' 
      }
    }
  }

  // Delete job
  async deleteJob(jobId: string): Promise<{ success: boolean; error?: string }> {
    try {
      await deleteDoc(doc(db, 'jobs', jobId))
      return { success: true }
    } catch (error: any) {
      console.error('Error deleting job:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to delete job' 
      }
    }
  }

  // Apply for a job
  async applyForJob(application: Omit<JobApplication, 'id' | 'appliedAt' | 'updatedAt'>): Promise<{ success: boolean; applicationId?: string; error?: string }> {
    try {
      const applicationData = {
        ...application,
        appliedAt: new Date(),
        updatedAt: new Date()
      }

      const docRef = await addDoc(collection(db, 'applications'), applicationData)
      return { success: true, applicationId: docRef.id }
    } catch (error: any) {
      console.error('Error applying for job:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to apply for job' 
      }
    }
  }

  // Get applications for a job
  async getJobApplications(jobId: string): Promise<{ success: boolean; applications?: JobApplication[]; error?: string }> {
    try {
      const q = query(
        collection(db, 'applications'),
        where('jobId', '==', jobId),
        orderBy('appliedAt', 'desc')
      )

      const snapshot = await getDocs(q)
      const applications: JobApplication[] = []

      snapshot.forEach((doc) => {
        applications.push({ id: doc.id, ...doc.data() } as JobApplication)
      })

      return { success: true, applications }
    } catch (error: any) {
      console.error('Error getting job applications:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to get applications' 
      }
    }
  }

  // Update application status
  async updateApplicationStatus(applicationId: string, status: JobApplication['status']): Promise<{ success: boolean; error?: string }> {
    try {
      await updateDoc(doc(db, 'applications', applicationId), {
        status,
        updatedAt: new Date()
      })
      return { success: true }
    } catch (error: any) {
      console.error('Error updating application status:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to update application status' 
      }
    }
  }

  // Get jobs by employer
  async getJobsByEmployer(employerId: string): Promise<{ success: boolean; jobs?: Job[]; error?: string }> {
    try {
      const q = query(
        collection(db, 'jobs'),
        where('employerId', '==', employerId),
        orderBy('createdAt', 'desc')
      )

      const snapshot = await getDocs(q)
      const jobs: Job[] = []

      snapshot.forEach((doc) => {
        jobs.push({ id: doc.id, ...doc.data() } as Job)
      })

      return { success: true, jobs }
    } catch (error: any) {
      console.error('Error getting employer jobs:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to get employer jobs' 
      }
    }
  }

  // Get applications by worker
  async getApplicationsByWorker(workerId: string): Promise<{ success: boolean; applications?: JobApplication[]; error?: string }> {
    try {
      const q = query(
        collection(db, 'applications'),
        where('workerId', '==', workerId),
        orderBy('appliedAt', 'desc')
      )

      const snapshot = await getDocs(q)
      const applications: JobApplication[] = []

      snapshot.forEach((doc) => {
        applications.push({ id: doc.id, ...doc.data() } as JobApplication)
      })

      return { success: true, applications }
    } catch (error: any) {
      console.error('Error getting worker applications:', error)
      return { 
        success: false, 
        error: error.message || 'Failed to get worker applications' 
      }
    }
  }
}

export const firebaseJobsService = new FirebaseJobsService() 
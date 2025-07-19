import { firebaseJobsService, Job, JobApplication } from './firebase-jobs'

// Re-export Firebase job types for compatibility
export type { Job, JobApplication }

// Job categories
export const JOB_CATEGORIES = [
  { value: 'construction', label: 'Construction' },
  { value: 'delivery', label: 'Delivery' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'painting', label: 'Painting' },
  { value: 'other', label: 'Other' },
] as const

// Job duration options
export const JOB_DURATIONS = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
] as const

// Job status options
export const JOB_STATUSES = [
  { value: 'open', label: 'Open' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
] as const

// Application status options
export const APPLICATION_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'completed', label: 'Completed' },
] as const

// Jobs service using Firebase
export const jobsService = {
  // Get all jobs with filters
  async getJobs(filters?: {
    category?: string
    location?: string
    status?: string
    minRate?: number
    maxRate?: number
  }, pageSize: number = 10, lastDoc?: any) {
    return firebaseJobsService.getJobs(filters, pageSize, lastDoc)
  },

  // Get job by ID
  async getJobById(jobId: string) {
    return firebaseJobsService.getJobById(jobId)
  },

  // Create a new job
  async createJob(jobData: Omit<Job, 'id' | 'createdAt' | 'updatedAt'>) {
    return firebaseJobsService.createJob(jobData)
  },

  // Update a job
  async updateJob(jobId: string, updates: Partial<Job>) {
    return firebaseJobsService.updateJob(jobId, updates)
  },

  // Delete a job
  async deleteJob(jobId: string) {
    return firebaseJobsService.deleteJob(jobId)
  },

  // Apply for a job
  async applyForJob(application: Omit<JobApplication, 'id' | 'appliedAt' | 'updatedAt'>) {
    return firebaseJobsService.applyForJob(application)
  },

  // Get applications for a job
  async getJobApplications(jobId: string) {
    return firebaseJobsService.getJobApplications(jobId)
  },

  // Update application status
  async updateApplicationStatus(applicationId: string, status: JobApplication['status']) {
    return firebaseJobsService.updateApplicationStatus(applicationId, status)
  },

  // Get jobs by employer
  async getJobsByEmployer(employerId: string) {
    return firebaseJobsService.getJobsByEmployer(employerId)
  },

  // Get applications by worker
  async getApplicationsByWorker(workerId: string) {
    return firebaseJobsService.getApplicationsByWorker(workerId)
  },

  // Helper function to format job data for display
  formatJobForDisplay(job: Job) {
    return {
      ...job,
      formattedRate: `₹${job.hourlyRate}/hour`,
      formattedDate: new Date(job.createdAt).toLocaleDateString('en-IN'),
      categoryLabel: JOB_CATEGORIES.find(cat => cat.value === job.category)?.label || job.category,
      durationLabel: JOB_DURATIONS.find(dur => dur.value === job.duration)?.label || job.duration,
      statusLabel: JOB_STATUSES.find(status => status.value === job.status)?.label || job.status,
    }
  },

  // Helper function to validate job data
  validateJobData(jobData: Partial<Job>) {
    const errors: string[] = []

    if (!jobData.title?.trim()) {
      errors.push('Job title is required')
    }

    if (!jobData.description?.trim()) {
      errors.push('Job description is required')
    }

    if (!jobData.location?.trim()) {
      errors.push('Location is required')
    }

    if (!jobData.hourlyRate || jobData.hourlyRate <= 0) {
      errors.push('Valid hourly rate is required')
    }

    if (!jobData.category) {
      errors.push('Job category is required')
    }

    if (!jobData.duration) {
      errors.push('Job duration is required')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
} 
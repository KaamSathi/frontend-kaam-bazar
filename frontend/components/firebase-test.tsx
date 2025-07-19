"use client"

import { useState, useEffect } from 'react'
import { auth, db, storage } from '@/lib/firebase'
import { firebaseAuthService } from '@/services/firebase-auth'
import { firebaseJobsService } from '@/services/firebase-jobs'
import { firebaseStorageService } from '@/services/firebase-storage'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/use-toast'

export default function FirebaseTest() {
  const [testResults, setTestResults] = useState<{
    connection: boolean
    auth: boolean
    firestore: boolean
    storage: boolean
  }>({
    connection: false,
    auth: false,
    firestore: false,
    storage: false
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    testFirebaseConnection()
  }, [])

  const testFirebaseConnection = async () => {
    setLoading(true)
    
    try {
      // Test 1: Basic Firebase connection
      if (auth && db && storage) {
        setTestResults(prev => ({ ...prev, connection: true }))
        console.log('✅ Firebase connection successful')
      }

      // Test 2: Firestore connection
      try {
        const testDoc = await firebaseJobsService.getJobs({}, 1)
        if (testDoc.success) {
          setTestResults(prev => ({ ...prev, firestore: true }))
          console.log('✅ Firestore connection successful')
        }
      } catch (error: any) {
        console.error('❌ Firestore test failed:', error)
      }

      // Test 3: Storage connection
      try {
        const testUrl = await firebaseStorageService.getFileURL('test/test.txt')
        // This will fail but we can catch the error to verify storage is connected
        setTestResults(prev => ({ ...prev, storage: true }))
        console.log('✅ Storage connection successful')
      } catch (error: any) {
        // Storage connection is working if we get a proper error
        if (error.code === 'storage/object-not-found') {
          setTestResults(prev => ({ ...prev, storage: true }))
          console.log('✅ Storage connection successful')
        }
      }

      // Test 4: Auth connection
      try {
        // Test if auth is properly initialized
        if (auth.currentUser === null) {
          setTestResults(prev => ({ ...prev, auth: true }))
          console.log('✅ Auth connection successful')
        }
      } catch (error: any) {
        console.error('❌ Auth test failed:', error)
      }

    } catch (error: any) {
      console.error('❌ Firebase connection test failed:', error)
    } finally {
      setLoading(false)
    }
  }

  const testPhoneAuth = async () => {
    try {
      // Initialize reCAPTCHA
      firebaseAuthService.initRecaptcha('recaptcha-container')
      
      toast({
        title: "ReCAPTCHA Initialized",
        description: "Ready to test phone authentication",
      })
    } catch (error: any) {
      toast({
        title: "ReCAPTCHA Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const testJobCreation = async () => {
    try {
      const testJob = {
        title: "Test Job",
        description: "This is a test job",
        category: "construction" as const,
        location: "Mumbai",
        hourlyRate: 500,
        duration: "daily" as const,
        employerId: "test-employer",
        employerName: "Test Employer",
        status: "open" as const,
      }

      const result = await firebaseJobsService.createJob(testJob)
      
      if (result.success) {
        toast({
          title: "Job Creation Test",
          description: "Test job created successfully!",
        })
        console.log('✅ Job creation test successful')
      } else {
        toast({
          title: "Job Creation Test",
          description: result.error || "Failed to create test job",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Job Creation Test",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Firebase Connection Test</h2>
      
      {/* Test Results */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-4 h-4 rounded-full ${testResults.connection ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>Firebase Connection: {testResults.connection ? '✅ Connected' : '❌ Failed'}</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`w-4 h-4 rounded-full ${testResults.auth ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>Authentication: {testResults.auth ? '✅ Connected' : '❌ Failed'}</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`w-4 h-4 rounded-full ${testResults.firestore ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>Firestore Database: {testResults.firestore ? '✅ Connected' : '❌ Failed'}</span>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className={`w-4 h-4 rounded-full ${testResults.storage ? 'bg-green-500' : 'bg-red-500'}`}></div>
          <span>Storage: {testResults.storage ? '✅ Connected' : '❌ Failed'}</span>
        </div>
      </div>

      {/* Test Buttons */}
      <div className="space-y-3">
        <Button 
          onClick={testPhoneAuth}
          disabled={loading}
          className="w-full"
        >
          Test Phone Authentication
        </Button>
        
        <Button 
          onClick={testJobCreation}
          disabled={loading}
          className="w-full"
          variant="outline"
        >
          Test Job Creation
        </Button>
        
        <Button 
          onClick={testFirebaseConnection}
          disabled={loading}
          className="w-full"
          variant="outline"
        >
          {loading ? 'Testing...' : 'Re-run Tests'}
        </Button>
      </div>

      {/* ReCAPTCHA Container */}
      <div id="recaptcha-container" className="mt-4"></div>

      {/* Environment Variables Check */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Environment Variables Status:</h3>
        <div className="text-sm space-y-1">
          <div>API Key: {process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing'}</div>
          <div>Auth Domain: {process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing'}</div>
          <div>Project ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing'}</div>
          <div>Storage Bucket: {process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ? '✅ Set' : '❌ Missing'}</div>
        </div>
      </div>
    </div>
  )
} 
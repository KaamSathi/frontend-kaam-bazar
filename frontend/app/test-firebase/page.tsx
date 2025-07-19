import FirebaseTest from '@/components/firebase-test'

export default function TestFirebasePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Firebase Integration Test</h1>
          <p className="text-gray-600">Testing all Firebase services for KaamBazar</p>
        </div>
        
        <FirebaseTest />
      </div>
    </div>
  )
} 
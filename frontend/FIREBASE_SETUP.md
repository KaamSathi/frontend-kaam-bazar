# Firebase Setup Guide for KaamBazar

This guide will help you set up Firebase as the backend for your KaamBazar project.

## 🚀 Quick Start

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `kaambazar`
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Firebase Services

#### Authentication
1. Go to Authentication → Sign-in method
2. Enable "Phone" provider
3. Add your test phone numbers (for development)

#### Firestore Database
1. Go to Firestore Database
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (choose closest to your users)

#### Storage
1. Go to Storage
2. Click "Get started"
3. Choose "Start in test mode" (for development)
4. Select a location (same as Firestore)

### 3. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" → Web app
4. Register app with name "KaamBazar Web"
5. Copy the config object

### 4. Set Environment Variables

Create a `.env.local` file in your frontend directory:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 5. Firestore Security Rules

Go to Firestore → Rules and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Jobs - anyone can read, only employers can create/update their own
    match /jobs/{jobId} {
      allow read: if true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
        request.auth.uid == resource.data.employerId;
    }
    
    // Applications - users can read their own applications
    match /applications/{applicationId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.workerId || 
         request.auth.uid == resource.data.employerId);
      allow create: if request.auth != null;
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.workerId || 
         request.auth.uid == resource.data.employerId);
    }
    
    // Chats - participants can read/write
    match /chats/{chatId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.employerId || 
         request.auth.uid == resource.data.workerId);
    }
    
    // Messages - chat participants can read/write
    match /messages/{messageId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.senderId || 
         request.auth.uid == resource.data.chatId);
    }
  }
}
```

### 6. Storage Security Rules

Go to Storage → Rules and replace with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile images - users can upload their own
    match /profile-images/{userId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Job images - job creator can upload
    match /job-images/{jobId}/{fileName} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Documents - users can upload their own
    match /documents/{userId}/{type}/{fileName} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 📁 Firebase Collections Structure

### Users Collection
```javascript
{
  uid: "string",
  phoneNumber: "string",
  name: "string",
  role: "employer" | "worker",
  profile: {
    avatar: "string",
    skills: ["string"],
    experience: "string",
    location: "string",
    hourlyRate: number
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Jobs Collection
```javascript
{
  id: "string",
  title: "string",
  description: "string",
  category: "construction" | "delivery" | "cleaning" | "electrical" | "plumbing" | "carpentry" | "painting" | "other",
  location: "string",
  hourlyRate: number,
  duration: "hourly" | "daily" | "weekly" | "monthly",
  employerId: "string",
  employerName: "string",
  status: "open" | "in-progress" | "completed" | "cancelled",
  skills: ["string"],
  experience: "string",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Applications Collection
```javascript
{
  id: "string",
  jobId: "string",
  workerId: "string",
  workerName: "string",
  workerPhone: "string",
  status: "pending" | "accepted" | "rejected" | "completed",
  message: "string",
  appliedAt: timestamp,
  updatedAt: timestamp
}
```

### Chats Collection
```javascript
{
  id: "string",
  jobId: "string",
  employerId: "string",
  workerId: "string",
  employerName: "string",
  workerName: "string",
  lastMessage: "string",
  lastMessageTime: timestamp,
  unreadCount: number,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

### Messages Collection
```javascript
{
  id: "string",
  chatId: "string",
  senderId: "string",
  senderName: "string",
  content: "string",
  timestamp: timestamp,
  read: boolean,
  type: "text" | "image" | "file"
}
```

## 🔧 Development Setup

### 1. Install Firebase CLI
```bash
npm install -g firebase-tools
```

### 2. Login to Firebase
```bash
firebase login
```

### 3. Initialize Firebase in your project
```bash
firebase init
```

Select:
- Firestore
- Storage
- Hosting
- Functions (optional)

### 4. Deploy Security Rules
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```

## 🚀 Production Deployment

### 1. Update Security Rules
Before going to production, update the security rules to be more restrictive.

### 2. Enable Authentication Methods
- Enable phone authentication
- Set up proper phone number verification

### 3. Set Up Monitoring
- Enable Firebase Analytics
- Set up error reporting
- Configure performance monitoring

### 4. Deploy to Firebase Hosting
```bash
npm run build
firebase deploy
```

## 📊 Firebase Pricing

Firebase has a generous free tier:

### Free Tier Limits:
- **Authentication**: 10,000 users/month
- **Firestore**: 1GB storage, 50,000 reads/day, 20,000 writes/day
- **Storage**: 5GB storage, 1GB downloads/day
- **Hosting**: 10GB storage, 360MB/day transfer

### Paid Plans:
- **Blaze Plan**: Pay-as-you-go, scales automatically
- **Enterprise**: Custom pricing for large scale

## 🔒 Security Best Practices

1. **Always validate data** on the client and server
2. **Use security rules** to control access
3. **Implement rate limiting** for sensitive operations
4. **Monitor usage** and set up alerts
5. **Regular backups** of your data
6. **Test security rules** thoroughly

## 🐛 Common Issues

### 1. CORS Errors
- Make sure your domain is added to authorized domains in Firebase Console

### 2. Authentication Issues
- Check if phone authentication is enabled
- Verify test phone numbers are added

### 3. Storage Upload Failures
- Check storage security rules
- Verify file size limits

### 4. Firestore Permission Denied
- Review security rules
- Check if user is authenticated
- Verify user has proper permissions

## 📞 Support

- **Firebase Documentation**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **Firebase Console**: [console.firebase.google.com](https://console.firebase.google.com)
- **Stack Overflow**: Tag questions with `firebase`

## 🎯 Next Steps

1. Set up your Firebase project
2. Configure environment variables
3. Test authentication flow
4. Deploy security rules
5. Test file uploads
6. Set up monitoring
7. Deploy to production

Your KaamBazar app is now ready to use Firebase as a powerful, scalable backend! 🚀 
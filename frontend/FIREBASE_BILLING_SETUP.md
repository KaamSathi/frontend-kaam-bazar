# Firebase Billing Setup & Payment Integration Guide

## 🔥 Firebase Billing Setup

### **Step 1: Enable Firebase Billing**

1. **Go to Firebase Console**
   - Visit [Firebase Console](https://console.firebase.google.com/)
   - Select your project (kaambazar)

2. **Navigate to Billing**
   - Click on the gear icon ⚙️ (Project Settings)
   - Go to "Usage and billing" tab
   - Click "Modify plan"

3. **Choose Blaze Plan**
   - Select "Blaze (Pay as you go)" plan
   - This enables phone authentication and other paid features

4. **Add Payment Method**
   - Add a credit/debit card
   - Set up billing account
   - Configure spending limits

### **Step 2: Configure Spending Limits**

```bash
# Recommended spending limits for development:
- Daily limit: $5
- Monthly limit: $50
- Alert threshold: $10
```

### **Step 3: Enable Required Services**

1. **Authentication**
   - Go to Authentication → Sign-in method
   - Enable "Phone" provider
   - Add your app's domain to authorized domains

2. **Firestore Database**
   - Go to Firestore Database
   - Create database in production mode
   - Choose location (recommend: asia-south1 for India)

3. **Storage**
   - Go to Storage
   - Create storage bucket
   - Set up security rules

## 💳 Payment Integration Options

### **Option 1: Firebase Extensions (Recommended)**

#### **Stripe Extension**
```bash
# Install Stripe extension
firebase ext:install firebase/firestore-stripe-payments

# Configure in firebase.json
{
  "extensions": {
    "firestore-stripe-payments": {
      "stripe.secret_key": "sk_test_...",
      "stripe.webhook_secret": "whsec_..."
    }
  }
}
```

#### **PayPal Extension**
```bash
# Install PayPal extension
firebase ext:install firebase/firestore-paypal-payments
```

### **Option 2: Direct Integration**

#### **Stripe Integration**
```typescript
// services/stripe-payments.ts
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export const createPaymentIntent = async (amount: number) => {
  const response = await fetch('/api/create-payment-intent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount })
  })
  return response.json()
}
```

#### **Razorpay Integration (India)**
```typescript
// services/razorpay-payments.ts
declare global {
  interface Window {
    Razorpay: any
  }
}

export const createRazorpayOrder = async (amount: number) => {
  const response = await fetch('/api/create-razorpay-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ amount })
  })
  return response.json()
}
```

## 🚀 Implementation Steps

### **Step 1: Environment Variables**

```env
# .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Payment Gateway Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

### **Step 2: Payment Service Implementation**

```typescript
// services/payments.ts
export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: string
}

export class PaymentService {
  // Stripe Payment
  async createStripePayment(amount: number): Promise<PaymentIntent> {
    const response = await fetch('/api/stripe/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    })
    return response.json()
  }

  // Razorpay Payment
  async createRazorpayPayment(amount: number): Promise<PaymentIntent> {
    const response = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount })
    })
    return response.json()
  }

  // Verify Payment
  async verifyPayment(paymentId: string, provider: 'stripe' | 'razorpay'): Promise<boolean> {
    const response = await fetch(`/api/${provider}/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId })
    })
    const result = await response.json()
    return result.verified
  }
}
```

### **Step 3: API Routes**

```typescript
// app/api/stripe/create-payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { amount } = await request.json()
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'inr',
      automatic_payment_methods: {
        enabled: true,
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error) {
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 })
  }
}
```

```typescript
// app/api/razorpay/create-order/route.ts
import { NextRequest, NextResponse } from 'next/server'
import Razorpay from 'razorpay'

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function POST(request: NextRequest) {
  try {
    const { amount } = await request.json()
    
    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `order_${Date.now()}`,
    })

    return NextResponse.json({ orderId: order.id })
  } catch (error) {
    return NextResponse.json({ error: 'Payment failed' }, { status: 500 })
  }
}
```

### **Step 4: Payment Component**

```typescript
// components/payment-modal.tsx
import { useState } from 'react'
import { PaymentService } from '@/services/payments'

interface PaymentModalProps {
  amount: number
  onSuccess: (paymentId: string) => void
  onCancel: () => void
}

export function PaymentModal({ amount, onSuccess, onCancel }: PaymentModalProps) {
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'razorpay'>('razorpay')

  const handlePayment = async () => {
    setLoading(true)
    try {
      const paymentService = new PaymentService()
      
      if (paymentMethod === 'stripe') {
        const payment = await paymentService.createStripePayment(amount)
        // Handle Stripe payment flow
      } else {
        const payment = await paymentService.createRazorpayPayment(amount)
        // Handle Razorpay payment flow
      }
      
      onSuccess('payment_id')
    } catch (error) {
      console.error('Payment failed:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <h3 className="text-lg font-semibold mb-4">Complete Payment</h3>
        <p className="text-gray-600 mb-4">Amount: ₹{amount}</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Payment Method</label>
            <select 
              value={paymentMethod} 
              onChange={(e) => setPaymentMethod(e.target.value as 'stripe' | 'razorpay')}
              className="w-full p-2 border rounded"
            >
              <option value="razorpay">Razorpay (India)</option>
              <option value="stripe">Stripe (International)</option>
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handlePayment}
              disabled={loading}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Pay Now'}
            </button>
            <button
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

## 💰 Pricing & Costs

### **Firebase Costs (Blaze Plan)**
- **Authentication**: $0.01 per verification
- **Firestore**: $0.18 per GB/month + $0.06 per 100K reads
- **Storage**: $0.026 per GB/month + $0.004 per GB downloaded
- **Functions**: $0.40 per million invocations

### **Payment Gateway Costs**
- **Stripe**: 2.9% + ₹3 per successful transaction
- **Razorpay**: 2% + ₹3 per successful transaction

### **Estimated Monthly Costs (1000 users)**
- Firebase: $5-15/month
- Payment processing: $50-100/month
- **Total**: $55-115/month

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit API keys to git
   - Use different keys for development/production

2. **Payment Verification**
   - Always verify payments server-side
   - Use webhooks for payment status updates

3. **Firebase Security Rules**
   ```javascript
   // firestore.rules
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /payments/{paymentId} {
         allow read, write: if request.auth != null && 
           request.auth.uid == resource.data.userId;
       }
     }
   }
   ```

## 🚀 Deployment Checklist

- [ ] Enable Firebase billing
- [ ] Configure payment gateway accounts
- [ ] Set up environment variables
- [ ] Test payment flows
- [ ] Configure webhooks
- [ ] Set up monitoring and alerts
- [ ] Test in production environment

## 📞 Support

For Firebase billing issues:
- [Firebase Support](https://firebase.google.com/support)
- [Firebase Community](https://firebase.google.com/community)

For payment integration:
- [Stripe Documentation](https://stripe.com/docs)
- [Razorpay Documentation](https://razorpay.com/docs) 
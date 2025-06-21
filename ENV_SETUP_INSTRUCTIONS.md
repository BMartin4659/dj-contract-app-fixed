# Environment Setup Instructions

To properly configure your application, you need to create a `.env.local` file in the root of your project with the following variables:

## Step 1: Create the .env.local File
Create a new file named `.env.local` in the root directory of your project (C:\Users\B.Martin\dj-contract-app).

## Step 2: Copy and Paste the Following Content

```
# DJ Contract App Environment Configuration

# Firebase Configuration (REQUIRED)
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID

# Stripe Configuration (REQUIRED)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=YOUR_STRIPE_PUBLISHABLE_KEY
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET=YOUR_STRIPE_WEBHOOK_SECRET

# Stripe Subscription Price IDs (REQUIRED for subscriptions)
STRIPE_STANDARD_PRICE_ID=YOUR_STRIPE_STANDARD_PRICE_ID
STRIPE_PREMIUM_PRICE_ID=YOUR_STRIPE_PREMIUM_PRICE_ID

# PayPal Subscription URLs (OPTIONAL)
NEXT_PUBLIC_PAYPAL_STANDARD_URL=YOUR_PAYPAL_STANDARD_SUBSCRIPTION_URL
NEXT_PUBLIC_PAYPAL_PREMIUM_URL=YOUR_PAYPAL_PREMIUM_SUBSCRIPTION_URL

# Google Maps API (OPTIONAL - Already set in app/page.js)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyC8PCjGiQZm9PQE5YeRjU8CgTmrHQdUFyc

# App Base URL (REQUIRED for production)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

## Step 3: Replace the Placeholder Values

1. **Firebase Configuration**:
   - Replace all Firebase placeholder values with your actual Firebase configuration
   - These can be found in your Firebase console under Project Settings > General > Your apps > SDK setup and configuration

2. **Stripe Configuration**:
   - Replace the Stripe placeholder values with your actual Stripe API keys
   - These can be found in your Stripe Dashboard under Developers > API keys
   - **Webhook Secret**: Create a webhook endpoint in Stripe Dashboard and copy the signing secret
   - **Price IDs**: Create subscription products in Stripe Dashboard and copy the price IDs for Standard ($10/month) and Premium ($15/month) plans

3. **PayPal Configuration** (Optional):
   - Create subscription plans in PayPal Developer Dashboard
   - Replace with your actual PayPal subscription URLs

4. **Base URL**:
   - For local development: `http://localhost:3000`
   - For production: Your actual domain (e.g., `https://your-domain.com`)

## Step 4: Save the File and Restart Your Application

After creating and configuring your `.env.local` file, restart your development server to apply the changes.

## Stripe Setup Instructions

### Creating Subscription Products in Stripe:

1. **Go to Stripe Dashboard** → Products
2. **Create Standard Plan**:
   - Name: "DJ Contract App - Standard Plan"
   - Price: $10.00 USD/month
   - Copy the Price ID (starts with `price_`) to `STRIPE_STANDARD_PRICE_ID`
3. **Create Premium Plan**:
   - Name: "DJ Contract App - Premium Plan"  
   - Price: $15.00 USD/month
   - Copy the Price ID (starts with `price_`) to `STRIPE_PREMIUM_PRICE_ID`

### Setting up Webhooks:

1. **Go to Stripe Dashboard** → Developers → Webhooks
2. **Add endpoint**: `https://your-domain.com/api/stripe-webhook`
3. **Select events**:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. **Copy the Signing Secret** to `STRIPE_WEBHOOK_SECRET`

## Important Notes

1. The `.env.local` file is automatically excluded from Git to protect your sensitive API keys
2. When deploying to Vercel, you need to add these environment variables in the Vercel dashboard
3. Make sure you don't share your API keys publicly

## Vercel Deployment

For Vercel deployment instructions, please refer to the VERCEL_DEPLOYMENT_GUIDE.md file. 
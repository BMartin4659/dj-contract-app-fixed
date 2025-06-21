# 🚨 URGENT: Fix Stripe Payment Routing Error

## Current Error:
```
Error: Missing Stripe price ID for premium plan. Please configure STRIPE_PREMIUM_PRICE_ID in environment variables.
```

## 🛠️ Quick Fix (5 minutes):

### Step 1: Create Stripe Products

1. **Open Stripe Dashboard**: https://dashboard.stripe.com/products
2. **Create Standard Plan**:
   - Click "Add Product"
   - Product name: `DJ Contract App - Standard Plan`
   - Price: `$10.00` USD
   - Billing: `Recurring` → `Monthly`
   - Click "Save product"
   - **📋 COPY THE PRICE ID** (looks like: `price_1AbCdEfGhIjKlMnO`)

3. **Create Premium Plan**:
   - Click "Add Product"
   - Product name: `DJ Contract App - Premium Plan`
   - Price: `$15.00` USD
   - Billing: `Recurring` → `Monthly`
   - Click "Save product"
   - **📋 COPY THE PRICE ID** (looks like: `price_2XyZaBcDeFgHiJkL`)

### Step 2: Update Environment File

**Open your `.env.local` file and replace these lines:**

```bash
# REPLACE THESE PLACEHOLDER VALUES:
STRIPE_STANDARD_PRICE_ID=price_1234567890_REPLACE_WITH_ACTUAL_ID
STRIPE_PREMIUM_PRICE_ID=price_0987654321_REPLACE_WITH_ACTUAL_ID

# WITH YOUR ACTUAL PRICE IDs:
STRIPE_STANDARD_PRICE_ID=price_your_actual_standard_id_here
STRIPE_PREMIUM_PRICE_ID=price_your_actual_premium_id_here
```

### Step 3: Restart Development Server

```bash
# Stop current server (Ctrl+C)
# Then restart:
npm run dev
```

## 🧪 Test the Fix:

1. Go to: http://localhost:3000/subscription
2. Enter your email
3. Click "Subscribe with Stripe" for any plan
4. Should redirect to Stripe checkout (instead of showing error)

## 🎯 Expected Result:

- ✅ No more "Missing Stripe price ID" errors
- ✅ Subscription buttons work correctly
- ✅ Payment routing functions properly
- ✅ Users can upgrade from free to paid plans

## 📞 Need Help?

If you encounter issues:

1. **Check Price IDs**: Make sure they start with `price_` and are from the correct Stripe account
2. **Verify Environment**: Run `node scripts/verify-payment-routing.js`
3. **Check Console**: Look for any remaining error messages in browser console

## 🔄 Alternative: Temporary Test Mode

If you want to test other features while setting up Stripe:

1. Comment out the price ID validation temporarily
2. Or use Stripe's test price IDs (if available in your test environment)

---

**Priority**: 🔥 HIGH - Required for subscription functionality  
**Time**: ⏱️ 5 minutes  
**Difficulty**: 🟢 Easy 
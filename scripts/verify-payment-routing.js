#!/usr/bin/env node

/**
 * Payment Routing Verification Script
 * 
 * This script verifies that all payment routing configurations are properly set up
 * for the DJ Contract App subscription system.
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 DJ Contract App - Payment Routing Verification\n');

// Check for environment file
const envPath = path.join(process.cwd(), '.env.local');
const envExists = fs.existsSync(envPath);

if (!envExists) {
  console.log('❌ .env.local file not found');
  console.log('📝 Please create .env.local file with required environment variables');
  console.log('📖 See ENV_SETUP_INSTRUCTIONS.md for details\n');
  process.exit(1);
}

// Load environment variables
require('dotenv').config({ path: envPath });

console.log('✅ .env.local file found\n');

// Define required environment variables
const requiredVars = {
  'Firebase Configuration': [
    'NEXT_PUBLIC_FIREBASE_API_KEY',
    'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'NEXT_PUBLIC_FIREBASE_APP_ID'
  ],
  'Stripe Basic Configuration': [
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET'
  ],
  'Stripe Subscription Configuration': [
    'STRIPE_STANDARD_PRICE_ID',
    'STRIPE_PREMIUM_PRICE_ID'
  ],
  'PayPal Configuration (Optional)': [
    'NEXT_PUBLIC_PAYPAL_STANDARD_URL',
    'NEXT_PUBLIC_PAYPAL_PREMIUM_URL'
  ],
  'App Configuration': [
    'NEXT_PUBLIC_BASE_URL'
  ]
};

// Check environment variables
let allConfigured = true;
const missingVars = [];

Object.entries(requiredVars).forEach(([category, vars]) => {
  console.log(`📋 ${category}:`);
  
  vars.forEach(varName => {
    const value = process.env[varName];
    const isOptional = category.includes('Optional');
    
    if (value) {
      // Mask sensitive values
      const maskedValue = varName.includes('SECRET') || varName.includes('PRIVATE') 
        ? `${value.substring(0, 8)}...` 
        : value.length > 50 
        ? `${value.substring(0, 20)}...` 
        : value;
      
      console.log(`  ✅ ${varName}: ${maskedValue}`);
    } else {
      if (isOptional) {
        console.log(`  ⚠️  ${varName}: Not set (optional)`);
      } else {
        console.log(`  ❌ ${varName}: Missing`);
        allConfigured = false;
        missingVars.push(varName);
      }
    }
  });
  
  console.log('');
});

// Payment routing validation
console.log('🔗 Payment Routing Validation:\n');

// Check Stripe configuration
const stripeConfigured = process.env.STRIPE_SECRET_KEY && 
                         process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY &&
                         process.env.STRIPE_STANDARD_PRICE_ID &&
                         process.env.STRIPE_PREMIUM_PRICE_ID;

if (stripeConfigured) {
  console.log('✅ Stripe subscription routing: Fully configured');
  console.log('   - Standard plan will route to Stripe with price ID');
  console.log('   - Premium plan will route to Stripe with price ID');
} else {
  console.log('❌ Stripe subscription routing: Incomplete configuration');
  console.log('   - Missing required Stripe environment variables');
}

// Check PayPal configuration
const paypalConfigured = process.env.NEXT_PUBLIC_PAYPAL_STANDARD_URL && 
                         process.env.NEXT_PUBLIC_PAYPAL_PREMIUM_URL;

if (paypalConfigured) {
  console.log('✅ PayPal subscription routing: Configured');
  console.log('   - Standard plan will route to PayPal subscription URL');
  console.log('   - Premium plan will route to PayPal subscription URL');
} else {
  console.log('⚠️  PayPal subscription routing: Not configured (optional)');
  console.log('   - PayPal buttons will show "not configured" message');
}

// Check webhook configuration
const webhookConfigured = process.env.STRIPE_WEBHOOK_SECRET;

if (webhookConfigured) {
  console.log('✅ Stripe webhook: Configured');
  console.log('   - Subscription events will be processed correctly');
} else {
  console.log('❌ Stripe webhook: Not configured');
  console.log('   - Subscription status updates may not work');
}

console.log('\n🎯 Routing Flow Summary:\n');

console.log('📱 Free Plan Users:');
console.log('   → Generate standard contract links');
console.log('   → Show upgrade prompts for premium features');
console.log('   → Route to /subscription page for upgrades');

console.log('\n💎 Premium Plan Users:');
console.log('   → Generate premium contract links');
console.log('   → Full access to custom fonts and styling');
console.log('   → Manage subscription via /subscription page');

console.log('\n💳 Payment Flow:');
console.log('   1. User clicks "Subscribe with Stripe"');
console.log('   2. API creates Stripe checkout session');
console.log('   3. User completes payment on Stripe');
console.log('   4. Stripe webhook updates user subscription');
console.log('   5. User redirected to /subscription/success');
console.log('   6. Success page routes to /dj/dashboard');

// Final summary
console.log('\n📊 Configuration Summary:\n');

if (allConfigured) {
  console.log('🎉 All required configurations are complete!');
  console.log('✅ Payment routing should work correctly');
} else {
  console.log('⚠️  Configuration incomplete');
  console.log('❌ Missing required environment variables:');
  missingVars.forEach(varName => {
    console.log(`   - ${varName}`);
  });
}

console.log('\n📚 Next Steps:');

if (!allConfigured) {
  console.log('1. 📝 Update .env.local with missing environment variables');
  console.log('2. 🔧 Set up Stripe products and webhooks (see ENV_SETUP_INSTRUCTIONS.md)');
  console.log('3. 🚀 Restart your development server');
  console.log('4. 🧪 Test subscription flow');
} else {
  console.log('1. 🧪 Test subscription flow with test cards');
  console.log('2. 🔍 Monitor webhook events in Stripe dashboard');
  console.log('3. 📈 Deploy to production with production environment variables');
}

console.log('\n🆘 Support:');
console.log('   - Documentation: ENV_SETUP_INSTRUCTIONS.md');
console.log('   - Stripe Test Cards: https://stripe.com/docs/testing');
console.log('   - Contact: support@djcontractapp.com');

console.log('\n✨ Verification complete!\n'); 
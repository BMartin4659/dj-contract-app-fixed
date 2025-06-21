import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc, getDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  console.log('Stripe webhook received');
  
  try {
    const sig = request.headers.get('stripe-signature');
    const rawBody = await request.text();

    if (!sig) {
      console.error('Missing Stripe signature');
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
      return NextResponse.json(
        { error: 'Webhook configuration error' },
        { status: 500 }
      );
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        rawBody, 
        sig, 
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json(
        { error: `Webhook Error: ${err.message}` },
        { status: 400 }
      );
    }

    console.log('Processing Stripe event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object);
        break;
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleCheckoutSessionCompleted(session) {
  console.log('Processing checkout session completed:', session.id);
  
  try {
    const djEmail = session.metadata?.djEmail;
    const plan = session.metadata?.plan;
    const subscriptionType = session.metadata?.subscriptionType;

    if (!djEmail) {
      console.error('Missing djEmail in session metadata');
      return;
    }

    if (subscriptionType === 'dj_plan') {
      // This is a subscription checkout
      const tier = plan || 'standard';
      
      await setDoc(doc(db, 'users', djEmail), {
        subscription: {
          tier: tier,
          status: 'active',
          provider: 'stripe',
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
      }, { merge: true });

      console.log(`Subscription activated for DJ: ${djEmail}, Plan: ${tier}`);
    } else {
      // This is a one-time payment - handle existing logic
      console.log('One-time payment completed for session:', session.id);
    }
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
  }
}

async function handleSubscriptionCreated(subscription) {
  console.log('Processing subscription created:', subscription.id);
  
  try {
    const customer = await stripe.customers.retrieve(subscription.customer);
    const djEmail = customer.email;
    
    if (!djEmail) {
      console.error('No email found for customer:', subscription.customer);
      return;
    }

    // Determine plan tier from price ID
    const priceId = subscription.items.data[0]?.price?.id;
    let tier = 'standard';
    
    if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
      tier = 'premium';
    }

    await setDoc(doc(db, 'users', djEmail), {
      subscription: {
        tier: tier,
        status: subscription.status,
        provider: 'stripe',
        stripeCustomerId: subscription.customer,
        stripeSubscriptionId: subscription.id,
        currentPeriodStart: subscription.current_period_start * 1000,
        currentPeriodEnd: subscription.current_period_end * 1000,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    }, { merge: true });

    console.log(`Subscription created for DJ: ${djEmail}, Plan: ${tier}`);
  } catch (error) {
    console.error('Error handling subscription created:', error);
  }
}

async function handleSubscriptionUpdated(subscription) {
  console.log('Processing subscription updated:', subscription.id);
  
  try {
    const customer = await stripe.customers.retrieve(subscription.customer);
    const djEmail = customer.email;
    
    if (!djEmail) {
      console.error('No email found for customer:', subscription.customer);
      return;
    }

    // Determine plan tier from price ID
    const priceId = subscription.items.data[0]?.price?.id;
    let tier = 'standard';
    
    if (priceId === process.env.STRIPE_PREMIUM_PRICE_ID) {
      tier = 'premium';
    }

    await updateDoc(doc(db, 'users', djEmail), {
      'subscription.tier': tier,
      'subscription.status': subscription.status,
      'subscription.currentPeriodStart': subscription.current_period_start * 1000,
      'subscription.currentPeriodEnd': subscription.current_period_end * 1000,
      'subscription.updatedAt': Date.now()
    });

    console.log(`Subscription updated for DJ: ${djEmail}, Status: ${subscription.status}`);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
  }
}

async function handleSubscriptionDeleted(subscription) {
  console.log('Processing subscription deleted:', subscription.id);
  
  try {
    const customer = await stripe.customers.retrieve(subscription.customer);
    const djEmail = customer.email;
    
    if (!djEmail) {
      console.error('No email found for customer:', subscription.customer);
      return;
    }

    await updateDoc(doc(db, 'users', djEmail), {
      'subscription.status': 'cancelled',
      'subscription.cancelledAt': Date.now(),
      'subscription.updatedAt': Date.now()
    });

    console.log(`Subscription cancelled for DJ: ${djEmail}`);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
  }
}

async function handleInvoicePaymentSucceeded(invoice) {
  console.log('Processing invoice payment succeeded:', invoice.id);
  
  try {
    const customer = await stripe.customers.retrieve(invoice.customer);
    const djEmail = customer.email;
    
    if (!djEmail) {
      console.error('No email found for customer:', invoice.customer);
      return;
    }

    await updateDoc(doc(db, 'users', djEmail), {
      'subscription.lastPaymentDate': Date.now(),
      'subscription.updatedAt': Date.now()
    });

    console.log(`Payment succeeded for DJ: ${djEmail}`);
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
  }
}

async function handleInvoicePaymentFailed(invoice) {
  console.log('Processing invoice payment failed:', invoice.id);
  
  try {
    const customer = await stripe.customers.retrieve(invoice.customer);
    const djEmail = customer.email;
    
    if (!djEmail) {
      console.error('No email found for customer:', invoice.customer);
      return;
    }

    await updateDoc(doc(db, 'users', djEmail), {
      'subscription.status': 'past_due',
      'subscription.lastFailedPayment': Date.now(),
      'subscription.updatedAt': Date.now()
    });

    console.log(`Payment failed for DJ: ${djEmail}`);
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
  }
} 
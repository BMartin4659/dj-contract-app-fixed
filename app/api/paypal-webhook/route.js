import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, setDoc, updateDoc } from 'firebase/firestore';

export async function POST(request) {
  console.log('PayPal webhook received');
  
  try {
    const body = await request.json();
    console.log('PayPal event type:', body.event_type);

    // Handle different PayPal event types
    switch (body.event_type) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await handleSubscriptionActivated(body);
        break;
        
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await handleSubscriptionCancelled(body);
        break;
        
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        await handleSubscriptionSuspended(body);
        break;
        
      case 'BILLING.SUBSCRIPTION.REACTIVATED':
        await handleSubscriptionReactivated(body);
        break;
        
      case 'PAYMENT.SALE.COMPLETED':
        await handlePaymentCompleted(body);
        break;
        
      case 'PAYMENT.SALE.DENIED':
        await handlePaymentFailed(body);
        break;
        
      default:
        console.log(`Unhandled PayPal event type: ${body.event_type}`);
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    console.error('Error processing PayPal webhook:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleSubscriptionActivated(body) {
  console.log('Processing PayPal subscription activated');
  
  try {
    const email = body.resource?.subscriber?.email_address;
    const planId = body.resource?.plan_id;
    const subscriptionId = body.resource?.id;

    if (!email) {
      console.error('No email found in PayPal subscription data');
      return;
    }

    // Determine tier based on plan ID
    let tier = 'standard';
    if (planId && planId.toLowerCase().includes('premium')) {
      tier = 'premium';
    }

    await setDoc(doc(db, 'users', email), {
      subscription: {
        tier: tier,
        status: 'active',
        provider: 'paypal',
        paypalSubscriptionId: subscriptionId,
        paypalPlanId: planId,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    }, { merge: true });

    console.log(`PayPal subscription activated for DJ: ${email}, Plan: ${tier}`);
  } catch (error) {
    console.error('Error handling PayPal subscription activated:', error);
  }
}

async function handleSubscriptionCancelled(body) {
  console.log('Processing PayPal subscription cancelled');
  
  try {
    const email = body.resource?.subscriber?.email_address;

    if (!email) {
      console.error('No email found in PayPal subscription data');
      return;
    }

    await updateDoc(doc(db, 'users', email), {
      'subscription.status': 'cancelled',
      'subscription.cancelledAt': Date.now(),
      'subscription.updatedAt': Date.now()
    });

    console.log(`PayPal subscription cancelled for DJ: ${email}`);
  } catch (error) {
    console.error('Error handling PayPal subscription cancelled:', error);
  }
}

async function handleSubscriptionSuspended(body) {
  console.log('Processing PayPal subscription suspended');
  
  try {
    const email = body.resource?.subscriber?.email_address;

    if (!email) {
      console.error('No email found in PayPal subscription data');
      return;
    }

    await updateDoc(doc(db, 'users', email), {
      'subscription.status': 'suspended',
      'subscription.suspendedAt': Date.now(),
      'subscription.updatedAt': Date.now()
    });

    console.log(`PayPal subscription suspended for DJ: ${email}`);
  } catch (error) {
    console.error('Error handling PayPal subscription suspended:', error);
  }
}

async function handleSubscriptionReactivated(body) {
  console.log('Processing PayPal subscription reactivated');
  
  try {
    const email = body.resource?.subscriber?.email_address;

    if (!email) {
      console.error('No email found in PayPal subscription data');
      return;
    }

    await updateDoc(doc(db, 'users', email), {
      'subscription.status': 'active',
      'subscription.reactivatedAt': Date.now(),
      'subscription.updatedAt': Date.now()
    });

    console.log(`PayPal subscription reactivated for DJ: ${email}`);
  } catch (error) {
    console.error('Error handling PayPal subscription reactivated:', error);
  }
}

async function handlePaymentCompleted(body) {
  console.log('Processing PayPal payment completed');
  
  try {
    // For subscription payments, we might need to look up the subscription
    // This is a simplified version - in production you'd want more robust logic
    const paymentId = body.resource?.id;
    const amount = body.resource?.amount?.total;

    console.log(`PayPal payment completed: ${paymentId}, Amount: ${amount}`);

    // You could update payment records or subscription status here
    // For now, we'll just log it
  } catch (error) {
    console.error('Error handling PayPal payment completed:', error);
  }
}

async function handlePaymentFailed(body) {
  console.log('Processing PayPal payment failed');
  
  try {
    const paymentId = body.resource?.id;
    const reason = body.resource?.reason_code;

    console.log(`PayPal payment failed: ${paymentId}, Reason: ${reason}`);

    // You could update subscription status to 'past_due' here
    // This would require additional logic to identify the user
  } catch (error) {
    console.error('Error handling PayPal payment failed:', error);
  }
} 
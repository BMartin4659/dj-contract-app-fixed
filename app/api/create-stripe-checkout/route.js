import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with error handling and specify API version
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2023-10-16' // Use a specific API version
    })
  : null;

// Default base URL if environment variable is not set
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export async function POST(request) {
  console.log('Checkout session request received');
  
  try {
    // Check if Stripe is properly initialized
    if (!stripe) {
      console.error('Stripe is not properly initialized. Missing STRIPE_SECRET_KEY.');
      return NextResponse.json(
        { error: 'Stripe configuration error' },
        { status: 500 }
      );
    }

    const { amount, contractDetails, isSubscription, plan } = await request.json();
    
    console.log('Creating checkout session with:', {
      amount,
      isSubscription,
      plan,
      contractDetails: {
        ...contractDetails,
        clientName: contractDetails?.clientName,
        email: contractDetails?.email,
      }
    });

    let session;

    if (isSubscription) {
      // Handle subscription checkout
      let priceId = '';
      if (plan === 'standard') {
        priceId = process.env.STRIPE_STANDARD_PRICE_ID;
      } else if (plan === 'premium') {
        priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
      } else {
        console.error('Invalid subscription plan:', plan);
        return NextResponse.json(
          { error: 'Invalid subscription plan' },
          { status: 400 }
        );
      }

      if (!priceId) {
        console.error('Missing Stripe price ID for plan:', plan);
        return NextResponse.json(
          { error: 'Subscription configuration error' },
          { status: 500 }
        );
      }

      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${BASE_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${BASE_URL}/subscription?canceled=true`,
        customer_email: contractDetails?.djEmail,
        metadata: {
          djEmail: contractDetails?.djEmail || '',
          plan: plan,
          subscriptionType: 'dj_plan'
        }
      });
    } else {
      // Handle one-time payment checkout
      if (!amount) {
        console.error('Missing amount in request');
        return NextResponse.json(
          { error: 'Missing amount parameter' },
          { status: 400 }
        );
      }

      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: `DJ Services - ${contractDetails?.eventType || 'Event'}`,
                description: `Event Date: ${contractDetails?.eventDate || 'TBD'}\nVenue: ${contractDetails?.venueName || 'TBD'}`,
              },
              unit_amount: amount, // amount in cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${BASE_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${BASE_URL}?canceled=true`,
        customer_email: contractDetails?.email,
        metadata: {
          clientName: contractDetails?.clientName || '',
          email: contractDetails?.email || '',
          eventType: contractDetails?.eventType || '',
          eventDate: contractDetails?.eventDate || '',
          venueName: contractDetails?.venueName || '',
          venueLocation: contractDetails?.venueLocation || '',
          startTime: contractDetails?.startTime || '',
          endTime: contractDetails?.endTime || '',
          contactPhone: contractDetails?.contactPhone || '',
          guestCount: contractDetails?.guestCount || '',
          paymentAmount: contractDetails?.paymentAmount || 'full',
          isDeposit: contractDetails?.isDeposit ? 'true' : 'false',
          bookingId: contractDetails?.bookingId || '',
          additionalHours: contractDetails?.additionalHours || '0',
          lighting: contractDetails?.lighting ? 'true' : 'false',
          photography: contractDetails?.photography ? 'true' : 'false',
          videoVisuals: contractDetails?.videoVisuals ? 'true' : 'false'
        }
      });
    }

    console.log('Checkout session created successfully:', session.id);
    
    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url // Include the URL for direct redirection
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    // Return detailed error information
    return NextResponse.json(
      { 
        error: error.message || 'Error creating checkout session',
        type: error.type,
        code: error.code 
      },
      { status: error.statusCode || 500 }
    );
  }
}

export async function GET(request) {
  console.log('Subscription checkout request received');
  
  try {
    // Check if Stripe is properly initialized
    if (!stripe) {
      console.error('Stripe is not properly initialized. Missing STRIPE_SECRET_KEY.');
      return NextResponse.json(
        { error: 'Stripe configuration error' },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const plan = searchParams.get('plan');
    const djEmail = searchParams.get('djEmail');

    if (!plan || !djEmail) {
      console.error('Missing required parameters:', { plan, djEmail });
      return NextResponse.json(
        { error: 'Missing plan or djEmail parameter' },
        { status: 400 }
      );
    }

    let priceId = '';
    if (plan === 'standard') {
      priceId = process.env.STRIPE_STANDARD_PRICE_ID;
    } else if (plan === 'premium') {
      priceId = process.env.STRIPE_PREMIUM_PRICE_ID;
    } else {
      console.error('Invalid subscription plan:', plan);
      return NextResponse.json(
        { error: 'Invalid subscription plan' },
        { status: 400 }
      );
    }

    if (!priceId) {
      console.error('Missing Stripe price ID for plan:', plan);
      console.error('Available environment variables:', {
        STRIPE_STANDARD_PRICE_ID: process.env.STRIPE_STANDARD_PRICE_ID ? 'Set' : 'Missing',
        STRIPE_PREMIUM_PRICE_ID: process.env.STRIPE_PREMIUM_PRICE_ID ? 'Set' : 'Missing'
      });
      return NextResponse.json(
        { 
          error: 'Subscription configuration error', 
          details: `Missing Stripe price ID for ${plan} plan. Please configure STRIPE_${plan.toUpperCase()}_PRICE_ID in environment variables.`
        },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${BASE_URL}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${BASE_URL}/subscription?canceled=true`,
      customer_email: djEmail,
      metadata: {
        djEmail: djEmail,
        plan: plan,
        subscriptionType: 'dj_plan'
      }
    });

    console.log('Subscription checkout session created:', session.id);
    
    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Error creating subscription checkout session:', error);
    
    return NextResponse.json(
      { 
        error: error.message || 'Error creating subscription checkout session',
        type: error.type,
        code: error.code 
      },
      { status: error.statusCode || 500 }
    );
  }
} 
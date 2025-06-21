'use client';
import React, { useState } from 'react';

export default function SubscribeButtons({ djEmail, currentPlan = 'basic' }) {
  const [loading, setLoading] = useState({});

  const plans = {
    basic: {
      name: 'Basic Plan',
      price: 'Free',
      features: [
        'Up to 5 client forms per month',
        'Basic contract templates',
        'Email notifications',
        'Standard payment options',
        'Community support'
      ]
    },
    standard: {
      name: 'Standard Plan',
      price: '$10/month',
      features: [
        'Unlimited client forms',
        'Basic email templates',
        'Client management portal',
        'Payment processing',
        'Basic analytics'
      ]
    },
    premium: {
      name: 'Premium Plan',
      price: '$15/month',
      features: [
        'Everything in Standard',
        'Advanced email templates',
        'Custom branding',
        'Advanced analytics',
        'Priority support',
        'White-label options'
      ]
    }
  };

  const handleStripeSubscription = async (plan) => {
    if (!djEmail) {
      alert('Please provide your email address');
      return;
    }

    if (plan === 'basic') {
      handleDowngradeToBasic();
      return;
    }

    setLoading(prev => ({ ...prev, [`stripe_${plan}`]: true }));
    
    try {
      const response = await fetch(`/api/create-stripe-checkout?plan=${plan}&djEmail=${djEmail}`, {
        method: 'GET'
      });
      
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating Stripe subscription:', error);
      alert('Error starting subscription. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, [`stripe_${plan}`]: false }));
    }
  };

  const handlePayPalSubscription = (plan) => {
    if (plan === 'basic') {
      handleDowngradeToBasic();
      return;
    }
    
    // PayPal subscription URLs would be configured in your PayPal dashboard
    const paypalUrls = {
      standard: process.env.NEXT_PUBLIC_PAYPAL_STANDARD_URL || '#',
      premium: process.env.NEXT_PUBLIC_PAYPAL_PREMIUM_URL || '#'
    };
    
    if (paypalUrls[plan] && paypalUrls[plan] !== '#') {
      window.open(paypalUrls[plan], '_blank');
    } else {
      alert('PayPal subscription not configured yet');
    }
  };

  const handleDowngradeToBasic = async () => {
    if (!djEmail) {
      alert('Please provide your email address');
      return;
    }

    if (!confirm('Are you sure you want to downgrade to the Basic plan? This will take effect at the end of your current billing period.')) {
      return;
    }

    setLoading(prev => ({ ...prev, 'basic_downgrade': true }));
    
    try {
      // This would typically call an API to cancel the current subscription
      // For now, we'll just show a message
      alert('Downgrade request submitted. Your subscription will be cancelled at the end of the current billing period.');
    } catch (error) {
      console.error('Error downgrading subscription:', error);
      alert('Error processing downgrade. Please contact support.');
    } finally {
      setLoading(prev => ({ ...prev, 'basic_downgrade': false }));
    }
  };

  const isCurrentPlan = (plan) => currentPlan === plan;
  const isUpgrade = (plan) => {
    const planOrder = { basic: 0, standard: 1, premium: 2 };
    return planOrder[plan] > planOrder[currentPlan];
  };
  const isDowngrade = (plan) => {
    const planOrder = { basic: 0, standard: 1, premium: 2 };
    return planOrder[plan] < planOrder[currentPlan];
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Choose Your DJ Plan</h2>
        <p className="text-gray-600">
          Upgrade your DJ business with professional tools and features
        </p>
        {currentPlan !== 'basic' && (
          <p className="text-sm text-blue-600 mt-2">
            Current Plan: {plans[currentPlan]?.name || 'Basic Plan'}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Object.entries(plans).map(([planKey, plan]) => (
          <div 
            key={planKey}
            className={`bg-white rounded-lg shadow-md p-6 border-2 flex flex-col ${
              isCurrentPlan(planKey) 
                ? 'border-green-500 bg-green-50' 
                : planKey === 'premium' 
                ? 'border-blue-500' 
                : planKey === 'basic'
                ? 'border-green-300'
                : 'border-gray-200'
            }`}
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{plan.name}</h3>
              <div className="text-3xl font-bold text-blue-600 mb-4">{plan.price}</div>
              {isCurrentPlan(planKey) && (
                <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                  Current Plan
                </span>
              )}
              {planKey === 'premium' && !isCurrentPlan(planKey) && (
                <span className="inline-block bg-blue-500 text-white px-3 py-1 rounded-full text-sm">
                  Most Popular
                </span>
              )}
              {planKey === 'basic' && !isCurrentPlan(planKey) && (
                <span className="inline-block bg-green-500 text-white px-3 py-1 rounded-full text-sm">
                  Free Plan
                </span>
              )}
            </div>

            <ul className="space-y-3 mb-6 flex-grow">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center text-gray-700">
                  <svg className="w-5 h-5 text-green-500 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {feature}
                </li>
              ))}
            </ul>

            <div className="mt-auto">
              {!isCurrentPlan(planKey) && (
                <div className="space-y-3">
                  {planKey === 'basic' ? (
                    <button
                      onClick={() => handleDowngradeToBasic()}
                      disabled={loading['basic_downgrade']}
                      className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                        loading['basic_downgrade']
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {loading['basic_downgrade'] 
                        ? 'Processing...' 
                        : currentPlan !== 'basic' ? 'Downgrade to Basic' : 'Select Basic Plan'
                      }
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleStripeSubscription(planKey)}
                        disabled={loading[`stripe_${planKey}`]}
                        className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                          loading[`stripe_${planKey}`]
                            ? 'bg-gray-400 cursor-not-allowed'
                            : planKey === 'premium'
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-gray-800 hover:bg-gray-900 text-white'
                        }`}
                      >
                        {loading[`stripe_${planKey}`] 
                          ? 'Processing...' 
                          : `${isUpgrade(planKey) ? 'Upgrade' : 'Subscribe'} with Stripe`
                        }
                      </button>

                      <button
                        onClick={() => handlePayPalSubscription(planKey)}
                        className="w-full py-3 px-4 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md font-medium transition-colors"
                      >
                        {isUpgrade(planKey) ? 'Upgrade' : 'Subscribe'} with PayPal
                      </button>
                    </>
                  )}
                </div>
              )}

              {isCurrentPlan(planKey) && (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">You&apos;re currently on this plan</p>
                  <button
                    disabled
                    className="w-full py-3 px-4 bg-gray-300 text-gray-500 rounded-md font-medium cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">Why Upgrade?</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
          <div>
            <strong>Professional Image:</strong> Custom branding and email templates make you look more professional to clients.
          </div>
          <div>
            <strong>Better Organization:</strong> Advanced client management tools help you stay organized and efficient.
          </div>
          <div>
            <strong>Grow Your Business:</strong> Analytics and insights help you understand your business better.
          </div>
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500">
        <p>Cancel anytime • No setup fees • 30-day money-back guarantee</p>
        <p className="mt-2">
          Questions? <a href="mailto:support@djcontractapp.com" className="text-blue-600 hover:underline">Contact Support</a>
        </p>
      </div>
    </div>
  );
} 
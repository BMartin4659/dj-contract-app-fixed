import { NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import nodemailer from 'nodemailer';

// Function to send an email confirmation with Pro Event Checklist
async function sendEmailConfirmation(bookingDetails) {
  try {
    // Get configuration from environment
    const EMAIL_SENDER = process.env.EMAIL_SENDER;
    const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
    
    if (!EMAIL_SENDER || !EMAIL_PASSWORD) {
      console.warn('Email service configuration missing');
      return { 
        success: false, 
        warning: 'Email configuration missing',
        fallback: true 
      };
    }
    
    // Create a transporter using SMTP - Fixed method name
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_SENDER,
        pass: EMAIL_PASSWORD,
      },
    });
    
    // Format amount as currency
    const formattedAmount = typeof bookingDetails.amount === 'number' 
      ? `$${bookingDetails.amount.toFixed(2)}` 
      : bookingDetails.amount;
      
    // Current date formatted nicely
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Calculate date 2 weeks before event for the planning call
    let formattedPlanningDate = 'TBD';
    try {
      if (bookingDetails.eventDate) {
        const eventDate = new Date(bookingDetails.eventDate);
        const planningCallDate = new Date(eventDate);
        planningCallDate.setDate(eventDate.getDate() - 14);
        formattedPlanningDate = planningCallDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
      }
    } catch (dateError) {
      console.warn('Error calculating planning date:', dateError);
      formattedPlanningDate = 'Two weeks before your event';
    }
    
    // Build email HTML content with email-safe table-based layout
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🎉 Your Wedding Ceremony & Reception is Confirmed - DJ Bobby Drake</title>
        <!--[if mso]>
        <noscript>
          <xml>
            <o:OfficeDocumentSettings>
              <o:PixelsPerInch>96</o:PixelsPerInch>
            </o:OfficeDocumentSettings>
          </xml>
        </noscript>
        <![endif]-->
        <style type="text/css">
          /* Reset styles */
          body, table, td, p, a, li, blockquote { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
          
          /* Base styles */
          body { margin: 0 !important; padding: 0 !important; background-color: #f5f5f5; }
          table { border-collapse: collapse !important; }
          .container { max-width: 600px; margin: 0 auto; }
          
          /* Responsive */
          @media screen and (max-width: 600px) {
            .container { width: 100% !important; }
            .mobile-padding { padding: 10px !important; }
            .mobile-text { font-size: 14px !important; }
            .mobile-header { font-size: 20px !important; }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f5f5f5; font-family: Arial, Helvetica, sans-serif;">
        
        <!-- Main Container -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f5f5f5;">
          <tr>
            <td align="center" style="padding: 20px 0;">
              
              <!-- Email Content -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); max-width: 600px;">
                
                <!-- Header with Logo and DJ Info -->
                <tr>
                  <td style="background-color: #6366f1; padding: 40px 20px; text-align: center;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td align="center">
                          <img src="https://dj-contract-app.vercel.app/dj-bobby-drake-logo.png" alt="DJ Bobby Drake" width="80" height="80" style="border-radius: 50%; border: 3px solid #ffffff; margin: 0 auto 20px auto; display: block;">
                          <h1 style="margin: 0 0 12px 0; color: #ffffff; font-size: 20px; font-weight: normal; font-family: Arial, Helvetica, sans-serif; line-height: 1.3;">DJ Bobby Drake</h1>
                          <p style="margin: 0; color: #e0e7ff; font-size: 15px; font-family: Arial, Helvetica, sans-serif; line-height: 1.4;">Professional DJ & Entertainment Services</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Success Banner -->
                <tr>
                  <td style="background-color: #10b981; padding: 35px 20px; text-align: center;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td align="center">
                          <div style="font-size: 28px; margin-bottom: 15px; line-height: 1;">✅</div>
                          <h2 style="margin: 0 0 12px 0; color: #ffffff; font-size: 20px; font-weight: normal; font-family: Arial, Helvetica, sans-serif; line-height: 1.3;">Payment Successful!</h2>
                          <p style="margin: 0; color: #ffffff; font-size: 15px; font-family: Arial, Helvetica, sans-serif; line-height: 1.4;">Your booking is confirmed and we're ready to rock your event!</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                  <td style="padding: 30px 20px;">
                    
                    <!-- Greeting -->
                    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5; color: #374151; font-family: Arial, Helvetica, sans-serif;">
                      Dear <strong>${bookingDetails.clientName || 'Customer'}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.5; color: #374151; font-family: Arial, Helvetica, sans-serif;">
                      I'm absolutely thrilled that you've chosen DJ Bobby Drake for your upcoming ${bookingDetails.eventType || 'event'}! I'm excited to create an unforgettable experience for you and your guests.
                    </p>
                    
                    <!-- Event Details Section -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 25px;">
                      <tr>
                        <td style="background-color: #f8fafc; border-left: 4px solid #6366f1; padding: 20px; border-radius: 0 6px 6px 0;">
                          <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 17px; font-weight: normal; font-family: Arial, Helvetica, sans-serif;">
                            📅 Event Details
                          </h3>
                          
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30%" style="font-weight: bold; color: #6b7280; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">Event Type:</td>
                                    <td style="color: #1f2937; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">${bookingDetails.eventType || 'TBD'}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30%" style="font-weight: bold; color: #6b7280; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">Date:</td>
                                    <td style="color: #1f2937; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">${bookingDetails.eventDate || 'TBD'}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30%" style="font-weight: bold; color: #6b7280; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">Time:</td>
                                    <td style="color: #1f2937; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">${bookingDetails.startTime || 'TBD'} - ${bookingDetails.endTime || 'TBD'}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30%" style="font-weight: bold; color: #6b7280; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">Venue:</td>
                                    <td style="color: #1f2937; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">${bookingDetails.venueName || 'TBD'}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30%" style="font-weight: bold; color: #6b7280; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">Location:</td>
                                    <td style="color: #1f2937; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">${bookingDetails.venueLocation || 'TBD'}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Payment Information Section -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 25px;">
                      <tr>
                        <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 0 6px 6px 0;">
                          <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 17px; font-weight: normal; font-family: Arial, Helvetica, sans-serif;">
                            💳 Payment Information
                          </h3>
                          
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #fbbf24;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30%" style="font-weight: bold; color: #92400e; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">Booking ID:</td>
                                    <td style="color: #1f2937; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">${bookingDetails.bookingId || bookingDetails.paymentId || 'N/A'}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #fbbf24;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30%" style="font-weight: bold; color: #92400e; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">Amount Paid:</td>
                                    <td style="color: #059669; font-size: 16px; font-weight: bold; font-family: Arial, Helvetica, sans-serif;">${formattedAmount || 'N/A'}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #fbbf24;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30%" style="font-weight: bold; color: #92400e; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">Payment Method:</td>
                                    <td style="color: #1f2937; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">${bookingDetails.paymentMethod || 'Stripe'}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30%" style="font-weight: bold; color: #92400e; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">Payment Date:</td>
                                    <td style="color: #1f2937; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">${currentDate}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Pro Event Checklist Section -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 25px;">
                      <tr>
                        <td style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 25px; border-radius: 0 6px 6px 0;">
                          <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 17px; font-weight: normal; font-family: Arial, Helvetica, sans-serif;">
                            🎯 Pro Event Checklist - What Happens Next
                          </h3>
                          <p style="margin: 0 0 20px 0; color: #374151; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">Here's your complete roadmap to ensure your event is absolutely perfect:</p>
                          
                          <!-- Checklist Items -->
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="background: #ffffff; padding: 12px; border-radius: 6px; margin-bottom: 10px; border: 1px solid #e5e7eb;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30" style="vertical-align: top; padding-right: 12px;">
                                      <span style="color: #10b981; font-weight: bold; font-size: 16px;">📋</span>
                                    </td>
                                    <td style="vertical-align: top;">
                                      <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px; font-family: Arial, Helvetica, sans-serif;">Music Preference Form</div>
                                      <div style="color: #6b7280; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">I'll send you a detailed music preference form 4 weeks before your event to capture your must-play songs, do-not-play list, and special requests.</div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr><td style="height: 10px;"></td></tr>
                            <tr>
                              <td style="background: #ffffff; padding: 12px; border-radius: 6px; margin-bottom: 10px; border: 1px solid #e5e7eb;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30" style="vertical-align: top; padding-right: 12px;">
                                      <span style="color: #10b981; font-weight: bold; font-size: 16px;">📞</span>
                                    </td>
                                    <td style="vertical-align: top;">
                                      <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px; font-family: Arial, Helvetica, sans-serif;">Pre-Event Planning Call</div>
                                      <div style="color: #6b7280; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">Scheduled for ${formattedPlanningDate} - We'll discuss timeline, special announcements, and any last-minute details.</div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr><td style="height: 10px;"></td></tr>
                            <tr>
                              <td style="background: #ffffff; padding: 12px; border-radius: 6px; margin-bottom: 10px; border: 1px solid #e5e7eb;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30" style="vertical-align: top; padding-right: 12px;">
                                      <span style="color: #10b981; font-weight: bold; font-size: 16px;">🏢</span>
                                    </td>
                                    <td style="vertical-align: top;">
                                      <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px; font-family: Arial, Helvetica, sans-serif;">Venue Coordination</div>
                                      <div style="color: #6b7280; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">I'll contact your venue 1 week prior to confirm load-in times, power requirements, and setup logistics.</div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr><td style="height: 10px;"></td></tr>
                            <tr>
                              <td style="background: #ffffff; padding: 12px; border-radius: 6px; margin-bottom: 10px; border: 1px solid #e5e7eb;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30" style="vertical-align: top; padding-right: 12px;">
                                      <span style="color: #10b981; font-weight: bold; font-size: 16px;">⚡</span>
                                    </td>
                                    <td style="vertical-align: top;">
                                      <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px; font-family: Arial, Helvetica, sans-serif;">Technical Requirements</div>
                                      <div style="color: #6b7280; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">Ensure 2 dedicated power outlets within 50ft of DJ setup area. I'll bring all necessary extension cords and power strips.</div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr><td style="height: 10px;"></td></tr>
                            <tr>
                              <td style="background: #ffffff; padding: 12px; border-radius: 6px; margin-bottom: 10px; border: 1px solid #e5e7eb;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30" style="vertical-align: top; padding-right: 12px;">
                                      <span style="color: #10b981; font-weight: bold; font-size: 16px;">🎵</span>
                                    </td>
                                    <td style="vertical-align: top;">
                                      <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px; font-family: Arial, Helvetica, sans-serif;">Equipment Setup</div>
                                      <div style="color: #6b7280; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">I arrive 1-2 hours before your event start time for complete setup and sound testing.</div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr><td style="height: 10px;"></td></tr>
                            <tr>
                              <td style="background: #ffffff; padding: 12px; border-radius: 6px; margin-bottom: 10px; border: 1px solid #e5e7eb;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30" style="vertical-align: top; padding-right: 12px;">
                                      <span style="color: #10b981; font-weight: bold; font-size: 16px;">💰</span>
                                    </td>
                                    <td style="vertical-align: top;">
                                      <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px; font-family: Arial, Helvetica, sans-serif;">Final Payment (if applicable)</div>
                                      <div style="color: #6b7280; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">${bookingDetails.isDeposit ? 'Remaining balance due 7 days before your event via Venmo, CashApp, or cash.' : 'Payment complete! No additional charges.'}</div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr><td style="height: 10px;"></td></tr>
                            <tr>
                              <td style="background: #ffffff; padding: 12px; border-radius: 6px; margin-bottom: 10px; border: 1px solid #e5e7eb;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30" style="vertical-align: top; padding-right: 12px;">
                                      <span style="color: #10b981; font-weight: bold; font-size: 16px;">📱</span>
                                    </td>
                                    <td style="vertical-align: top;">
                                      <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px; font-family: Arial, Helvetica, sans-serif;">Day-of Communication</div>
                                      <div style="color: #6b7280; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">I'll text you my arrival time and provide my direct number for any last-minute coordination needs.</div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr><td style="height: 10px;"></td></tr>
                            <tr>
                              <td style="background: #ffffff; padding: 12px; border-radius: 6px; border: 1px solid #e5e7eb;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30" style="vertical-align: top; padding-right: 12px;">
                                      <span style="color: #10b981; font-weight: bold; font-size: 16px;">🎉</span>
                                    </td>
                                    <td style="vertical-align: top;">
                                      <div style="font-weight: 600; color: #1f2937; margin-bottom: 4px; font-family: Arial, Helvetica, sans-serif;">Event Day Excellence</div>
                                      <div style="color: #6b7280; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">Professional MC services, seamless music transitions, and reading the crowd to keep your dance floor packed!</div>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- What's Included Section -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 25px;">
                      <tr>
                        <td style="background-color: #f8fafc; border-left: 4px solid #6366f1; padding: 20px; border-radius: 0 6px 6px 0;">
                          <h3 style="margin: 0 0 20px 0; color: #1f2937; font-size: 17px; font-weight: normal; font-family: Arial, Helvetica, sans-serif;">
                            🎼 What's Included in Your Package:
                          </h3>
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr><td style="padding: 4px 0; color: #374151; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">• Professional DJ services for your entire event</td></tr>
                            <tr><td style="padding: 4px 0; color: #374151; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">• High-quality sound system and wireless microphones</td></tr>
                            <tr><td style="padding: 4px 0; color: #374151; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">• Extensive music library spanning all genres and decades</td></tr>
                            <tr><td style="padding: 4px 0; color: #374151; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">• Professional MC and announcement services</td></tr>
                            <tr><td style="padding: 4px 0; color: #374151; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">• Mood lighting and dance floor lighting</td></tr>
                            <tr><td style="padding: 4px 0; color: #374151; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">• Backup equipment for peace of mind</td></tr>
                            <tr><td style="padding: 4px 0; color: #374151; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">• Coordination with your other vendors</td></tr>
                            <tr><td style="padding: 4px 0; color: #374151; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">• Unlimited music requests (appropriate for your event)</td></tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Contact Section -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 25px;">
                      <tr>
                        <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; border-radius: 0 6px 6px 0; text-align: center;">
                          <h3 style="margin: 0 0 15px 0; color: #92400e; font-size: 17px; font-weight: normal; font-family: Arial, Helvetica, sans-serif;">Questions? Need to Make Changes?</h3>
                          <p style="margin: 0 0 15px 0; color: #92400e; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">I'm here to help make your event perfect!</p>
                          
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center">
                            <tr>
                              <td>
                                <a href="mailto:therealdjbobbydrake@gmail.com" style="display: inline-block; background: #6366f1; color: #ffffff; text-decoration: none; padding: 15px 30px; border-radius: 6px; font-weight: 600; font-family: Arial, Helvetica, sans-serif; font-size: 16px;">✉️ Email Me</a>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Pro Tips Section -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 25px;">
                      <tr>
                        <td style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; border-radius: 0 6px 6px 0;">
                          <h3 style="margin: 0 0 20px 0; color: #166534; font-size: 17px; font-weight: normal; font-family: Arial, Helvetica, sans-serif;">
                            🌟 Pro Tips for an Amazing Event:
                          </h3>
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr><td style="padding: 4px 0; color: #166534; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">• <strong>Create a timeline:</strong> Share your event schedule with me 2 weeks prior</td></tr>
                            <tr><td style="padding: 4px 0; color: #166534; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">• <strong>Designate a point person:</strong> Choose someone to communicate with me during the event</td></tr>
                            <tr><td style="padding: 4px 0; color: #166534; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">• <strong>Consider your guests:</strong> Mix of ages? I'll curate the perfect playlist blend</td></tr>
                            <tr><td style="padding: 4px 0; color: #166534; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">• <strong>Special moments:</strong> Let me know about surprise announcements or dedications</td></tr>
                            <tr><td style="padding: 4px 0; color: #166534; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">• <strong>Backup plans:</strong> For outdoor events, discuss weather contingencies</td></tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Closing Message -->
                    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.6; color: #374151; font-family: Arial, Helvetica, sans-serif;">
                      I'm looking forward to making your ${bookingDetails.eventType || 'event'} truly special! 
                      Your satisfaction is my top priority, and I'm committed to exceeding your expectations.
                    </p>
                    
                    <p style="margin: 0 0 30px 0; color: #374151; font-family: Arial, Helvetica, sans-serif; line-height: 1.6;">
                      Best regards,<br><br>
                      <span style="color: #1f2937; font-size: 16px;">DJ Bobby Drake</span><br>
                      <span style="color: #6b7280; font-size: 14px;">Professional DJ & Entertainment Services</span><br>
                      <a href="mailto:therealdjbobbydrake@gmail.com" style="color: #6366f1; font-size: 14px; text-decoration: none;">therealdjbobbydrake@gmail.com</a>
                    </p>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; font-family: Arial, Helvetica, sans-serif;">
                    <p style="margin: 0 0 10px 0;">
                      <strong>DJ Bobby Drake Entertainment</strong> | Professional DJ Services
                    </p>
                    <p style="margin: 0; font-size: 12px;">
                      © ${new Date().getFullYear()} DJ Bobby Drake. All rights reserved. | 
                      <a href="https://dj-contract-app.vercel.app" style="color: #6366f1;">Book Online</a>
                    </p>
                  </td>
                </tr>
                
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
    
    // Send the email
    const mailOptions = {
      from: `DJ Bobby Drake <${EMAIL_SENDER}>`,
      to: bookingDetails.email,
      subject: `🎉 Your ${bookingDetails.eventType || 'Event'} is Confirmed - DJ Bobby Drake`,
      html: htmlContent,
      // Add text version for email clients that don't support HTML
      text: `
DJ BOBBY DRAKE - BOOKING CONFIRMATION

Dear ${bookingDetails.clientName || 'Customer'},

Your ${bookingDetails.eventType || 'event'} booking is confirmed!

EVENT DETAILS:
- Event Type: ${bookingDetails.eventType || 'TBD'}
- Date: ${bookingDetails.eventDate || 'TBD'}
- Venue: ${bookingDetails.venueName || 'TBD'}
- Location: ${bookingDetails.venueLocation || 'TBD'}
- Time: ${bookingDetails.startTime || 'TBD'} - ${bookingDetails.endTime || 'TBD'}

PAYMENT INFORMATION:
- Booking ID: ${bookingDetails.bookingId || bookingDetails.paymentId || 'N/A'}
- Amount Paid: ${formattedAmount || 'N/A'}
- Payment Method: ${bookingDetails.paymentMethod || 'Stripe'}
- Payment Date: ${currentDate}

PRO EVENT CHECKLIST - WHAT HAPPENS NEXT:
✓ Music Preference Form (sent 4 weeks before event)
✓ Pre-Event Planning Call (${formattedPlanningDate})
✓ Venue Coordination (1 week prior)
✓ Technical Requirements Check
✓ Equipment Setup (1-2 hours before event)
✓ Final Payment Due (if applicable - 7 days before event)
✓ Day-of Communication
✓ Event Day Excellence

WHAT'S INCLUDED:
- Professional DJ services for your entire event
- High-quality sound system and wireless microphones
- Extensive music library spanning all genres
- Professional MC and announcement services
- Mood lighting and dance floor lighting
- Backup equipment for peace of mind
- Coordination with your other vendors
- Unlimited music requests

Questions? Contact me:
Email: therealdjbobbydrake@gmail.com

Best regards,
DJ Bobby Drake
Professional DJ & Entertainment Services
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: error.message || 'Error sending email',
      fallbackMessage: "We've saved your booking but couldn't send the confirmation email right now. We'll contact you shortly."
    };
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    console.log('Payment confirmation request received:', body);
    
    const { sessionId, bookingId, paymentMethod } = body;
    
    if (!sessionId && !bookingId) {
      return NextResponse.json(
        { error: 'Missing sessionId or bookingId' },
        { status: 400 }
      );
    }
    
    // Try to find the booking in Firestore
    let bookingData = null;
    
    if (bookingId) {
      try {
        const bookingRef = doc(db, 'djContracts', bookingId);
        const bookingSnap = await getDoc(bookingRef);
        
        if (bookingSnap.exists()) {
          bookingData = { id: bookingSnap.id, ...bookingSnap.data() };
          console.log('Found booking in djContracts:', bookingData);
        } else {
          // Try bookings collection
          const bookingsRef = doc(db, 'bookings', bookingId);
          const bookingsSnap = await getDoc(bookingsRef);
          
          if (bookingsSnap.exists()) {
            bookingData = { id: bookingsSnap.id, ...bookingsSnap.data() };
            console.log('Found booking in bookings:', bookingData);
          }
        }
      } catch (error) {
        console.error('Error fetching booking from Firestore:', error);
      }
    }
    
    // If no booking found in Firestore, create from request data
    if (!bookingData) {
      bookingData = {
        ...body,
        paymentId: sessionId || bookingId,
        paymentMethod: paymentMethod || 'Stripe',
        status: 'confirmed',
        paymentStatus: 'paid',
        createdAt: new Date().toISOString()
      };
      console.log('Created booking data from request:', bookingData);
    }
    
    // Send confirmation email with Pro Event Checklist
    const emailResult = await sendEmailConfirmation(bookingData);
    
    // Update booking status if found in Firestore
    if (bookingData.id && (sessionId || bookingId)) {
      try {
        const collectionName = bookingData.id === bookingId ? 'djContracts' : 'bookings';
        const bookingRef = doc(db, collectionName, bookingData.id);
        await updateDoc(bookingRef, {
          emailSent: emailResult.success,
          emailSentAt: serverTimestamp(),
          status: 'confirmed',
          paymentStatus: 'paid',
          lastUpdated: serverTimestamp()
        });
        console.log('Updated booking status in Firestore');
      } catch (updateError) {
        console.error('Error updating booking in Firestore:', updateError);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Payment confirmation processed successfully',
      emailSent: emailResult.success,
      emailError: emailResult.error || null,
      bookingId: bookingData.id || bookingId,
      paymentId: sessionId || bookingId
    });
    
  } catch (error) {
    console.error('Error processing payment confirmation:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process payment confirmation',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 
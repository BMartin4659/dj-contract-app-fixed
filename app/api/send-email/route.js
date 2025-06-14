import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Function to send email using the configured SMTP transport
async function sendEmailViaService(emailData) {
  try {
    // Get configuration from environment
    const EMAIL_SENDER = process.env.EMAIL_SENDER;
    const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
    
    if (!EMAIL_SENDER || !EMAIL_PASSWORD) {
      console.warn('Email service configuration missing');
      // Return a partial success with warning instead of throwing an error
      return { 
        success: false, 
        warning: 'Email configuration missing',
        fallback: true 
      };
    }
    
    // Sanitized logging for debugging
    console.log('Email config:', {
      sender: EMAIL_SENDER ? `${EMAIL_SENDER.substring(0, 3)}...${EMAIL_SENDER.split('@')[1]}` : 'missing',
      password: EMAIL_PASSWORD ? '********' : 'missing',
    });
    
    // Create a transporter using SMTP
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_SENDER,
        pass: EMAIL_PASSWORD,
      },
    });
    
    // Format amount as currency
    const formattedAmount = typeof emailData.amount === 'number' 
      ? `$${emailData.amount.toFixed(2)}` 
      : emailData.amount;
      
    // Current date formatted nicely
    const currentDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Calculate date 2 weeks before event for the planning call
    let formattedPlanningDate = 'TBD';
    try {
      if (emailData.eventDate) {
        const eventDate = new Date(emailData.eventDate);
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
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="container" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                
                <!-- Header with Logo and DJ Info -->
                <tr>
                  <td style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td align="center">
                          <img src="https://dj-contract-app.vercel.app/dj-bobby-drake-logo.png" alt="DJ Bobby Drake" width="80" height="80" style="border-radius: 50%; border: 3px solid #ffffff; margin-bottom: 15px; display: block;">
                          <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: bold; font-family: Arial, Helvetica, sans-serif;">DJ Bobby Drake</h1>
                          <p style="margin: 5px 0 0 0; color: #e0e7ff; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">Professional DJ & Entertainment Services</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Success Banner -->
                <tr>
                  <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 25px 20px; text-align: center;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                      <tr>
                        <td align="center">
                          <div style="font-size: 32px; margin-bottom: 10px;">✅</div>
                          <h2 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: bold; font-family: Arial, Helvetica, sans-serif;">Payment Successful!</h2>
                          <p style="margin: 8px 0 0 0; color: #d1fae5; font-size: 16px; font-family: Arial, Helvetica, sans-serif;">Your booking is confirmed and we're ready to rock your event!</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                
                <!-- Main Content -->
                <tr>
                  <td style="padding: 30px 20px;" class="mobile-padding">
                    
                    <!-- Greeting -->
                    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5; color: #374151; font-family: Arial, Helvetica, sans-serif;">
                      Dear <strong>${emailData.clientName || 'John Doe'}</strong>,
                    </p>
                    
                    <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 1.5; color: #374151; font-family: Arial, Helvetica, sans-serif;">
                      I'm absolutely thrilled that you've chosen DJ Bobby Drake for your upcoming ${emailData.eventType || 'Wedding Ceremony & Reception'}! I'm excited to create an unforgettable experience for you and your guests.
                    </p>
                    
                    <!-- Event Details Section -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 25px;">
                      <tr>
                        <td style="background-color: #f8fafc; border-left: 4px solid #6366f1; padding: 20px; border-radius: 0 6px 6px 0;">
                          <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px; font-weight: bold; font-family: Arial, Helvetica, sans-serif;">
                            📅 Event Details
                          </h3>
                          
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30%" style="font-weight: bold; color: #6b7280; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">Event Type:</td>
                                    <td style="color: #1f2937; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">${emailData.eventType || 'Wedding Ceremony & Reception'}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30%" style="font-weight: bold; color: #6b7280; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">Date:</td>
                                    <td style="color: #1f2937; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">${emailData.eventDate || 'Saturday, June 28, 2025'}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30%" style="font-weight: bold; color: #6b7280; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">Time:</td>
                                    <td style="color: #1f2937; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">${emailData.startTime || '4:00 PM'} - ${emailData.endTime || '9:00 PM'}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #e5e7eb;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30%" style="font-weight: bold; color: #6b7280; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">Venue:</td>
                                    <td style="color: #1f2937; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">${emailData.venueName || 'Grand Ballroom'}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30%" style="font-weight: bold; color: #6b7280; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">Location:</td>
                                    <td style="color: #1f2937; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">${emailData.venueLocation || '15263 Prince Frederick Rd, Hughesville, MD 20637, USA'}</td>
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
                          <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px; font-weight: bold; font-family: Arial, Helvetica, sans-serif;">
                            💳 Payment Information
                          </h3>
                          
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #fbbf24;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30%" style="font-weight: bold; color: #92400e; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">Booking ID:</td>
                                    <td style="color: #1f2937; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">${emailData.paymentId || 'N/A'}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #fbbf24;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30%" style="font-weight: bold; color: #92400e; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">Amount Paid:</td>
                                    <td style="color: #059669; font-size: 16px; font-weight: bold; font-family: Arial, Helvetica, sans-serif;">${formattedAmount || '$1,575.00'}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0; border-bottom: 1px solid #fbbf24;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30%" style="font-weight: bold; color: #92400e; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">Payment Method:</td>
                                    <td style="color: #1f2937; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">${emailData.paymentMethod || 'Stripe'}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 8px 0;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30%" style="font-weight: bold; color: #92400e; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">Payment Date:</td>
                                    <td style="color: #1f2937; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">${emailData.paymentDate || 'June 14, 2025'}</td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Pro Event Checklist -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 25px;">
                      <tr>
                        <td style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 20px; border-radius: 0 6px 6px 0;">
                          <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px; font-weight: bold; font-family: Arial, Helvetica, sans-serif;">
                            🎯 Pro Event Checklist - What Happens Next
                          </h3>
                          
                          <p style="margin: 0 0 15px 0; color: #374151; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">
                            Here's your complete roadmap to ensure your event is absolutely perfect:
                          </p>
                          
                          <!-- Checklist Items -->
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td style="padding: 10px 0; border-bottom: 1px solid #d1fae5;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30" style="vertical-align: top;">
                                      <div style="width: 20px; height: 20px; background-color: #10b981; border-radius: 50%; color: white; text-align: center; font-size: 12px; line-height: 20px; font-family: Arial, Helvetica, sans-serif;">📋</div>
                                    </td>
                                    <td style="vertical-align: top;">
                                      <strong style="color: #1f2937; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">Music Preference Form</strong><br>
                                      <span style="color: #6b7280; font-size: 13px; font-family: Arial, Helvetica, sans-serif;">I'll send you a detailed music preference form 4 weeks before your event to capture your must-play songs, do-not-play list, and special requests.</span>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 10px 0; border-bottom: 1px solid #d1fae5;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30" style="vertical-align: top;">
                                      <div style="width: 20px; height: 20px; background-color: #10b981; border-radius: 50%; color: white; text-align: center; font-size: 12px; line-height: 20px; font-family: Arial, Helvetica, sans-serif;">📞</div>
                                    </td>
                                    <td style="vertical-align: top;">
                                      <strong style="color: #1f2937; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">Pre-Event Planning Call</strong><br>
                                      <span style="color: #6b7280; font-size: 13px; font-family: Arial, Helvetica, sans-serif;">I'll call you 2 weeks before your event to finalize all details, timeline, and special announcements.</span>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 10px 0; border-bottom: 1px solid #d1fae5;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30" style="vertical-align: top;">
                                      <div style="width: 20px; height: 20px; background-color: #10b981; border-radius: 50%; color: white; text-align: center; font-size: 12px; line-height: 20px; font-family: Arial, Helvetica, sans-serif;">🏢</div>
                                    </td>
                                    <td style="vertical-align: top;">
                                      <strong style="color: #1f2937; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">Venue Coordination</strong><br>
                                      <span style="color: #6b7280; font-size: 13px; font-family: Arial, Helvetica, sans-serif;">I'll contact your venue 1 week prior to confirm load-in times, power requirements, and setup logistics.</span>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 10px 0; border-bottom: 1px solid #d1fae5;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30" style="vertical-align: top;">
                                      <div style="width: 20px; height: 20px; background-color: #10b981; border-radius: 50%; color: white; text-align: center; font-size: 12px; line-height: 20px; font-family: Arial, Helvetica, sans-serif;">⚡</div>
                                    </td>
                                    <td style="vertical-align: top;">
                                      <strong style="color: #1f2937; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">Technical Requirements</strong><br>
                                      <span style="color: #6b7280; font-size: 13px; font-family: Arial, Helvetica, sans-serif;">Ensure 2 dedicated power outlets within 50ft of DJ setup area. I'll bring all necessary extension cords and power strips.</span>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 10px 0; border-bottom: 1px solid #d1fae5;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30" style="vertical-align: top;">
                                      <div style="width: 20px; height: 20px; background-color: #10b981; border-radius: 50%; color: white; text-align: center; font-size: 12px; line-height: 20px; font-family: Arial, Helvetica, sans-serif;">🎵</div>
                                    </td>
                                    <td style="vertical-align: top;">
                                      <strong style="color: #1f2937; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">Equipment Setup</strong><br>
                                      <span style="color: #6b7280; font-size: 13px; font-family: Arial, Helvetica, sans-serif;">I arrive 1-2 hours before your event start time for complete setup and sound testing.</span>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 10px 0; border-bottom: 1px solid #d1fae5;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30" style="vertical-align: top;">
                                      <div style="width: 20px; height: 20px; background-color: #10b981; border-radius: 50%; color: white; text-align: center; font-size: 12px; line-height: 20px; font-family: Arial, Helvetica, sans-serif;">💰</div>
                                    </td>
                                    <td style="vertical-align: top;">
                                      <strong style="color: #1f2937; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">Final Payment (if applicable)</strong><br>
                                      <span style="color: #6b7280; font-size: 13px; font-family: Arial, Helvetica, sans-serif;">Payment complete! No additional charges.</span>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                            <tr>
                              <td style="padding: 10px 0;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                  <tr>
                                    <td width="30" style="vertical-align: top;">
                                      <div style="width: 20px; height: 20px; background-color: #10b981; border-radius: 50%; color: white; text-align: center; font-size: 12px; line-height: 20px; font-family: Arial, Helvetica, sans-serif;">📱</div>
                                    </td>
                                    <td style="vertical-align: top;">
                                      <strong style="color: #1f2937; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">Day-of Communication</strong><br>
                                      <span style="color: #6b7280; font-size: 13px; font-family: Arial, Helvetica, sans-serif;">I'll text you my arrival time and provide my direct number for any last-minute coordination needs.</span>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Event Day Excellence -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 25px;">
                      <tr>
                        <td style="background-color: #fef7ff; border-left: 4px solid #a855f7; padding: 20px; border-radius: 0 6px 6px 0;">
                          <h3 style="margin: 0 0 10px 0; color: #1f2937; font-size: 18px; font-weight: bold; font-family: Arial, Helvetica, sans-serif;">
                            🎉 Event Day Excellence
                          </h3>
                          <p style="margin: 0; color: #374151; font-size: 14px; line-height: 1.5; font-family: Arial, Helvetica, sans-serif;">
                            Professional MC services, seamless music transitions, and reading the crowd to keep your dance floor packed!
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- What's Included -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 25px;">
                      <tr>
                        <td style="background-color: #f0f9ff; border-left: 4px solid #0ea5e9; padding: 20px; border-radius: 0 6px 6px 0;">
                          <h3 style="margin: 0 0 15px 0; color: #1f2937; font-size: 18px; font-weight: bold; font-family: Arial, Helvetica, sans-serif;">
                            📦 What's Included in Your Package:
                          </h3>
                          
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr><td style="padding: 3px 0; color: #374151; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">• Professional DJ services for your entire event</td></tr>
                            <tr><td style="padding: 3px 0; color: #374151; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">• High-quality sound system and wireless microphones</td></tr>
                            <tr><td style="padding: 3px 0; color: #374151; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">• Extensive music library spanning all genres and decades</td></tr>
                            <tr><td style="padding: 3px 0; color: #374151; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">• Professional MC and announcement services</td></tr>
                            <tr><td style="padding: 3px 0; color: #374151; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">• Mood lighting and dance floor lighting</td></tr>
                            <tr><td style="padding: 3px 0; color: #374151; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">• Backup equipment for peace of mind</td></tr>
                            <tr><td style="padding: 3px 0; color: #374151; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">• Coordination with your other vendors</td></tr>
                            <tr><td style="padding: 3px 0; color: #374151; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">• Unlimited music requests (appropriate for your event)</td></tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Contact Section -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 25px;">
                      <tr>
                        <td style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 20px; border-radius: 0 6px 6px 0; text-align: center;">
                          <h3 style="margin: 0 0 15px 0; color: #b91c1c; font-size: 18px; font-weight: bold; font-family: Arial, Helvetica, sans-serif;">
                            Questions? Need to Make Changes?
                          </h3>
                          <p style="margin: 0 0 15px 0; color: #374151; font-size: 14px; font-family: Arial, Helvetica, sans-serif;">
                            I'm here to help make your event perfect!
                          </p>
                          
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr>
                              <td align="center" style="padding: 10px 0;">
                                <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                                  <tr>
                                    <td style="padding: 0 10px;">
                                      <a href="tel:2038099414" style="background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 6px; font-weight: bold; font-size: 14px; font-family: Arial, Helvetica, sans-serif; display: inline-block;">📞 Call (203) 809-9414</a>
                                    </td>
                                    <td style="padding: 0 10px;">
                                      <a href="mailto:therealdjbobbydrake@gmail.com" style="background-color: #8b5cf6; color: #ffffff; text-decoration: none; padding: 12px 20px; border-radius: 6px; font-weight: bold; font-size: 14px; font-family: Arial, Helvetica, sans-serif; display: inline-block;">📧 Email Me</a>
                                    </td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                          
                          <p style="margin: 15px 0 0 0; color: #b91c1c; font-size: 13px; font-weight: bold; font-family: Arial, Helvetica, sans-serif;">
                            Best times to reach me: Mon-Fri 10AM-6PM, Weekends 12PM-4PM
                          </p>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Pro Tips -->
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 25px;">
                      <tr>
                        <td style="background-color: #f0fdf4; border-left: 4px solid #22c55e; padding: 20px; border-radius: 0 6px 6px 0;">
                          <h3 style="margin: 0 0 15px 0; color: #15803d; font-size: 18px; font-weight: bold; font-family: Arial, Helvetica, sans-serif;">
                            💡 Pro Tips for an Amazing Event:
                          </h3>
                          
                          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                            <tr><td style="padding: 5px 0; color: #374151; font-size: 14px; font-family: Arial, Helvetica, sans-serif;"><strong>Create a timeline:</strong> Share your event schedule with me 2 weeks prior</td></tr>
                            <tr><td style="padding: 5px 0; color: #374151; font-size: 14px; font-family: Arial, Helvetica, sans-serif;"><strong>Designate a point person:</strong> Choose someone to communicate with me during the event</td></tr>
                            <tr><td style="padding: 5px 0; color: #374151; font-size: 14px; font-family: Arial, Helvetica, sans-serif;"><strong>Consider your guests:</strong> Mix of ages? I'll curate the perfect playlist blend</td></tr>
                            <tr><td style="padding: 5px 0; color: #374151; font-size: 14px; font-family: Arial, Helvetica, sans-serif;"><strong>Special moments:</strong> Let me know about surprise announcements or dedications</td></tr>
                            <tr><td style="padding: 5px 0; color: #374151; font-size: 14px; font-family: Arial, Helvetica, sans-serif;"><strong>Backup plans:</strong> For outdoor events, discuss weather contingencies</td></tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                    
                    <!-- Closing -->
                    <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 1.5; color: #374151; font-family: Arial, Helvetica, sans-serif;">
                      I'm looking forward to making your ${emailData.eventType || 'Wedding Ceremony & Reception'} truly special!
                    </p>
                    
                    <p style="margin: 0; font-size: 16px; line-height: 1.5; color: #374151; font-family: Arial, Helvetica, sans-serif;">
                      Best regards,<br>
                      <strong>DJ Bobby Drake</strong><br>
                      <span style="color: #6b7280; font-size: 14px;">Professional DJ & Entertainment Services</span>
                    </p>
                    
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb; border-radius: 0 0 8px 8px;">
                    <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 12px; font-family: Arial, Helvetica, sans-serif;">
                      This is an automated confirmation email from DJ Bobby Drake.
                    </p>
                    <p style="margin: 0; color: #6b7280; font-size: 12px; font-family: Arial, Helvetica, sans-serif;">
                      © ${new Date().getFullYear()} DJ Bobby Drake Entertainment | (203) 809-9414 | therealdjbobbydrake@gmail.com
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
    
    // Plain text version of the email
    const textContent = `
      DJ BOBBY DRAKE - BOOKING CONFIRMATION
      
      Thank you for your booking!
      
      Dear ${emailData.clientName || 'Customer'},
      
      I'm absolutely thrilled that you've chosen DJ Bobby Drake for your upcoming ${emailData.eventType || 'event'}! I'm excited to create an unforgettable experience for you and your guests.
      
      EVENT DETAILS:
      Event Type: ${emailData.eventType || 'TBD'}
      Date: ${emailData.eventDate || 'TBD'}
      Venue: ${emailData.venueName || 'TBD'}
      Location: ${emailData.venueLocation || 'TBD'}
      Time: ${emailData.startTime || 'TBD'} - ${emailData.endTime || 'TBD'}
      
      PAYMENT INFORMATION:
      Payment ID: ${emailData.paymentId || 'N/A'}
      Amount: ${formattedAmount || 'N/A'}
      Payment Method: ${emailData.paymentMethod || 'N/A'}
      Payment Date: ${emailData.paymentDate || currentDate}
      
      PRE-EVENT CHECKLIST:
      - Fill out your music preference form (link will be sent 1 month before your event)
      - Planning call scheduled for ${formattedPlanningDate} (approximately 2 weeks before your event)
      - Final payment due (if applicable) 7 days before your event
      - Arrival and setup 1-2 hours before your event start time
      
      If you have any questions or need to discuss anything about your upcoming event, please don't hesitate to contact me directly at (203) 809-9414 or reply to this email.
      
      You can also access and update your event details through our online portal at: https://dj-contract-app.vercel.app/client/login
      
      I'm looking forward to making your event truly special!
      
      Best regards,
      DJ Bobby Drake
      
      (203) 809-9414
      © ${new Date().getFullYear()} DJ Bobby Drake Entertainment
    `;
    
    // Email options
    const mailOptions = {
      from: `"DJ Bobby Drake" <${EMAIL_SENDER}>`,
      to: emailData.email,
      subject: `Booking Confirmation - ${emailData.eventType} on ${emailData.eventDate}`,
      html: htmlContent,
      text: textContent,
    };
    
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    return { 
      success: true, 
      message: 'Email sent successfully',
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

export async function POST(request) {
  try {
    // Get email data from request body
    const emailData = await request.json();
    console.log('Received email request:', emailData);
    
    // Validate that we have minimum required fields
    if (!emailData.email) {
      console.error('Email validation failed: missing email address');
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }
    
    // Send the email
    const result = await sendEmailViaService(emailData);
    
    // Check if it was a partial success with warning
    if (result.warning) {
      console.warn('Email service warning:', result.warning);
      return NextResponse.json({
        success: false,
        warning: result.warning,
        message: 'Email could not be sent due to configuration issues. Your booking is still confirmed.',
        details: {
          to: emailData.email,
          eventType: emailData.eventType,
          eventDate: emailData.eventDate
        }
      }, { status: 200 });
    }
    
    console.log('Email sent successfully:', result);
    
    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Email sent successfully',
      details: {
        to: emailData.email,
        eventType: emailData.eventType,
        eventDate: emailData.eventDate,
        messageId: result.messageId
      }
    });
  } catch (error) {
    console.error('Error in email API route:', error);
    console.error('Error details:', error.stack);
    
    // Return error response, but with 200 status to not block UI flow
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Failed to send email',
        details: error.details || {},
        fallback: true,
        message: 'Email could not be sent at this time. Your booking is still confirmed.'
      },
      { status: 200 }
    );
  }
} 
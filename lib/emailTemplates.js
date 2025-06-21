import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

/**
 * Fetch email templates for a specific DJ
 * @param {string} djId - The DJ's user ID
 * @returns {Object} Email templates object
 */
export async function getEmailTemplates(djId) {
  try {
    const ref = doc(db, 'users', djId);
    const snap = await getDoc(ref);
    const data = snap.data();
    
    if (data && data.emailTemplates) {
      return data.emailTemplates;
    }
    
    // Return default templates if none exist
    return {
      confirmation: 'Thank you for booking with us! We look forward to making your event unforgettable.',
      receipt: 'Here is your receipt for your recent booking. Thank you for choosing our DJ services.',
      reminder: 'Your event is coming up soon! Just a reminder from us. We can\'t wait to celebrate with you.'
    };
  } catch (error) {
    console.error('Error fetching email templates:', error);
    // Return default templates on error
    return {
      confirmation: 'Thank you for booking with us!',
      receipt: 'Here is your receipt for your recent booking.',
      reminder: 'Your event is coming up soon!'
    };
  }
}

/**
 * Process template variables in email content
 * @param {string} template - The email template string
 * @param {Object} variables - Variables to replace in the template
 * @returns {string} Processed template with variables replaced
 */
export function processTemplate(template, variables = {}) {
  let processedTemplate = template;
  
  // Replace template variables
  Object.keys(variables).forEach(key => {
    const placeholder = `{{${key}}}`;
    const value = variables[key] || '';
    processedTemplate = processedTemplate.replace(new RegExp(placeholder, 'g'), value);
  });
  
  return processedTemplate;
}

/**
 * Send confirmation email using DJ's custom template
 * @param {string} djId - The DJ's user ID
 * @param {string} clientEmail - Client's email address
 * @param {Object} bookingData - Booking information for template variables
 */
export async function sendConfirmationEmail(djId, clientEmail, bookingData = {}) {
  try {
    const templates = await getEmailTemplates(djId);
    const template = templates.confirmation;
    
    const processedContent = processTemplate(template, {
      clientName: bookingData.clientName || 'Valued Client',
      eventDate: bookingData.eventDate || 'TBD',
      eventType: bookingData.eventType || 'Event',
      venueName: bookingData.venueName || 'TBD',
      totalAmount: bookingData.totalAmount || 'TBD'
    });
    
    // Use your existing email sending function
    const { sendEmail } = await import('./sendEmail');
    await sendEmail({
      to: clientEmail,
      subject: 'Booking Confirmation - DJ Services',
      text: processedContent,
      html: `<p>${processedContent.replace(/\n/g, '<br>')}</p>`
    });
    
    console.log('Confirmation email sent successfully');
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    throw error;
  }
}

/**
 * Send receipt email using DJ's custom template
 * @param {string} djId - The DJ's user ID
 * @param {string} clientEmail - Client's email address
 * @param {Object} paymentData - Payment information for template variables
 */
export async function sendReceiptEmail(djId, clientEmail, paymentData = {}) {
  try {
    const templates = await getEmailTemplates(djId);
    const template = templates.receipt;
    
    const processedContent = processTemplate(template, {
      clientName: paymentData.clientName || 'Valued Client',
      eventDate: paymentData.eventDate || 'TBD',
      eventType: paymentData.eventType || 'Event',
      venueName: paymentData.venueName || 'TBD',
      totalAmount: paymentData.totalAmount || 'TBD'
    });
    
    // Use your existing email sending function
    const { sendEmail } = await import('./sendEmail');
    await sendEmail({
      to: clientEmail,
      subject: 'Payment Receipt - DJ Services',
      text: processedContent,
      html: `<p>${processedContent.replace(/\n/g, '<br>')}</p>`
    });
    
    console.log('Receipt email sent successfully');
  } catch (error) {
    console.error('Error sending receipt email:', error);
    throw error;
  }
}

/**
 * Send reminder email using DJ's custom template
 * @param {string} djId - The DJ's user ID
 * @param {string} clientEmail - Client's email address
 * @param {Object} eventData - Event information for template variables
 */
export async function sendReminderEmail(djId, clientEmail, eventData = {}) {
  try {
    const templates = await getEmailTemplates(djId);
    const template = templates.reminder;
    
    const processedContent = processTemplate(template, {
      clientName: eventData.clientName || 'Valued Client',
      eventDate: eventData.eventDate || 'TBD',
      eventType: eventData.eventType || 'Event',
      venueName: eventData.venueName || 'TBD',
      totalAmount: eventData.totalAmount || 'TBD'
    });
    
    // Use your existing email sending function
    const { sendEmail } = await import('./sendEmail');
    await sendEmail({
      to: clientEmail,
      subject: 'Event Reminder - DJ Services',
      text: processedContent,
      html: `<p>${processedContent.replace(/\n/g, '<br>')}</p>`
    });
    
    console.log('Reminder email sent successfully');
  } catch (error) {
    console.error('Error sending reminder email:', error);
    throw error;
  }
} 
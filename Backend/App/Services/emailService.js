const sendOrderEmail = async (userEmail, order, templateType) => {
    const templates = {
      confirmation: `Your order #${order._id} has been confirmed`,
      shipped: `Order #${order._id} has been shipped (Tracking: ${order.trackingNumber})`,
      delivered: `Order #${order._id} was delivered`
    };
  
    // In production, integrate with Nodemailer/SendGrid
    console.log(`Email to ${userEmail}: ${templates[templateType]}`);
  };

// 📧 Send service request confirmation email
const sendServiceRequestEmail = async (userEmail, fullName, serviceType, preferredDate, preferredTime) => {
  try {
    const formattedDate = new Date(preferredDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const emailTemplate = `
      Dear ${fullName},

      Thank you for submitting your service request for ${serviceType}!

      📅 **Service Details:**
      - Service Type: ${serviceType}
      - Preferred Date: ${formattedDate}
      - Preferred Time: ${preferredTime}

      🕐 **What happens next?**
      Our team will review your request and contact you within 24-48 hours to:
      - Confirm your appointment
      - Provide a detailed quote
      - Schedule a site visit if needed

      📞 **Need immediate assistance?**
      Contact us at: +1 (555) 123-4567
      Email: support@plantgarden.com

      Best regards,
      The Plant Garden Team
      
      ---
      This is an automated confirmation. Please do not reply to this email.
    `;

    // In production, integrate with Nodemailer/SendGrid
    console.log(`Service Request Confirmation Email sent to ${userEmail}:`);
    console.log(emailTemplate);

    return true;
  } catch (error) {
    console.error('Error sending service request email:', error);
    return false;
  }
};
  
module.exports = { 
  sendOrderEmail,
  sendServiceRequestEmail 
};
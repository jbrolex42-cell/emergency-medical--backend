const twilio = require('twilio');
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER } = require('../config/env');

/**
 * Notification Service
 * Handles SMS notifications to users and providers
 * Critical for rural areas with limited internet
 */

let twilioClient = null;
if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
}

const notificationService = {
  notifyUser: async (phoneNumber, message) => {
    try {
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      if (twilioClient) {
        await twilioClient.messages.create({
          body: message.message || message,
          from: TWILIO_PHONE_NUMBER,
          to: formattedPhone
        });
      } else {
        console.log(`SMS to ${formattedPhone}: ${message.message || message}`);
      }
      
      return true;
    } catch (error) {
      console.error('SMS notification error:', error);
      return false;
    }
  },

  notifyProviders: async (providers, emergency) => {
    const messages = providers.map(async (provider) => {
      const message = `EMERGENCY ALERT: ${emergency.type} emergency reported ${emergency.distance.toFixed(1)}km away. Severity: ${emergency.severity}. Respond via app or call 999.`;
      
      // Notify provider contact
      if (provider.contactPhone) {
        await notificationService.notifyUser(provider.contactPhone, { message });
      }
    });

    await Promise.all(messages);
  },

  notifyStatusUpdate: async (phoneNumber, status) => {
    const messages = {
      dispatched: 'Your ambulance has been dispatched and is on its way.',
      en_route: 'Ambulance is en route to your location.',
      on_scene: 'Ambulance has arrived at your location.',
      completed: 'Emergency response completed. Thank you for using Kenya EMS.'
    };

    const message = messages[status] || `Status updated to: ${status}`;
    await notificationService.notifyUser(phoneNumber, { message });
  },

  sendSOS: async (phoneNumber, location) => {
    const message = `SOS from ${phoneNumber}. Location: ${location.what3words || `${location.lat}, ${location.lng}`}. Please send help immediately.`;
    
    // Send to emergency contacts and 999
    await notificationService.notifyUser('999', { message });
    
    return true;
  }
};

function formatPhoneNumber(phone) {
  // Ensure Kenyan format (+254...)
  if (phone.startsWith('0')) {
    return '+254' + phone.substring(1);
  }
  if (!phone.startsWith('+')) {
    return '+254' + phone;
  }
  return phone;
}

module.exports = notificationService;
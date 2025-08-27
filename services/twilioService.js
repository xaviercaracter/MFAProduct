const twilio = require('twilio');

class TwilioService {
    constructor() {
        this.client = twilio(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );
        this.fromNumber = process.env.TWILIO_PHONE_NUMBER;
    }

    async sendVerificationCode(phoneNumber, code) {
        try {
            const message = await this.client.messages.create({
                body: `Your verification code is: ${code}. This code will expire in 5 minutes.`,
                to: phoneNumber,
                from: this.fromNumber
            });

            console.log(`SMS sent successfully to ${phoneNumber}. SID: ${message.sid}`);
            return { success: true, messageSid: message.sid };
        } catch (error) {
            console.error('Twilio SMS error:', error);
            throw new Error(`Failed to send SMS: ${error.message}`);
        }
    }

    async sendWelcomeMessage(phoneNumber, firstName) {
        try {
            const message = await this.client.messages.create({
                body: `Welcome ${firstName}! Your account has been created successfully.`,
                to: phoneNumber,
                from: this.fromNumber
            });

            console.log(`Welcome SMS sent to ${phoneNumber}. SID: ${message.sid}`);
            return { success: true, messageSid: message.sid };
        } catch (error) {
            console.error('Twilio welcome SMS error:', error);
            // Don't throw error for welcome message as it's not critical
            return { success: false, error: error.message };
        }
    }

    async sendAccountLockedMessage(phoneNumber, firstName) {
        try {
            const message = await this.client.messages.create({
                body: `Hi ${firstName}, your account has been locked due to multiple failed login attempts. Please contact support to unlock your account.`,
                to: phoneNumber,
                from: this.fromNumber
            });

            console.log(`Account locked SMS sent to ${phoneNumber}. SID: ${message.sid}`);
            return { success: true, messageSid: message.sid };
        } catch (error) {
            console.error('Twilio account locked SMS error:', error);
            return { success: false, error: error.message };
        }
    }

    // Helper method to format phone numbers
    formatPhoneNumber(phoneNumber) {
        // Remove all non-digit characters except +
        let cleaned = phoneNumber.replace(/[^\d+]/g, '');
        
        // Ensure it starts with +
        if (!cleaned.startsWith('+')) {
            cleaned = '+' + cleaned;
        }
        
        return cleaned;
    }

    // Validate phone number format
    isValidPhoneNumber(phoneNumber) {
        const formatted = this.formatPhoneNumber(phoneNumber);
        // Basic validation - should start with + and have 10-15 digits
        return /^\+\d{10,15}$/.test(formatted);
    }
}

module.exports = TwilioService;

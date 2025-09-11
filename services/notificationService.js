const TwilioService = require('./twilioService');
const EmailService = require('./emailService');

class NotificationService {
    constructor() {
        this.twilioService = new TwilioService();
        this.emailService = new EmailService();
    }

    async sendVerificationCode(email, phoneNumber, code, firstName = '') {
        const results = {
            sms: { success: false, error: null },
            email: { success: false, error: null }
        };

        // Send SMS and Email simultaneously
        const promises = [];

        // SMS Promise
        if (phoneNumber) {
            promises.push(
                this.twilioService.sendVerificationCode(phoneNumber, code)
                    .then(result => {
                        results.sms = { success: true, result };
                        console.log(`✓ SMS sent to ${phoneNumber}`);
                    })
                    .catch(error => {
                        results.sms = { success: false, error: error.message };
                        console.error(`✗ SMS failed to ${phoneNumber}:`, error.message);
                    })
            );
        }

        // Email Promise
        if (email) {
            promises.push(
                this.emailService.sendVerificationCode(email, code, firstName)
                    .then(result => {
                        results.email = { success: true, result };
                        console.log(`✓ Email sent to ${email}`);
                    })
                    .catch(error => {
                        results.email = { success: false, error: error.message };
                        console.error(`✗ Email failed to ${email}:`, error.message);
                    })
            );
        }

        // Wait for both to complete
        await Promise.allSettled(promises);

        // Log overall status
        const smsStatus = results.sms.success ? '✓' : '✗';
        const emailStatus = results.email.success ? '✓' : '✗';
        console.log(`Verification code delivery: SMS ${smsStatus} | Email ${emailStatus}`);

        // If both fail, log the code for development
        if (!results.sms.success && !results.email.success) {
            console.log(`Both delivery methods failed. Verification code: ${code}`);
        }

        return results;
    }

    async sendWelcomeMessage(email, phoneNumber, firstName) {
        const results = {
            sms: { success: false, error: null },
            email: { success: false, error: null }
        };

        const promises = [];

        // SMS Welcome
        if (phoneNumber) {
            promises.push(
                this.twilioService.sendWelcomeMessage(phoneNumber, firstName)
                    .then(result => {
                        results.sms = { success: true, result };
                        console.log(`✓ Welcome SMS sent to ${phoneNumber}`);
                    })
                    .catch(error => {
                        results.sms = { success: false, error: error.message };
                        console.error(`✗ Welcome SMS failed to ${phoneNumber}:`, error.message);
                    })
            );
        }

        // Email Welcome
        if (email) {
            promises.push(
                this.emailService.sendWelcomeEmail(email, firstName)
                    .then(result => {
                        results.email = { success: true, result };
                        console.log(`✓ Welcome email sent to ${email}`);
                    })
                    .catch(error => {
                        results.email = { success: false, error: error.message };
                        console.error(`✗ Welcome email failed to ${email}:`, error.message);
                    })
            );
        }

        await Promise.allSettled(promises);

        const smsStatus = results.sms.success ? '✓' : '✗';
        const emailStatus = results.email.success ? '✓' : '✗';
        console.log(`Welcome message delivery: SMS ${smsStatus} | Email ${emailStatus}`);

        return results;
    }

    async sendAccountLockedMessage(email, phoneNumber, firstName) {
        const results = {
            sms: { success: false, error: null },
            email: { success: false, error: null }
        };

        const promises = [];

        // SMS Account Locked
        if (phoneNumber) {
            promises.push(
                this.twilioService.sendAccountLockedMessage(phoneNumber, firstName)
                    .then(result => {
                        results.sms = { success: true, result };
                        console.log(`✓ Account locked SMS sent to ${phoneNumber}`);
                    })
                    .catch(error => {
                        results.sms = { success: false, error: error.message };
                        console.error(`✗ Account locked SMS failed to ${phoneNumber}:`, error.message);
                    })
            );
        }

        // Email Account Locked
        if (email) {
            promises.push(
                this.emailService.sendAccountLockedEmail(email, firstName)
                    .then(result => {
                        results.email = { success: true, result };
                        console.log(`✓ Account locked email sent to ${email}`);
                    })
                    .catch(error => {
                        results.email = { success: false, error: error.message };
                        console.error(`✗ Account locked email failed to ${email}:`, error.message);
                    })
            );
        }

        await Promise.allSettled(promises);

        const smsStatus = results.sms.success ? '✓' : '✗';
        const emailStatus = results.email.success ? '✓' : '✗';
        console.log(`Account locked message delivery: SMS ${smsStatus} | Email ${emailStatus}`);

        return results;
    }

    // Get delivery status summary
    getDeliveryStatus(results) {
        const smsSuccess = results.sms?.success || false;
        const emailSuccess = results.email?.success || false;
        
        if (smsSuccess && emailSuccess) {
            return 'Both SMS and Email delivered successfully';
        } else if (smsSuccess) {
            return 'SMS delivered, Email failed';
        } else if (emailSuccess) {
            return 'Email delivered, SMS failed';
        } else {
            return 'Both SMS and Email failed';
        }
    }
}

module.exports = NotificationService;

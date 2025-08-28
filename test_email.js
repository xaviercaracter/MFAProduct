require('dotenv').config();
const EmailService = require('./services/emailService');

async function testEmail() {
    const emailService = new EmailService();
    
    console.log('Testing email configuration...');
    
    // Test connection
    const connectionTest = await emailService.testConnection();
    console.log('Connection test:', connectionTest);
    
    if (connectionTest.success) {
        try {
            // Test sending verification code
            console.log('\nSending test verification email...');
            const result = await emailService.sendVerificationCode(
                'xaviercaracter@icloud.com', // Replace with your email for testing
                '123456',
                'Test User'
            );
            console.log('Email result:', result);
        } catch (error) {
            console.error('Email test failed:', error.message);
        }
    }
}

testEmail();

const nodemailer = require('nodemailer');

class EmailService {
    constructor() {
        this.isEnabled = this.checkConfiguration();
        if (this.isEnabled) {
            this.transporter = this.createTransporter();
        }
    }

    checkConfiguration() {
        const requiredVars = [
            'SMTP_HOST',
            'SMTP_PORT',
            'SMTP_USER',
            'SMTP_PASS'
        ];

        const missing = requiredVars.filter(varName => !process.env[varName]);
        
        if (missing.length > 0) {
            console.warn(`Email service disabled. Missing environment variables: ${missing.join(', ')}`);
            return false;
        }
        
        return true;
    }

    createTransporter() {
        return nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT),
            secure: process.env.SMTP_PORT == 465, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            tls: {
                rejectUnauthorized: false // For self-signed certificates
            }
        });
    }

    async sendVerificationCode(email, code, firstName = '') {
        if (!this.isEnabled) {
            console.log(`Email service disabled. Verification code for ${email}: ${code}`);
            return { success: false, disabled: true };
        }

        try {
            const mailOptions = {
                from: `"${process.env.APP_NAME || 'MFA System'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
                to: email,
                subject: 'Your Verification Code',
                html: this.getVerificationEmailTemplate(code, firstName),
                text: `Your verification code is: ${code}. This code will expire in 5 minutes.`
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log(`Verification email sent to ${email}. Message ID: ${info.messageId}`);
            
            return { 
                success: true, 
                messageId: info.messageId,
                response: info.response 
            };
        } catch (error) {
            console.error('Email sending error:', error);
            throw new Error(`Failed to send email: ${error.message}`);
        }
    }

    async sendWelcomeEmail(email, firstName) {
        if (!this.isEnabled) {
            console.log(`Email service disabled. Welcome email would be sent to ${email}`);
            return { success: false, disabled: true };
        }

        try {
            const mailOptions = {
                from: `"${process.env.APP_NAME || 'MFA System'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
                to: email,
                subject: 'Welcome to MFA System!',
                html: this.getWelcomeEmailTemplate(firstName),
                text: `Welcome ${firstName}! Your account has been created successfully.`
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log(`Welcome email sent to ${email}. Message ID: ${info.messageId}`);
            
            return { 
                success: true, 
                messageId: info.messageId 
            };
        } catch (error) {
            console.error('Welcome email error:', error);
            return { success: false, error: error.message };
        }
    }

    async sendAccountLockedEmail(email, firstName) {
        if (!this.isEnabled) {
            console.log(`Email service disabled. Account locked email would be sent to ${email}`);
            return { success: false, disabled: true };
        }

        try {
            const mailOptions = {
                from: `"${process.env.APP_NAME || 'MFA System'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
                to: email,
                subject: 'Account Locked - Security Alert',
                html: this.getAccountLockedEmailTemplate(firstName),
                text: `Hi ${firstName}, your account has been locked due to multiple failed login attempts. Please contact support to unlock your account.`
            };

            const info = await this.transporter.sendMail(mailOptions);
            console.log(`Account locked email sent to ${email}. Message ID: ${info.messageId}`);
            
            return { 
                success: true, 
                messageId: info.messageId 
            };
        } catch (error) {
            console.error('Account locked email error:', error);
            return { success: false, error: error.message };
        }
    }

    getVerificationEmailTemplate(code, firstName = '') {
        const greeting = firstName ? `Hi ${firstName},` : 'Hello,';
        
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Verification Code</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
                <div style="text-align: center; padding: 20px 0;">
                    <h1 style="color: #333; margin: 0;">${process.env.APP_NAME || 'MFA System'}</h1>
                </div>
                
                <div style="padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 10px; color: white; text-align: center;">
                    <h2 style="margin: 0 0 20px 0;">Verification Code</h2>
                    <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; background: white; color: #333; padding: 15px; border-radius: 8px; display: inline-block;">
                        ${code}
                    </div>
                </div>
                
                <div style="padding: 20px; text-align: center;">
                    <p style="color: #333; font-size: 16px; line-height: 1.5; margin: 0 0 15px 0;">
                        ${greeting}
                    </p>
                    <p style="color: #333; font-size: 16px; line-height: 1.5; margin: 0 0 15px 0;">
                        Use the verification code above to complete your login. This code will expire in <strong>5 minutes</strong>.
                    </p>
                    <p style="color: #666; font-size: 14px; line-height: 1.5; margin: 0;">
                        If you didn't request this code, please ignore this email. Your account remains secure.
                    </p>
                </div>
                
                <div style="border-top: 1px solid #eee; padding: 20px; text-align: center;">
                    <p style="color: #999; font-size: 12px; margin: 0;">
                        This is an automated message. Please do not reply to this email.
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    getWelcomeEmailTemplate(firstName) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
                <div style="text-align: center; padding: 20px 0;">
                    <h1 style="color: #333; margin: 0;">${process.env.APP_NAME || 'MFA System'}</h1>
                </div>
                
                <div style="padding: 20px; text-align: center;">
                    <h2 style="color: #667eea; margin: 0 0 20px 0;">Welcome ${firstName}!</h2>
                    <p style="color: #333; font-size: 16px; line-height: 1.5; margin: 0 0 15px 0;">
                        Your account has been created successfully. You can now log in and enjoy our secure MFA system.
                    </p>
                    <div style="margin: 30px 0;">
                        <a href="${process.env.APP_URL || 'http://localhost:3000'}/login" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">
                            Login Now
                        </a>
                    </div>
                </div>
                
                <div style="border-top: 1px solid #eee; padding: 20px; text-align: center;">
                    <p style="color: #999; font-size: 12px; margin: 0;">
                        This is an automated message. Please do not reply to this email.
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    getAccountLockedEmailTemplate(firstName) {
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Account Locked</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px;">
                <div style="text-align: center; padding: 20px 0;">
                    <h1 style="color: #333; margin: 0;">${process.env.APP_NAME || 'MFA System'}</h1>
                </div>
                
                <div style="padding: 20px; background: #fee; border-left: 4px solid #e74c3c; color: #333;">
                    <h2 style="color: #e74c3c; margin: 0 0 15px 0;">Security Alert: Account Locked</h2>
                    <p style="font-size: 16px; line-height: 1.5; margin: 0 0 15px 0;">
                        Hi ${firstName},
                    </p>
                    <p style="font-size: 16px; line-height: 1.5; margin: 0 0 15px 0;">
                        Your account has been temporarily locked due to multiple failed login attempts. This is a security measure to protect your account.
                    </p>
                    <p style="font-size: 16px; line-height: 1.5; margin: 0;">
                        Please contact our support team to unlock your account and reset your access.
                    </p>
                </div>
                
                <div style="border-top: 1px solid #eee; padding: 20px; text-align: center;">
                    <p style="color: #999; font-size: 12px; margin: 0;">
                        This is an automated security notification. Please do not reply to this email.
                    </p>
                </div>
            </div>
        </body>
        </html>
        `;
    }

    // Test email configuration
    async testConnection() {
        if (!this.isEnabled) {
            return { success: false, message: 'Email service is disabled' };
        }

        try {
            await this.transporter.verify();
            console.log('Email server connection successful');
            return { success: true, message: 'Email server connection successful' };
        } catch (error) {
            console.error('Email server connection failed:', error);
            return { success: false, message: error.message };
        }
    }
}

module.exports = EmailService;

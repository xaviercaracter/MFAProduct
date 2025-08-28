const express = require('express');
const router = express.Router();
const { SessionManager } = require('../middleware/sessionManager');
const rateLimit = require('express-rate-limit');
const User = require('../models/User');
const VerificationCode = require('../models/VerificationCode');
const TwilioService = require('../services/twilioService');
const EmailService = require('../services/emailService');
const { Op } = require('sequelize');

// Initialize services
const twilioService = new TwilioService();
const emailService = new EmailService();

// Rate limiting for registration attempts
const registerLimiter = rateLimit({
    windowMs: 20 * 60 * 1000, // 20 minutes
    max: 5, // 5 attempts
    message: { message: 'Too many registration attempts, please try again later' }
});

// Rate limiting for login attempts
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 3, // 3 attempts
    message: { message: 'Too many login attempts, please try again later' }
});

// Register route
router.post('/register', registerLimiter, async (req, res) => {
    try {
        const { firstName, lastName, email, phoneNumber, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Create new user
        const user = await User.create({
            firstName,
            lastName,
            email,
            phoneNumber,
            password
        });

        console.log(`New user registered: ${email}`);

        // Send welcome email
        try {
            await emailService.sendWelcomeEmail(email, firstName);
        } catch (emailError) {
            console.error('Welcome email sending failed:', emailError.message);
            // Don't fail registration if email fails
        }

        res.status(201).json({ 
            message: 'Account created successfully',
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'An error occurred during registration' });
    }
});

// Login route
router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check if account is locked
        if (user.isLocked) {
            return res.status(401).json({ message: 'Account is locked. Please contact support.' });
        }

        // Validate password
        const isValidPassword = await user.validatePassword(password);
        if (!isValidPassword) {
            // Increment login attempts
            await user.update({
                loginAttempts: user.loginAttempts + 1,
                lastLoginAttempt: new Date(),
                isLocked: user.loginAttempts + 1 >= 3
            });

            return res.status(401).json({ 
                message: 'Invalid credentials',
                attemptsRemaining: 3 - (user.loginAttempts + 1)
            });
        }

        // Reset login attempts on successful password validation
        await user.update({
            loginAttempts: 0,
            lastLoginAttempt: new Date()
        });

        // Generate and store verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        await VerificationCode.create({
            userId: user.id,
            code: verificationCode,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
        });

        // Send verification code via email (fallback to SMS if email fails)
        try {
            await emailService.sendVerificationCode(email, verificationCode, user.firstName);
            console.log(`Verification code sent via email to ${email}`);
        } catch (emailError) {
            console.error('Email sending failed:', emailError.message);
            
            // Fallback to SMS if available
            try {
                const formattedPhone = twilioService.formatPhoneNumber(user.phoneNumber);
                await twilioService.sendVerificationCode(formattedPhone, verificationCode);
                console.log(`Verification code sent via SMS to ${formattedPhone} (email fallback)`);
            } catch (smsError) {
                console.error('SMS fallback also failed:', smsError.message);
                // Still log the code for development/testing
                console.log(`Verification code for ${email}: ${verificationCode}`);
            }
        }

        res.json({ message: 'Verification code sent' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'An error occurred during login' });
    }
});

// Verify MFA code and create session
router.post('/verify', async (req, res) => {
    try {
        const { email, code } = req.body;
        
        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid user' });
        }

        // Find valid verification code
        const verificationCode = await VerificationCode.findOne({
            where: {
                userId: user.id,
                code: code,
                isUsed: false,
                expiresAt: {
                    [Op.gt]: new Date()
                }
            }
        });

        if (!verificationCode) {
            return res.status(401).json({ message: 'Invalid or expired verification code' });
        }

        // Mark verification code as used
        await verificationCode.update({ isUsed: true });

        // Create session
        const sessionManager = new SessionManager();
        const session = sessionManager.createSession(user.id);

        res.json({
            message: 'Login successful',
            session
        });
    } catch (error) {
        console.error('Verification error:', error);
        res.status(500).json({ message: 'An error occurred during verification' });
    }
});

// Resend verification code
router.post('/resend-code', async (req, res) => {
    try {
        const { email } = req.body;
        
        // Find user
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({ message: 'Invalid user' });
        }

        // Check if account is locked
        if (user.isLocked) {
            return res.status(401).json({ message: 'Account is locked. Please contact support.' });
        }

        // Invalidate any existing unused verification codes for this user
        await VerificationCode.update(
            { isUsed: true },
            {
                where: {
                    userId: user.id,
                    isUsed: false
                }
            }
        );

        // Generate and store new verification code
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
        await VerificationCode.create({
            userId: user.id,
            code: verificationCode,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
        });

        // Send new verification code via email (fallback to SMS if email fails)
        try {
            await emailService.sendVerificationCode(email, verificationCode, user.firstName);
            console.log(`New verification code sent via email to ${email}`);
        } catch (emailError) {
            console.error('Email sending failed:', emailError.message);
            
            // Fallback to SMS if available
            try {
                const formattedPhone = twilioService.formatPhoneNumber(user.phoneNumber);
                await twilioService.sendVerificationCode(formattedPhone, verificationCode);
                console.log(`New verification code sent via SMS to ${formattedPhone} (email fallback)`);
            } catch (smsError) {
                console.error('SMS fallback also failed:', smsError.message);
                // Still log the code for development/testing
                console.log(`New verification code for ${email}: ${verificationCode}`);
            }
        }

        res.json({ message: 'New verification code sent' });
    } catch (error) {
        console.error('Resend code error:', error);
        res.status(500).json({ message: 'An error occurred while resending the code' });
    }
});

// Refresh session
router.post('/refresh', async (req, res) => {
    try {
        const { sessionToken } = req.body;
        
        const sessionManager = new SessionManager();
        const newSession = sessionManager.refreshSession(sessionToken);
        
        if (!newSession) {
            return res.status(401).json({ message: 'Invalid or expired session' });
        }

        res.json({ session: newSession });
    } catch (error) {
        console.error('Session refresh error:', error);
        res.status(500).json({ message: 'An error occurred during session refresh' });
    }
});

module.exports = router; 
const TwilioService = require('../services/twilioService');

// Mock Twilio client
const mockTwilioClient = {
    messages: {
        create: jest.fn()
    }
};

// Mock the twilio module
jest.mock('twilio', () => {
    return jest.fn(() => mockTwilioClient);
});

describe('TwilioService', () => {
    let twilioService;
    let originalEnv;

    beforeEach(() => {
        // Store original environment variables
        originalEnv = {
            TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
            TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
            TWILIO_PHONE_NUMBER: process.env.TWILIO_PHONE_NUMBER
        };

        // Clear all mocks
        jest.clearAllMocks();
    });

    afterEach(() => {
        // Restore original environment variables
        process.env.TWILIO_ACCOUNT_SID = originalEnv.TWILIO_ACCOUNT_SID;
        process.env.TWILIO_AUTH_TOKEN = originalEnv.TWILIO_AUTH_TOKEN;
        process.env.TWILIO_PHONE_NUMBER = originalEnv.TWILIO_PHONE_NUMBER;
    });

    describe('Constructor', () => {
        it('should initialize with valid credentials', () => {
            process.env.TWILIO_ACCOUNT_SID = 'test_sid';
            process.env.TWILIO_AUTH_TOKEN = 'test_token';
            process.env.TWILIO_PHONE_NUMBER = '+18777577620';

            twilioService = new TwilioService();

            expect(twilioService.isEnabled).toBe(true);
            expect(twilioService.fromNumber).toBe('+18777577620');
        });

        it('should use the from number from TWILIO_PHONE_NUMBER environment variable', () => {
            const customFromNumber = '+15551234567';
            process.env.TWILIO_ACCOUNT_SID = 'test_sid';
            process.env.TWILIO_AUTH_TOKEN = 'test_token';
            process.env.TWILIO_PHONE_NUMBER = customFromNumber;

            twilioService = new TwilioService();

            expect(twilioService.fromNumber).toBe(customFromNumber);
        });

        it('should disable service when credentials are missing', () => {
            delete process.env.TWILIO_ACCOUNT_SID;
            delete process.env.TWILIO_AUTH_TOKEN;

            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            twilioService = new TwilioService();

            expect(twilioService.isEnabled).toBe(false);
            expect(consoleSpy).toHaveBeenCalledWith('Twilio credentials not found. SMS sending will be disabled.');

            consoleSpy.mockRestore();
        });

        it('should disable service when phone number is missing', () => {
            process.env.TWILIO_ACCOUNT_SID = 'test_sid';
            process.env.TWILIO_AUTH_TOKEN = 'test_token';
            delete process.env.TWILIO_PHONE_NUMBER;

            const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

            twilioService = new TwilioService();

            expect(twilioService.isEnabled).toBe(false);
            expect(consoleSpy).toHaveBeenCalledWith('TWILIO_PHONE_NUMBER not set. SMS sending will be disabled.');

            consoleSpy.mockRestore();
        });
    });

    describe('sendVerificationCode', () => {
        beforeEach(() => {
            process.env.TWILIO_ACCOUNT_SID = 'test_sid';
            process.env.TWILIO_AUTH_TOKEN = 'test_token';
            process.env.TWILIO_PHONE_NUMBER = '+18777577620';
            twilioService = new TwilioService();
        });

        it('should send verification code successfully', async () => {
            const mockMessage = { sid: 'test_message_sid' };
            mockTwilioClient.messages.create.mockResolvedValue(mockMessage);

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            const result = await twilioService.sendVerificationCode('+18777804236', '123456');

            expect(mockTwilioClient.messages.create).toHaveBeenCalledWith({
                body: 'Your verification code is: 123456. This code will expire in 5 minutes.',
                to: '+18777804236',
                from: '+18777577620'
            });

            expect(result).toEqual({
                success: true,
                messageSid: 'test_message_sid'
            });

            expect(consoleSpy).toHaveBeenCalledWith('SMS sent successfully to +18777804236. SID: test_message_sid');

            consoleSpy.mockRestore();
        });

        it('should handle Twilio API errors', async () => {
            const error = new Error('Twilio API error');
            mockTwilioClient.messages.create.mockRejectedValue(error);

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            await expect(twilioService.sendVerificationCode('+18777804236', '123456'))
                .rejects.toThrow('Failed to send SMS: Twilio API error');

            expect(consoleSpy).toHaveBeenCalledWith('Twilio SMS error:', error);

            consoleSpy.mockRestore();
        });

        it('should return disabled status when service is disabled', async () => {
            delete process.env.TWILIO_ACCOUNT_SID;
            twilioService = new TwilioService();

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            const result = await twilioService.sendVerificationCode('+18777804236', '123456');

            expect(result).toEqual({
                success: false,
                disabled: true
            });

            expect(consoleSpy).toHaveBeenCalledWith('Twilio disabled. Verification code for +18777804236: 123456');

            consoleSpy.mockRestore();
        });
    });

    describe('sendWelcomeMessage', () => {
        beforeEach(() => {
            process.env.TWILIO_ACCOUNT_SID = 'test_sid';
            process.env.TWILIO_AUTH_TOKEN = 'test_token';
            process.env.TWILIO_PHONE_NUMBER = '+18777577620';
            twilioService = new TwilioService();
        });

        it('should send welcome message successfully', async () => {
            const mockMessage = { sid: 'test_welcome_sid' };
            mockTwilioClient.messages.create.mockResolvedValue(mockMessage);

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            const result = await twilioService.sendWelcomeMessage('+18777804236', 'John');

            expect(mockTwilioClient.messages.create).toHaveBeenCalledWith({
                body: 'Welcome John! Your account has been created successfully.',
                to: '+18777804236',
                from: '+18777577620'
            });

            expect(result).toEqual({
                success: true,
                messageSid: 'test_welcome_sid'
            });

            expect(consoleSpy).toHaveBeenCalledWith('Welcome SMS sent to +18777804236. SID: test_welcome_sid');

            consoleSpy.mockRestore();
        });

        it('should handle errors gracefully without throwing', async () => {
            const error = new Error('Welcome message error');
            mockTwilioClient.messages.create.mockRejectedValue(error);

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            const result = await twilioService.sendWelcomeMessage('+18777804236', 'John');

            expect(result).toEqual({
                success: false,
                error: 'Welcome message error'
            });

            expect(consoleSpy).toHaveBeenCalledWith('Twilio welcome SMS error:', error);

            consoleSpy.mockRestore();
        });
    });

    describe('sendAccountLockedMessage', () => {
        beforeEach(() => {
            process.env.TWILIO_ACCOUNT_SID = 'test_sid';
            process.env.TWILIO_AUTH_TOKEN = 'test_token';
            process.env.TWILIO_PHONE_NUMBER = '+18777577620';
            twilioService = new TwilioService();
        });

        it('should send account locked message successfully', async () => {
            const mockMessage = { sid: 'test_locked_sid' };
            mockTwilioClient.messages.create.mockResolvedValue(mockMessage);

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            const result = await twilioService.sendAccountLockedMessage('+18777804236', 'John');

            expect(mockTwilioClient.messages.create).toHaveBeenCalledWith({
                body: 'Hi John, your account has been locked due to multiple failed login attempts. Please contact support to unlock your account.',
                to: '+18777804236',
                from: '+18777577620'
            });

            expect(result).toEqual({
                success: true,
                messageSid: 'test_locked_sid'
            });

            expect(consoleSpy).toHaveBeenCalledWith('Account locked SMS sent to +18777804236. SID: test_locked_sid');

            consoleSpy.mockRestore();
        });

        it('should handle errors and return failure status', async () => {
            const error = new Error('Account locked message error');
            mockTwilioClient.messages.create.mockRejectedValue(error);

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            const result = await twilioService.sendAccountLockedMessage('+18777804236', 'John');

            expect(result).toEqual({
                success: false,
                error: 'Account locked message error'
            });

            expect(consoleSpy).toHaveBeenCalledWith('Twilio account locked SMS error:', error);

            consoleSpy.mockRestore();
        });
    });

    describe('formatPhoneNumber', () => {
        beforeEach(() => {
            process.env.TWILIO_ACCOUNT_SID = 'test_sid';
            process.env.TWILIO_AUTH_TOKEN = 'test_token';
            process.env.TWILIO_PHONE_NUMBER = '+18777577620';
            twilioService = new TwilioService();
        });

        it('should format phone number with + prefix', () => {
            expect(twilioService.formatPhoneNumber('1234567890')).toBe('+1234567890');
            expect(twilioService.formatPhoneNumber('+1234567890')).toBe('+1234567890');
        });

        it('should remove non-digit characters except +', () => {
            expect(twilioService.formatPhoneNumber('+1 (234) 567-890')).toBe('+1234567890');
            expect(twilioService.formatPhoneNumber('1-234-567-890')).toBe('+1234567890');
            expect(twilioService.formatPhoneNumber('+1.234.567.890')).toBe('+1234567890');
        });

        it('should handle empty or invalid input', () => {
            expect(twilioService.formatPhoneNumber('')).toBe('+');
            expect(twilioService.formatPhoneNumber('abc')).toBe('+');
        });
    });

    describe('isValidPhoneNumber', () => {
        beforeEach(() => {
            process.env.TWILIO_ACCOUNT_SID = 'test_sid';
            process.env.TWILIO_AUTH_TOKEN = 'test_token';
            process.env.TWILIO_PHONE_NUMBER = '+18777577620';
            twilioService = new TwilioService();
        });

        it('should validate correct phone numbers', () => {
            expect(twilioService.isValidPhoneNumber('+1234567890')).toBe(true);
            expect(twilioService.isValidPhoneNumber('+1234567890123')).toBe(true);
            expect(twilioService.isValidPhoneNumber('+123456789012345')).toBe(true);
        });

        it('should reject invalid phone numbers', () => {
            expect(twilioService.isValidPhoneNumber('1234567890')).toBe(false); // Missing +
            expect(twilioService.isValidPhoneNumber('+123456789')).toBe(false); // Too short
            expect(twilioService.isValidPhoneNumber('+1234567890123456')).toBe(false); // Too long
            expect(twilioService.isValidPhoneNumber('+abc1234567890')).toBe(false); // Contains letters
            expect(twilioService.isValidPhoneNumber('')).toBe(false); // Empty
        });

        it('should validate formatted phone numbers', () => {
            expect(twilioService.isValidPhoneNumber('+1 (234) 567-890')).toBe(true);
            expect(twilioService.isValidPhoneNumber('1-234-567-890')).toBe(true);
        });

        it('should validate the specific test phone number format', () => {
            expect(twilioService.isValidPhoneNumber('+18777804236')).toBe(true);
            expect(twilioService.formatPhoneNumber('18777804236')).toBe('+18777804236');
        });
    });

    describe('Integration scenarios', () => {
        beforeEach(() => {
            process.env.TWILIO_ACCOUNT_SID = 'test_sid';
            process.env.TWILIO_AUTH_TOKEN = 'test_token';
            process.env.TWILIO_PHONE_NUMBER = '+18777577620';
            twilioService = new TwilioService();
        });

        it('should handle multiple message types in sequence', async () => {
            const mockMessage = { sid: 'test_sid' };
            mockTwilioClient.messages.create.mockResolvedValue(mockMessage);

            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

            // Send verification code
            const verificationResult = await twilioService.sendVerificationCode('+18777804236', '123456');
            expect(verificationResult.success).toBe(true);

            // Send welcome message
            const welcomeResult = await twilioService.sendWelcomeMessage('+18777804236', 'John');
            expect(welcomeResult.success).toBe(true);

            // Send account locked message
            const lockedResult = await twilioService.sendAccountLockedMessage('+18777804236', 'John');
            expect(lockedResult.success).toBe(true);

            expect(mockTwilioClient.messages.create).toHaveBeenCalledTimes(3);

            consoleSpy.mockRestore();
        });

        it('should handle network timeout scenarios', async () => {
            const timeoutError = new Error('Request timeout');
            timeoutError.code = 'ETIMEDOUT';
            mockTwilioClient.messages.create.mockRejectedValue(timeoutError);

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

            await expect(twilioService.sendVerificationCode('+18777804236', '123456'))
                .rejects.toThrow('Failed to send SMS: Request timeout');

            expect(consoleSpy).toHaveBeenCalledWith('Twilio SMS error:', timeoutError);

            consoleSpy.mockRestore();
        });
    });
});

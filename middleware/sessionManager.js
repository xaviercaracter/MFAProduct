const jwt = require('jsonwebtoken');

class SessionManager {
    constructor() {
        this.secretKey = process.env.JWT_SECRET_KEY || 'your-secret-key-here';
        this.sessionTimeout = 600; // 10 minutes in seconds
    }

    createSession(userId) {
        const currentTime = Math.floor(Date.now() / 1000);
        const sessionId = this._generateSessionId();
        
        const payload = {
            userId,
            sessionId,
            iat: currentTime,
            exp: currentTime + this.sessionTimeout
        };
        
        const sessionToken = jwt.sign(payload, this.secretKey);
        
        return {
            sessionId,
            sessionToken,
            expiresAt: new Date((currentTime + this.sessionTimeout) * 1000).toISOString()
        };
    }

    validateSession(sessionToken) {
        try {
            const payload = jwt.verify(sessionToken, this.secretKey);
            return payload;
        } catch (error) {
            return null;
        }
    }

    refreshSession(sessionToken) {
        const payload = this.validateSession(sessionToken);
        if (payload) {
            return this.createSession(payload.userId);
        }
        return null;
    }

    _generateSessionId() {
        return `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

// Middleware to verify session token
const verifySession = (req, res, next) => {
    const sessionManager = new SessionManager();
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'No session token provided' });
    }

    const payload = sessionManager.validateSession(token);
    if (!payload) {
        return res.status(401).json({ message: 'Invalid or expired session' });
    }

    req.user = payload;
    next();
};

module.exports = {
    SessionManager,
    verifySession
}; 
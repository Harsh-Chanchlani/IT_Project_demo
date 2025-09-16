// Import required modules
import express from "express" 
import {isAuthenticated, Logout, register, resetPassword, sendResetToken, Signin, verifyAccount, verifyResetToken} from "../controllers/Auth.js";
import userAuth from "../middlewares/userAuth.js"
import {login as googleLogin} from "../controllers/oAuthController.js";
import {verifyToken as googleVerifyToken} from "../controllers/oAuthController.js";

// Create Express router instance for authentication routes
const authRouter = express.Router();

// Authentication Routes
// Note: All routes are prefixed with /api/auth from server.js

authRouter.post('/register', register);                    // POST /api/auth/register - User registration
authRouter.post('/account-verify', verifyAccount);         // POST /api/auth/account-verify - Email verification
authRouter.post('/singin', Signin);                        // POST /api/auth/signin - User login (note: typo in 'singin')
authRouter.post('/logout', Logout);                        // POST /api/auth/logout - User logout
authRouter.post('/is-auth', userAuth, isAuthenticated);    // POST /api/auth/is-auth - Check authentication status (protected)

// Password Reset Routes
authRouter.post('/send-reset-token', sendResetToken);      // POST /api/auth/send-reset-token - Request password reset
authRouter.post('/verify-reset-token', verifyResetToken);  // POST /api/auth/verify-reset-token - Verify reset token
authRouter.post('/reset-password', resetPassword);         // POST /api/auth/reset-password - Reset password

// OAuth Routes (Google)
authRouter.post('/oauth/google/login', googleLogin);       // POST /api/auth/oauth/google/login - Initiate Google OAuth
authRouter.post('/oauth/google/callback', googleVerifyToken); // POST /api/auth/oauth/google/callback - Handle OAuth callback

export default authRouter;
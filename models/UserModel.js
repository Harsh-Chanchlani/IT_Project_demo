// Import Mongoose for MongoDB operations
import mongoose from "mongoose";

/**
 * User Data Schema Definition
 * Defines the structure and validation rules for user documents in MongoDB
 */
const userSchema = new mongoose.Schema({
    email: {
        type: String, 
        unique: true,       // Ensure email uniqueness across all users
        required: true      // Email is mandatory for registration
    },
    name: {
        type: String,
        required: true      // Full name is required
    },
    password: {
        type: String,
        default: ''         // Default empty for OAuth users who may not have passwords
    },
    verifyToken: {
        type: String,
        default: ''         // Email verification token (UUID)
    },
    verifyTokenExpireAt: {
        type: Number,
        default: 0          // Timestamp when verification token expires
    },
    isAccountVerified: {
        type: Boolean,
        default: false      // Account verification status
    },
    resetToken: {
        type: String,
        default: ''         // Password reset token (UUID)
    },
    resetTokenExpireAt: {
        type: Number,
        default: 0          // Timestamp when reset token expires   
    },
})

/**
 * User Model Creation
 * Creates or reuses existing User model to prevent re-compilation in development
 * Collection name in MongoDB will be 'users' (mongoose pluralizes automatically)
 */
const UserModel = mongoose.models.user || mongoose.model('user', userSchema);

export default UserModel
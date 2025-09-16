// Import required modules for authentication functionality
import UserModel from "../models/UserModel.js";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import transporter from "../config/mailer.js"
import crypto from "crypto"

/**
 * User Registration Controller
 * Creates a new user account with email verification
 * 
 * @param {Object} req - Express request object containing {name, email, password}
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success status
 */
export const register = async(req, res)=>{
    const {name, email, password} = req.body;

    // Validate required fields
    if(!name || !email || !password){
        return res.json({success: false, message: 'Missing Details'});
    }
    
    try{
        // Check if user already exists in database
        const existingUser = await UserModel.findOne({email})
        if(existingUser){
            return res.json({success: false, message: "User already exists"});
        }
        
        // Hash password with bcrypt (10 salt rounds for security)
        const hashedPass = await bcrypt.hash(password, 10);
        
        // Generate unique verification token using crypto.randomUUID()
        const verifyToken = crypto.randomUUID();
        
        // Create new user object with hashed password and verification token
        const user = new UserModel({
            name, 
            email, 
            password: hashedPass, 
            verifyToken, 
            verifyTokenExpireAt: Date.now() + 1000*60*15, // 15 minutes expiration
        });
        
        // Generate verification URL for email (frontend URL)
        const verifyUrl = `http://localhost:5173/verifyAccount?token=${verifyToken}&email=${email}`;
        
        // Save user to database
        await user.save();
        
        // Configure email options for verification email
        const mailOptions ={
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to this website',
            text: `Welcome to this website!  
                    Your account has been created with email id: ${email}.  

                    Kindly click on the URL below to verify your account:${verifyUrl}  

                    Please note: This link will expire in 15 minutes. If it expires, you'll need to request a new verification link.  
`
        }
        
        // Attempt to send verification email
        try {
            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.error('Error sending email:', emailError);
            // Continue with registration even if email fails
        }
        
        return res.json({success: true})
    }
    catch(error){
        res.json({success: false, message: error.message});
    }
}

/**
 * Email Verification Controller
 * Verifies user's email address using the token sent via email
 * 
 * @param {Object} req - Express request object containing {token, email}
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with verification status and JWT token
 */
export const verifyAccount = async(req, res)=> {
    const {token, email} = req.body;
    
    // Validate required parameters
    if(!token || !email){
        return res.json({ success: false, message: "Missing details" })
    }
    
    try{
        // Find user by email address
        const user = await UserModel.findOne({email});
        if(!user){
            return res.json({ success: false, message: "User not found" });
        }
        
        // Verify that the provided token matches the stored token
        const matched = (user.verifyToken==token);
        if(!matched){
            return res.json({ success: false, message: "Link in not valid" });
        }
        
        // Check if token has expired (15 minutes from creation)
        if(user.verifyTokenExpireAt < Date.now()){
            return res.json({ success: false, message: "Link is Expired" });
        }
        
        // Update user account as verified and clear verification token
        const update = await UserModel.updateOne(
            {email}, 
            {
                isAccountVerified: true, 
                verifyToken: '', 
                verifyTokenExpireAt: 0
            }
        );
        
        // Generate JWT token for immediate authentication after verification
        const jwttoken = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
        
        // Set JWT token as HTTP-only cookie for security
        res.cookie('token', jwttoken, {
            httpOnly: true,     // Prevents XSS attacks
            secure: true,       // HTTPS only
            sameSite: "None",   // Cross-site requests allowed
            maxAge: 7*24*60*60*1000  // 7 days expiration
        })
        
        return res.json({ success: true, message: "Account verified" });
    }catch(error){
        return res.json({ success: false, message: error.message });
    }
}

/**
 * User Sign-in Controller
 * Authenticates user with email and password
 * 
 * @param {Object} req - Express request object containing {email, password}
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with authentication status
 */
export const Signin = async(req, res)=>{
    const {email, password} = req.body;
    
    // Validate required fields
    if(!email || !password){
        return res.json({success: false, message:'Email and password are required'});
    }
    
    try{
        // Find user by email
        const user = await UserModel.findOne({email});
        if(!user){
            return res.json({success: false, message:'Invalid email'});
        }
        
        // Compare provided password with stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch){
            return res.json({success: false, message:'Incorrect password'});
        }
        
        // Generate JWT token for authenticated session
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '7d'});
        
        // Set JWT token as secure HTTP-only cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 7*24*60*60*1000  // 7 days
        })
        
        return res.json({success: true})
        
    }
    catch(error){
        return res.json({success: false, message: error.message});
    }
}

/**
 * User Logout Controller
 * Clears the authentication cookie to log out the user
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with logout status
 */
export const Logout = async(req, res)=>{
    try{
        // Clear the JWT token cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: true,
            sameSite: "None",
        })
        return res.json({success: true, message: 'Logged out'})
    }
    catch(error){
        return res.json({success: false, message: error.message});
    }
}

/**
 * Authentication Status Check Controller
 * Checks if user is currently authenticated (used with userAuth middleware)
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response confirming authentication
 */
export const isAuthenticated = async(req, res)=>{
    try{
        // If this function is reached, user is authenticated (middleware passed)
        return res.json({success:true}) 
    }catch(error){
        return res.json({success: false, message: error.message})
    }
}


/**
 * Password Reset Request Controller
 * Generates and sends a password reset token via email
 * 
 * @param {Object} req - Express request object containing {email}
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with operation status
 */
export const sendResetToken = async(req, res) =>{
    const {email} = req.body;
    
    // Validate email parameter
    if(!email) {
        return res.json({success: false, message: "Email required"});
    }
    
    try{
        // Find user by email address
        const user = await UserModel.findOne({email});
        if(!user){
            return res.json({success: false, message: "User not found"});
        }
        
        // Generate unique reset token
        const resetToken = crypto.randomUUID();
        
        // Update user with reset token and expiration (15 minutes)
        const update = await UserModel.updateOne(
            {email}, 
            {
                resetToken: resetToken, 
                resetTokenExpireAt: Date.now()+1000*60*15
            }
        );

        // Create password reset URL for frontend
        const verifyUrl = `http://localhost:5173/verifyReset?token=${resetToken}&email=${email}`;

        // Configure password reset email
        const mailOptions ={
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Password Rest Link',
            text: `We received a request to reset your password for your account linked with email: ${email}.
            Your link for resetting your password is: ${verifyUrl}
            This link will expire in 15 minutes. If you did not request this, please ignore this email.  
            For security reasons, do not share this link with anyone.`
        }
        
        // Attempt to send reset email
        try {
            await transporter.sendMail(mailOptions);
        } catch (emailError) {
            console.error('Error sending email:', emailError);
        }

        return res.json({success: true, message: "Reset link sent to email"});

    }catch(error){
        return res.json({ success: false, message: error.message });
    }
}

/**
 * Password Reset Token Verification Controller
 * Verifies the password reset token and prepares for password change
 * 
 * @param {Object} req - Express request object containing {email, resetToken}
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with verification status
 */
export const verifyResetToken = async(req, res)=>{
    const {email, resetToken} = req.body;

    // Validate required parameters
    if(!email || !resetToken){
        return res.json({success:false, message: "Missing Details."})
    }
    
    try{
        // Find user by email
        const user = await UserModel.findOne({email});
        if(!user){
            return res.json({success: false, message: "User not found."})
        }
        
        // Verify reset token matches and exists
        if(user.resetToken==='' || user.resetToken!==resetToken){
            return res.json({success: false, message: "Invalid Link."})
        }
        
        // Check if token has expired
        if(user.resetTokenExpireAt < Date.now()){
            return res.json({success: false, message: "Link expired"})
        }
        
        // Clear reset token after successful verification (one-time use)
        user.resetToken = '';
        user.resetTokenExpireAt = 0;
        await user.save();
        
        return res.json({success: true, message: "Enter new password"})
    }
    catch(error){
        return res.json({success: false, message: error.message})
    }
}

/**
 * Password Reset Controller
 * Updates user's password with the new password provided
 * 
 * @param {Object} req - Express request object containing {email, newPassword}
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with reset status
 */
export const resetPassword = async(req, res)=>{
    const {email, newPassword} = req.body;
    
    // Validate new password
    if(!newPassword){
        return res.json({success:false, message: "New password is required."});  
    }
    
    try{
        // Find user by email
        const user = await UserModel.findOne({email});
        if(!user){
            return res.json({success:false, message: "User not found."});  
        }
        
        // Hash the new password with bcrypt
        const hashedPass = await bcrypt.hash(newPassword, 10);
        user.password = hashedPass
        await user.save();
        
        return res.json({success:true, message: "Password has been reset successfully."});  
    }catch(error){
        return res.json({success:false, message: error.message});  
    }
}
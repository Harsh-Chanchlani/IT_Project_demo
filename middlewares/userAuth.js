// Import required modules
import jwt from 'jsonwebtoken'

/**
 * User Authentication Middleware
 * Validates JWT token from HTTP-only cookies and adds userId to request body
 * Used to protect routes that require authentication
 * 
 * @param {Object} req - Express request object (expects JWT token in cookies)
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response if unauthorized, otherwise calls next()
 */
const userAuth = async(req, res, next)=>{
    // Extract JWT token from HTTP-only cookies
    const {token} = req.cookies;
    
    // Check if token exists
    if(!token){
        return res.json({success: false, message: "Not Authorized Login Again."})
    }
    
    try{
        // Verify and decode JWT token using secret key
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET)
        
        // Check if token contains valid user ID
        if(tokenDecode.id){
            // Add user ID to request body for use in subsequent middleware/routes
            req.body.userId = tokenDecode.id
        }
        else {
            return res.json({success: false, message: "Not Authorized Login Again."})
        }
        
        // Token is valid, proceed to next middleware/route handler
        next();
    }
    catch(error){
        // Token verification failed (expired, invalid, etc.)
        console.log(error.message)
        return res.json({success: false, message: error.message})
    }
}

export default userAuth;
// Import required modules for Google OAuth integration
import express from "express";
import UserModel from "../models/UserModel.js";
import jwt from "jsonwebtoken";
import axios from "axios";
import dotenv from "dotenv";

/**
 * Google OAuth Login Initiation Controller
 * Redirects user to Google OAuth consent screen
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Redirect} Redirects to Google OAuth authorization URL
 */
export const login = async(req, res)=> {
    // Construct Google OAuth parameters
    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        response_type: 'code',          // Request authorization code
        scope: 'email profile',         // Request email and profile access
    })
    
    // Build Google OAuth authorization URL
    const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
    
    // Redirect user to Google for authentication
    res.redirect(googleUrl);
}

/**
 * Google OAuth Callback Controller
 * Handles the callback from Google after user authorization
 * Exchanges authorization code for access token and creates/authenticates user
 * 
 * @param {Object} req - Express request object containing authorization code
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with authentication status
 */
export const verifyToken = async(req,res)=> {
    const {code} = req.query;
    
    // Prepare parameters for token exchange
    const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URI,
        code: code,                     // Authorization code from Google
        grant_type: 'authorization_code',
    });
    
    // Exchange authorization code for access token
    const googleUrl = `https://oauth2.googleapis.com/token?${params.toString()}`;
    const response = await axios.post(googleUrl);
    const {access_token} = response.data;

    // Use access token to get user profile information
    const userData = await axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${access_token}`);
    const {email, name} = userData.data;

    // Check if user already exists in our database
    const user = await UserModel.findOne({email});
    
    // Generate JWT token for the user (email and name included for OAuth users)
    const token = jwt.sign({email, name}, process.env.JWT_SECRET, {expiresIn: '7d'});
    
   if(!user){
        // User doesn't exist - create new user account
        const newUser = new UserModel({
            email, 
            name, 
            isAccountVerified: true     // OAuth users are pre-verified
        });
        await newUser.save();
        
        // Set authentication cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 7*24*60*60*1000     // 7 days
        })
        
        return res.json({success: true, message: 'User registered successfully'});
   }else{
        // User already exists - just authenticate them
        res.cookie('token', token, {
            httpOnly: true,
            secure: true,
            sameSite: "None",
            maxAge: 7*24*60*60*1000     // 7 days
        })
        
        return res.json({success: true, message: 'User logged in successfully'});
   }
}
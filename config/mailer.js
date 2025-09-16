// Import required modules for email functionality
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config();

/**
 * Email Transporter Configuration
 * Creates a reusable transporter object using SMTP transport
 * Configured for Gmail SMTP service with custom settings
 */
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,         // SMTP server host (e.g., smtp.gmail.com)
    port: process.env.EMAIL_PORT,         // SMTP port (587 for TLS, 465 for SSL)
    auth: {
        user: process.env.SMTP_USER,      // SMTP username (email address)
        pass: process.env.SMTP_PASSWORD,  // SMTP password (app password for Gmail)
    },
    tls: {
        rejectUnauthorized: false         // Allow self-signed certificates
    },
    connectionTimeout: 20000,             // Connection timeout: 20 seconds
    greetingTimeout: 20000,               // Greeting timeout: 20 seconds  
    socketTimeout: 20000                  // Socket timeout: 20 seconds
})

export default transporter

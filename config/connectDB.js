// Import Mongoose for MongoDB operations
import mongoose from "mongoose";

/**
 * Database Connection Configuration
 * Establishes connection to MongoDB database
 * 
 * @returns {Promise} MongoDB connection promise
 */
const connectdb = async()=>{
    // Set up connection event listener for successful connections
    mongoose.connection.on('connected', ()=>{
        console.log("Database Connected✅");
    })
    
    // Connect to MongoDB using connection string from environment variables
    // Database name: 'coding-leanring' (Note: appears to be a typo for 'coding-learning')
    await mongoose.connect(`${process.env.MONGO_URI}/coding-leanring`)
}

export default connectdb
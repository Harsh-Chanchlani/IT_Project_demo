// Import required modules for server setup
import express from "express"
import cors from "cors";
import 'dotenv/config';                    // Load environment variables from .env file
import cookieParser from "cookie-parser";

// Import custom modules
import connectdb from "./config/connectDB.js";  // Database connection
import authRouter from "./routes/authRoutes.js"; // Authentication routes

// Initialize Express application
const app = express();

// Set server port from environment or default to 4000
const port = process.env.PORT || 4000

// Initialize database connection before starting server
await connectdb();

// Configure middleware
app.use(express.json());           // Parse JSON request bodies
app.use(cookieParser());           // Parse cookies from requests

// Configure CORS (Cross-Origin Resource Sharing)
// Allow requests from frontend running on localhost:5173 with credentials
app.use(cors({ 
    origin: ['http://localhost:5173'], 
    credentials: true 
}));

// Mount authentication routes under /api/auth prefix
app.use("/api/auth", authRouter);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('Server is healthy');
});

// Start the server and listen on specified port
app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`);
})
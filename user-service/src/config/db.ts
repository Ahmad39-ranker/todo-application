// user-service/src/config/db.ts

import mongoose from 'mongoose';
import dotenv from 'dotenv'; // Import dotenv to load environment variables

dotenv.config(); // Load environment variables from .env file

// MongoDB connection URI for local development.
// Explicitly use '127.0.0.1' (IPv4 loopback) instead of 'localhost'
// to avoid potential IPv6 connection issues.
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/userdb';

const connectDB = () => { // Removed 'async' keyword as we're not using await directly here
    mongoose
        .connect(MONGODB_URI)
        .then(() => {
            console.log('User Service MongoDB connected successfully!');
        })
        .catch((err: any) => {
            console.error('User Service MongoDB connection error:', err.message);
            // Exit process with failure if connection fails
            process.exit(1);
        });
};

export default connectDB;

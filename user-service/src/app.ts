// user-service/src/app.ts

import express from 'express';
import connectDB from './config/db';
import userRoutes from './routes/userRoutes';
import dotenv from 'dotenv';
import cors from 'cors'; // ✨ NEW: Import cors middleware 

dotenv.config();

const app = express();

// Connect to the database
connectDB();

// ✨ NEW: Use CORS middleware 
// This allows requests from any origin.
// For production, you would typically restrict this to specific frontend domains:
// app.use(cors({ origin: 'http://your-frontend-domain.com' }));
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Basic route for testing
app.get('/', (req, res) => {
    res.send('User Service API is running!');
});

// Use the user routes for authentication
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));

import express from 'express';
import connectDB from './config/db';
import todoRoutes from './routes/todoRoutes';
import dotenv from 'dotenv';
import cors from 'cors'; // NEW: Import cors middleware 

dotenv.config();

const app = express();

// Connect to the database
connectDB();

// NEW: Use CORS middleware 
// This allows requests from any origin.
// In production, you would typically restrict this to specific frontend domains:
// app.use(cors({ origin: 'http://your-frontend-domain.com' }));
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

// Basic route for testing
app.get('/', (req, res) => {
    res.send('Todo Service API is running!');
});

// Use the todo routes for managing todos.
app.use('/api/todos', todoRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Todo Service running on port ${PORT}`));

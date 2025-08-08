    import mongoose from 'mongoose';
    import dotenv from 'dotenv';

    dotenv.config();

    // MongoDB connection URI for local development.
    // Use '127.0.0.1' and a different database name (e.g., 'tododb').
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tododb';

    const connectDB = async () => {
        try {
            await mongoose.connect(MONGODB_URI);
            console.log('Todo Service MongoDB connected successfully!');
        } catch (error: any) {
            console.error('Todo Service MongoDB connection error:', error.message);
            process.exit(1);
        }
    };

    export default connectDB;
    
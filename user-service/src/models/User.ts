import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique user IDs

// Define an interface for the User document
export interface IUser extends Document {
    uuid: string;
    user_email: string;
    user_pwd: string;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

// Define the User Schema
const UserSchema: Schema = new Schema({
    uuid: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4 
    },
    user_email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true, 
        trim: true,
        match: [/.+@.+\..+/, 'Please enter a valid email address'] // Basic email regex validation
    },
    user_pwd: {
        type: String,
        required: true,
        minlength: [6, 'Password must be at least 6 characters long'] // Enforce minimum password length
    }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

// Pre-save hook to hash the password before saving a new user or updating password
UserSchema.pre<IUser>('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('user_pwd')) {
        return next();
    }
    try {
        // Generate a salt
        const salt = await bcrypt.genSalt(10);
        // Hash the password with the salt
        this.user_pwd = await bcrypt.hash(this.user_pwd, salt);
        next();
    } catch (error: any) {
        next(error); // Pass error to the next middleware
    }
});

// Method to compare candidate password with the hashed password in the database
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.user_pwd);
};

// Create and export the User model
const User = mongoose.model<IUser>('User', UserSchema);
export default User;

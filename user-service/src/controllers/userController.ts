import { Request, Response } from 'express';
import User, { IUser } from '../models/User'; // Import the User model
import jwt from 'jsonwebtoken'; // For generating JWTs
import dotenv from 'dotenv'; // For loading environment variables

dotenv.config(); // Load environment variables from .env file

// Define your JWT secret key. IMPORTANT: Use a strong, unique key in production!
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretjwtkey'; // Ensure this matches your .env

/**
 * @description Handles user registration logic.
 * @route POST /api/users/register
 * @access Public
 */
export const registerUser = async (req: Request, res: Response) => {
    const { user_email, user_pwd } = req.body;

    // 1. Validate input fields
    if (!user_email || !user_pwd) {
        return res.status(400).json({ message: 'Please enter all fields (email and password)' });
    }

    // Basic email format validation
    const emailRegex = /.+@.+\..+/;
    if (!emailRegex.test(user_email)) {
        return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    // Password length validation (as per schema minlength)
    if (user_pwd.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    try {
        // 2. Check if user already exists
        let user: IUser | null = await User.findOne({ user_email });

        if (user) {
            // 409 Conflict if email is already in use
            return res.status(409).json({ message: 'User with that email already exists' });
        }

        // 3. Create new user instance
        user = new User({
            user_email,
            user_pwd // Password will be hashed by the pre-save hook in the User model
        });

        // 4. Save the user to the database
        await user.save();

        // 5. Generate JWT for immediate login
        const payload = {
            user: {
                id: user.uuid // Use the unique UUID as the identifier in the token
            }
        };

        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '1h' }, // Token expires in 1 hour
            (err, token) => {
                if (err) throw err;
                // 6. Return 201 Created with success message and token
                res.status(201).json({
                    message: 'User registered successfully!',
                    user: {
                        uuid: user?.uuid,
                        user_email: user?.user_email
                    },
                    token // Send the token back for immediate authentication
                });
            }
        );

    } catch (error: any) {
        console.error('Registration error:', error.message);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: 'Server error during registration' });
    }
};

/**
 * @description Handles user login logic.
 * @route POST /api/users/login
 * @access Public
 */
export const loginUser = async (req: Request, res: Response) => {
    const { user_email, user_pwd } = req.body;

    // 1. Validate input fields
    if (!user_email || !user_pwd) {
        return res.status(400).json({ message: 'Please enter all fields (email and password)' });
    }

    try {
        // 2. Check if user exists
        const user: IUser | null = await User.findOne({ user_email });

        if (!user) {
            // 401 Unauthorized if user not found
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 3. Compare provided password with hashed password in DB
        const isMatch = await user.comparePassword(user_pwd);

        if (!isMatch) {
            // 401 Unauthorized if passwords do not match
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // 4. Generate JWT
        const payload = {
            user: {
                id: user.uuid // Use the unique UUID as the identifier in the token
            }
        };

        jwt.sign(
            payload,
            JWT_SECRET,
            { expiresIn: '1h' }, // Token expires in 1 hour
            (err, token) => {
                if (err) {
                    return res.status(500).json({ message: 'Server error during login' });
                }
                // 5. Return 200 OK with the JWT
                res.status(200).json({
                    message: 'Login successful! Welcome back!',
                    token
                });
            }
        );

    } catch (error: any) {
        console.error('Login error:', error.message);
        res.status(500).json({ message: 'Server error during login' });
    }
};

import { Router } from 'express';
import { registerUser, loginUser } from '../controllers/userController'; // Import controller functions

const router = Router();

/**
 * @route POST /api/users/register
 * @description Register a new user
 * @access Public
 */
router.post('/register', registerUser);

/**
 * @route POST /api/users/login
 * @description Authenticate user & get token
 * @access Public
 */
router.post('/login', loginUser);

export default router;

import { Router } from 'express';
import { createTodo, getTodos, updateTodo, deleteTodo } from '../controllers/todoController'; // Import controller functions
import auth from '../middleware/auth'; // Import the authentication middleware

const router = Router();

// All routes below this line will use the 'auth' middleware,
// meaning they require a valid JWT for access.

/**
 * @route POST /api/todos
 * @description Create a new todo item
 * @access Private
 */
router.post('/', auth, createTodo);

/**
 * @route GET /api/todos
 * @description Get all todo items for the authenticated user
 * @access Private
 */
router.get('/', auth, getTodos);

/**
 * @route PUT /api/todos/:uuid
 * @description Update an existing todo item
 * @access Private (only owner can update)
 */
router.put('/:uuid', auth, updateTodo);

/**
 * @route DELETE /api/todos/:uuid
 * @description Delete a todo item
 * @access Private (only owner can delete)
 */
router.delete('/:uuid', auth, deleteTodo);

export default router;

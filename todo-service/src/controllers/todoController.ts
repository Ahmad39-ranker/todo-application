// todo-service/src/controllers/todoController.ts

import { Request, Response } from 'express';
import Todo, { ITodo } from '../models/Todo'; // Import the Todo model
import { v4 as uuidv4 } from 'uuid'; // For generating UUIDs for new todos

/**
 * @description Create a new todo item.
 * @route POST /api/todos
 * @access Private (requires JWT)
 */
export const createTodo = async (req: Request, res: Response) => {
    const { content } = req.body;
    const user_uuid = req.user?.id; // Get user_uuid from authenticated request

    // 1. Validate input
    if (!content || content.trim() === '') {
        return res.status(400).json({ message: 'Todo content is required' });
    }
    if (!user_uuid) {
        // This should ideally be caught by auth middleware, but good for type safety
        return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
        // 2. Create new todo instance
        const newTodo: ITodo = new Todo({
            uuid: uuidv4(), // Generate a unique UUID for the todo
            content,
            user_uuid, // Associate the todo with the authenticated user
            completed: false //Default to not completed-for front-end 
        });

        // 3. Save the todo to the database
        await newTodo.save();

        // 4. Return 201 Created with the new todo item
        res.status(201).json({
            message: 'Todo created successfully! ',
            todo: newTodo
        });

    } catch (error: any) {
        console.error('Create Todo error:', error.message);
        res.status(500).json({ message: 'Server error during todo creation' });
    }
};

/**
 * @description Get all todo items for the authenticated user.
 * @route GET /api/todos
 * @access Private (requires JWT)
 */
export const getTodos = async (req: Request, res: Response) => {
    const user_uuid = req.user?.id; // Get user_uuid from authenticated request

    if (!user_uuid) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
        // 1. Find all todos belonging to the authenticated user
        const todos: ITodo[] = await Todo.find({ user_uuid });

        // 2. Return 200 OK with the list of todos (empty array if none)
        res.status(200).json({
            message: 'Todos fetched successfully! ',
            todos
        });

    } catch (error: any) {
        console.error('Get Todos error:', error.message);
        res.status(500).json({ message: 'Server error during fetching todos' });
    }
};

/**
 * @description Update an existing todo item.
 * @route PUT /api/todos/:uuid
 * @access Private (requires JWT, only owner can update)
 */
export const updateTodo = async (req: Request, res: Response) => {
    const { uuid } = req.params; // Get todo UUID from URL parameters
    const { content, completed } = req.body; // Get updated content/status from body
    const user_uuid = req.user?.id; // Get user_uuid from authenticated request

    // 1. Validate input
    if (!user_uuid) {
        return res.status(401).json({ message: 'User not authenticated' });
    }
    if (!content && completed === undefined) {
        return res.status(400).json({ message: 'No update data provided (content or completed status)' });
    }

    try {
        // 2. Find the todo by its UUID and ensure it belongs to the authenticated user
        const todo: ITodo | null = await Todo.findOne({ uuid, user_uuid });

        if (!todo) {
            // 404 Not Found if todo doesn't exist or doesn't belong to the user
            return res.status(404).json({ message: 'Todo not found or not authorized to update' });
        }

        // 3. Update todo fields if provided
        if (content !== undefined) {
            todo.content = content.trim();
        }
        if (completed !== undefined) {
            todo.completed = completed;
        }

        // 4. Save the updated todo
        await todo.save();

        // 5. Return 200 OK with the updated todo item
        res.status(200).json({
            message: 'Todo updated successfully! ',
            todo
        });

    } catch (error: any) {
        console.error('Update Todo error:', error.message);
        res.status(500).json({ message: 'Server error during todo update' });
    }
};

/**
 * @description Delete a todo item.
 * @route DELETE /api/todos/:uuid
 * @access Private (requires JWT, only owner can delete)
 */
export const deleteTodo = async (req: Request, res: Response) => {
    const { uuid } = req.params; // Get todo UUID from URL parameters
    const user_uuid = req.user?.id; // Get user_uuid from authenticated request

    // 1. Validate input
    if (!user_uuid) {
        return res.status(401).json({ message: 'User not authenticated' });
    }

    try {
        // 2. Find and delete the todo by its UUID and ensure it belongs to the authenticated user
        const result = await Todo.deleteOne({ uuid, user_uuid });

        if (result.deletedCount === 0) {
            // 404 Not Found if todo doesn't exist or doesn't belong to the user
            return res.status(404).json({ message: 'Todo not found or not authorized to delete' });
        }

        // 3. Return 204 No Content status on successful deletion
        res.status(204).send(); // No content to send back

    } catch (error: any) {
        console.error('Delete Todo error:', error.message);
        res.status(500).json({ message: 'Server error during todo deletion' });
    }
};

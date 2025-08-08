import mongoose, { Document, Schema } from 'mongoose';
import { v4 as uuidv4 } from 'uuid'; // Import uuid for unique todo IDs

// Define an interface for the Todo document
export interface ITodo extends Document {
    uuid: string;       // Unique ID for the todo item
    content: string;    // The actual todo description/content
    user_uuid: string;  // The UUID of the user who owns this todo (links to User Service)
    completed: boolean; // Status of the todo item (e.g., true if completed)
}

// Define the Todo Schema
const TodoSchema: Schema = new Schema({
    uuid: {
        type: String,
        required: true,
        unique: true,
        default: uuidv4 // Automatically generate UUID for new todos
    },
    content: {
        type: String,
        required: true,
        trim: true, // Remove whitespace from both ends of a string
        minlength: [1, 'Todo content cannot be empty'] // Ensure content is not empty
    },
    user_uuid: {
        type: String,
        required: true,
        // In a real-world scenario with separate services, you wouldn't have
        // a direct Mongoose 'ref' here, as the User model is in a different service.
        // The link is logical, maintained by the 'user_uuid' field.
    },
    completed: {
        type: Boolean,
        default: false // Default status is not completed
    }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

// Create and export the Todo model
const Todo = mongoose.model<ITodo>('Todo', TodoSchema);
export default Todo;

// import { Request, Response } from 'express';
// import { ParamsDictionary } from 'express-serve-static-core';
// import { ParsedQs } from 'qs';
// import { registerUser, loginUser, createTodo, getTodos, updateTodo, deleteTodo } from '@src/controllers/user.controller';
// import * as userService from '@src/services/user.service';
// import * as jwt from 'jsonwebtoken';

// // Mock the services and JWT library
// jest.mock('@src/services/user.service');
// jest.mock('jsonwebtoken');

// // Define a custom type that extends the Express Request with a 'user' property
// interface AuthenticatedRequest<
//   P = ParamsDictionary,
//   ResBody = any,
//   ReqBody = any,
//   ReqQuery = ParsedQs,
// > extends Request<P, ResBody, ReqBody, ReqQuery> {
//   user: {
//     id: string;
//     username: string;
//   };
// }

// // A helper to create a mock Request object
// const mockRequest = (body: any = {}, user: any = {}): Partial<AuthenticatedRequest> => ({
//   body,
//   user,
// });

// // A helper to create a mock Response object
// const mockResponse = (): Partial<Response> => {
//   const res: Partial<Response> = {};
//   res.status = jest.fn(() => res) as any;
//   res.json = jest.fn(() => res) as any;
//   res.send = jest.fn(() => res) as any;
//   return res;
// };

// // --- Test Suite for User Registration and Login ---
// describe('User Controller', () => {

//   // Test for successful user registration
//   describe('registerUser', () => {
//     it('should register a new user and return a 201 status', async () => {
//       // Mock the service to return a successful result
//       (userService.registerUser as jest.Mock).mockResolvedValueOnce({ success: true });

//       const req = mockRequest({ username: 'testuser', password: 'password123' });
//       const res = mockResponse() as Response;

//       await registerUser(req as Request, res);

//       expect(res.status).toHaveBeenCalledWith(201);
//       expect(res.json).toHaveBeenCalledWith({ message: 'User registered successfully' });
//     });

//     it('should return a 409 status if username is already taken', async () => {
//       // Mock the service to return a conflict error
//       (userService.registerUser as jest.Mock).mockResolvedValueOnce({ success: false, error: 'Username already taken' });

//       const req = mockRequest({ username: 'existinguser', password: 'password123' });
//       const res = mockResponse() as Response;

//       await registerUser(req as Request, res);

//       expect(res.status).toHaveBeenCalledWith(409);
//       expect(res.json).toHaveBeenCalledWith({ error: 'Username already taken' });
//     });
//   });

//   // Test for user login
//   describe('loginUser', () => {
//     it('should log in a user and return a JWT token with 200 status', async () => {
//       // Mock the service to return a user object
//       (userService.authenticateUser as jest.Mock).mockResolvedValueOnce({
//         success: true,
//         user: { id: 'test-user-id', username: 'testuser' }
//       });
//       // Mock the JWT sign function
//       (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

//       const req = mockRequest({ username: 'testuser', password: 'password123' });
//       const res = mockResponse() as Response;

//       await loginUser(req as Request, res);

//       expect(res.status).toHaveBeenCalledWith(200);
//       expect(res.json).toHaveBeenCalledWith({ token: 'mock-jwt-token' });
//     });

//     it('should return a 401 status for invalid credentials', async () => {
//       // Mock the service to return an authentication failure
//       (userService.authenticateUser as jest.Mock).mockResolvedValueOnce({ success: false, error: 'Invalid credentials' });

//       const req = mockRequest({ username: 'testuser', password: 'wrongpassword' });
//       const res = mockResponse() as Response;

//       await loginUser(req as Request, res);

//       expect(res.status).toHaveBeenCalledWith(401);
//       expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
//     });
//   });

//   // --- Test Suite for Todo List Operations ---
//   describe('Todo Operations', () => {
//     const mockTodoInstance = {
//       _id: '123',
//       title: 'New task',
//       userId: 'test-user-id',
//       completed: false
//     };

//     const mockTodos = [mockTodoInstance];

//     describe('createTodo', () => {
//       it('should create a new todo and return a 201 status', async () => {
//         (userService.createTodo as jest.Mock).mockResolvedValueOnce(mockTodoInstance);

//         // We now pass the correct AuthenticatedRequest type to our mock
//         const req = mockRequest({ title: 'New task' }, { id: 'test-user-id', username: 'testuser' }) as AuthenticatedRequest;
//         const res = mockResponse() as Response;

//         await createTodo(req, res);

//         expect(res.status).toHaveBeenCalledWith(201);
//         expect(res.json).toHaveBeenCalledWith(mockTodoInstance);
//       });
//     });

//     describe('getTodos', () => {
//       it('should return a list of todos for the authenticated user', async () => {
//         (userService.getTodos as jest.Mock).mockResolvedValueOnce(mockTodos);

//         const req = mockRequest({}, { id: 'test-user-id', username: 'testuser' }) as AuthenticatedRequest;
//         const res = mockResponse() as Response;

//         await getTodos(req, res);

//         expect(res.status).toHaveBeenCalledWith(200);
//         expect(res.json).toHaveBeenCalledWith(mockTodos);
//       });
//     });

//     describe('updateTodo', () => {
//       it('should update a todo and return the updated object with 200 status', async () => {
//         const mockUpdatedTodo = { ...mockTodoInstance, completed: true };
//         (userService.updateTodo as jest.Mock).mockResolvedValueOnce(mockUpdatedTodo);

//         const req = mockRequest({ completed: true }, { id: 'test-user-id', username: 'testuser' }) as AuthenticatedRequest;
//         req.params = { todoId: '123' };
//         const res = mockResponse() as Response;

//         await updateTodo(req, res);

//         expect(res.status).toHaveBeenCalledWith(200);
//         expect(res.json).toHaveBeenCalledWith(mockUpdatedTodo);
//       });
//     });

//     describe('deleteTodo', () => {
//       it('should delete a todo and return a 204 status', async () => {
//         (userService.deleteTodo as jest.Mock).mockResolvedValueOnce({ success: true });

//         const req = mockRequest({}, { id: 'test-user-id', username: 'testuser' }) as AuthenticatedRequest;
//         req.params = { todoId: '123' };
//         const res = mockResponse() as Response;

//         await deleteTodo(req, res);

//         expect(res.status).toHaveBeenCalledWith(204); // No Content
//         expect(res.send).toHaveBeenCalled();
//       });
//     });
//   });
// });

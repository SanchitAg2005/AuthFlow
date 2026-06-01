const { z } = require('zod');

// Authentication schemas
exports.registerSchema = z.object({
  body: z.object({
    name: z.string({ required_error: 'Name is required' }).trim().min(2, 'Name must be at least 2 characters'),
    email: z.string({ required_error: 'Email is required' }).trim().email('Invalid email address format'),
    password: z.string({ required_error: 'Password is required' }).min(8, 'Password must be at least 8 characters long')
  })
});

exports.loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).trim().email('Invalid email address format'),
    password: z.string({ required_error: 'Password is required' })
  })
});

// Task schemas
exports.createTaskSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }).trim().min(1, 'Title cannot be empty').max(100, 'Title cannot exceed 100 characters'),
    description: z.string().trim().max(500, 'Description cannot exceed 500 characters').optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional()
  })
});

exports.updateTaskSchema = z.object({
  body: z.object({
    title: z.string().trim().min(1, 'Title cannot be empty').max(100, 'Title cannot exceed 100 characters').optional(),
    description: z.string().trim().max(500, 'Description cannot exceed 500 characters').optional(),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE']).optional()
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid task ID format')
  })
});

exports.taskIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid task ID format')
  })
});

exports.queryTaskSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/, 'Page must be a valid number').transform(Number).default('1'),
    limit: z.string().regex(/^\d+$/, 'Limit must be a valid number').transform(Number).default('10'),
    status: z.enum(['TODO', 'IN_PROGRESS', 'DONE'], { error_map: () => ({ message: 'Invalid status filter' }) }).optional(),
    search: z.string().trim().optional()
  })
});

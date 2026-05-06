const { z } = require('zod');

/** Schema for creating a new user */
const createUserSchema = z.object({
  firstName: z
    .string({ required_error: 'First name is required' })
    .min(1, 'First name cannot be empty')
    .max(50, 'First name must be at most 50 characters'),
  lastName: z
    .string({ required_error: 'Last name is required' })
    .min(1, 'Last name cannot be empty')
    .max(50, 'Last name must be at most 50 characters'),
  email: z
    .string({ required_error: 'Email is required' })
    .email('Invalid email format'),
  phone: z
    .string()
    .max(20, 'Phone must be at most 20 characters')
    .nullable()
    .optional(),
  departmentId: z
    .number({ required_error: 'Department ID is required' })
    .int('Department ID must be an integer')
    .positive('Department ID must be positive'),
});

/** Schema for updating an existing user */
const updateUserSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name cannot be empty')
    .max(50, 'First name must be at most 50 characters')
    .optional(),
  lastName: z
    .string()
    .min(1, 'Last name cannot be empty')
    .max(50, 'Last name must be at most 50 characters')
    .optional(),
  email: z
    .string()
    .email('Invalid email format')
    .optional(),
  phone: z
    .string()
    .max(20, 'Phone must be at most 20 characters')
    .nullable()
    .optional(),
  departmentId: z
    .number()
    .int('Department ID must be an integer')
    .positive('Department ID must be positive')
    .optional(),
});

/** Schema for query params: search, sort, pagination */
const queryParamsSchema = z.object({
  search: z.string().optional(),
  sortBy: z.enum(['firstName', 'lastName', 'email', 'createdAt']).optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
});

module.exports = { createUserSchema, updateUserSchema, queryParamsSchema };

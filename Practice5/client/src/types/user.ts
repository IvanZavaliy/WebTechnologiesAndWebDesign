/** Department entity */
export interface Department {
  id: number;
  name: string;
}

/** User entity returned from the server */
export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  departmentId: number;
  department: Department;
  createdAt: string;
  updatedAt: string;
}

/** DTO for creating a new user */
export interface CreateUserDto {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  departmentId: number;
}

/** DTO for updating an existing user */
export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string | null;
  departmentId?: number;
}

/** Pagination metadata from the server */
export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Paginated response wrapper */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/** Query parameters for fetching users */
export interface UsersQueryParams {
  search?: string;
  sortBy?: 'firstName' | 'lastName' | 'email' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

/** Normalized API error */
export interface ApiError {
  message: string;
  details?: Array<{ field: string; message: string }>;
  statusCode: number;
}

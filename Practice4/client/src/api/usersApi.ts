import { httpClient } from './httpClient';
import type {
  User,
  CreateUserDto,
  UpdateUserDto,
  PaginatedResponse,
  UsersQueryParams,
  Department,
} from '../types/user';
import { buildQueryString } from '../utils/queryUtils';

/**
 * Users API module.
 * Provides typed functions for all user-related API operations.
 */

export function getUsers(params: UsersQueryParams = {}): Promise<PaginatedResponse<User>> {
  const query = buildQueryString(params as Record<string, unknown>);
  return httpClient.get<PaginatedResponse<User>>(`/users${query}`);
}

export function getUserById(id: number): Promise<User> {
  return httpClient.get<User>(`/users/${id}`);
}

export function createUser(data: CreateUserDto): Promise<User> {
  return httpClient.post<User>('/users', data);
}

export function updateUser(id: number, data: UpdateUserDto): Promise<User> {
  return httpClient.put<User>(`/users/${id}`, data);
}

export function deleteUser(id: number): Promise<void> {
  return httpClient.delete<void>(`/users/${id}`);
}

export function getDepartments(): Promise<Department[]> {
  return httpClient.get<Department[]>('/departments');
}

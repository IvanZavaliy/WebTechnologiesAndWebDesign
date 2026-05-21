import { useContext, useCallback } from 'react';
import { UsersContext } from './UsersContext';
import * as api from '../api/usersApi';
import type { CreateUserDto, UpdateUserDto, ApiError } from '../types/user';

/* ──────────────────────────────────────────────
 *  useUsers Hook — координатор бізнес-логіки
 * ────────────────────────────────────────────── */

export function useUsers() {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error('useUsers must be used within a UsersProvider');
  }

  const { state, dispatch } = context;

  const fetchUsers = useCallback(async () => {
    dispatch({ type: 'FETCH_USERS_START' });
    try {
      const { search, sortBy, sortOrder, page } = state.ui;
      const response = await api.getUsers({ search, sortBy, sortOrder, page, limit: state.data.meta.limit });
      dispatch({
        type: 'FETCH_USERS_SUCCESS',
        payload: { users: response.data, meta: response.meta },
      });
    } catch (err) {
      const apiError = err as ApiError;
      dispatch({ type: 'FETCH_USERS_ERROR', payload: apiError.message || 'Помилка завантаження' });
    }
  }, [state.ui, state.data.meta.limit, dispatch]);

  const fetchUserById = useCallback(async (id: number) => {
    dispatch({ type: 'FETCH_USER_START' });
    try {
      const user = await api.getUserById(id);
      dispatch({ type: 'FETCH_USER_SUCCESS', payload: user });
    } catch (err) {
      const apiError = err as ApiError;
      dispatch({ type: 'FETCH_USER_ERROR', payload: apiError.message || 'Помилка завантаження' });
    }
  }, [dispatch]);

  const createUser = useCallback(async (data: CreateUserDto) => {
    dispatch({ type: 'CREATE_USER_START' });
    try {
      await api.createUser(data);
      dispatch({ type: 'CREATE_USER_SUCCESS' });
      return true;
    } catch (err) {
      const apiError = err as ApiError;
      dispatch({ type: 'CREATE_USER_ERROR', payload: apiError.message || 'Помилка створення' });
      return false;
    }
  }, [dispatch]);

  const updateUser = useCallback(async (id: number, data: UpdateUserDto) => {
    dispatch({ type: 'UPDATE_USER_START' });
    try {
      await api.updateUser(id, data);
      dispatch({ type: 'UPDATE_USER_SUCCESS' });
      return true;
    } catch (err) {
      const apiError = err as ApiError;
      dispatch({ type: 'UPDATE_USER_ERROR', payload: apiError.message || 'Помилка оновлення' });
      return false;
    }
  }, [dispatch]);

  const deleteUser = useCallback(async (id: number) => {
    dispatch({ type: 'DELETE_USER_START' });
    try {
      await api.deleteUser(id);
      dispatch({ type: 'DELETE_USER_SUCCESS' });
      return true;
    } catch (err) {
      const apiError = err as ApiError;
      dispatch({ type: 'DELETE_USER_ERROR', payload: apiError.message || 'Помилка видалення' });
      return false;
    }
  }, [dispatch]);

  const clearSelectedUser = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTED_USER' });
  }, [dispatch]);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, [dispatch]);

  const clearSuccess = useCallback(() => {
    dispatch({ type: 'CLEAR_SUCCESS' });
  }, [dispatch]);

  const setSearch = useCallback((search: string) => {
    dispatch({ type: 'SET_SEARCH', payload: search });
  }, [dispatch]);

  const setSort = useCallback((sortBy: 'firstName' | 'lastName' | 'email' | 'createdAt', sortOrder: 'asc' | 'desc') => {
    dispatch({ type: 'SET_SORT', payload: { sortBy, sortOrder } });
  }, [dispatch]);

  const setPage = useCallback((page: number) => {
    dispatch({ type: 'SET_PAGE', payload: page });
  }, [dispatch]);

  return {
    state,
    fetchUsers,
    fetchUserById,
    createUser,
    updateUser,
    deleteUser,
    clearSelectedUser,
    clearError,
    clearSuccess,
    setSearch,
    setSort,
    setPage,
  };
}

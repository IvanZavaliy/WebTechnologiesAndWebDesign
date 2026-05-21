import type { User, Department, PaginationMeta } from '../types/user';

/* ──────────────────────────────────────────────
 *  Структура стану застосунку
 * ────────────────────────────────────────────── */

/** Гілка даних - предметна область, отримана з сервера */
export interface UsersDataState {
  users: User[];
  selectedUser: User | null;
  departments: Department[];
  meta: PaginationMeta;
}

/** Гілка UI - параметри, що керують відображенням і запитами */
export interface UsersUiState {
  search: string;
  sortBy: 'firstName' | 'lastName' | 'email' | 'createdAt';
  sortOrder: 'asc' | 'desc';
  page: number;
}

/** Гілка статусів - ознаки виконання асинхронних операцій */
export interface UsersStatusState {
  loading: boolean;
  error: string | null;
  success: string | null;
  saving: boolean;
  deleting: boolean;
}

/** Інтерфейс стану (єдине джерело істини) */
export interface UsersState {
  data: UsersDataState;
  ui: UsersUiState;
  status: UsersStatusState;
}

/** Початковий стан */
export const initialUsersState: UsersState = {
  data: {
    users: [],
    selectedUser: null,
    departments: [],
    meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
  },
  ui: {
    search: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    page: 1,
  },
  status: {
    loading: false,
    error: null,
    success: null,
    saving: false,
    deleting: false,
  },
};

/* ──────────────────────────────────────────────
 *  Типи дій (Actions)
 * ────────────────────────────────────────────── */

export type UsersAction =
  | { type: 'FETCH_USERS_START' }
  | { type: 'FETCH_USERS_SUCCESS'; payload: { users: User[]; meta: PaginationMeta } }
  | { type: 'FETCH_USERS_ERROR'; payload: string }
  | { type: 'FETCH_USER_START' }
  | { type: 'FETCH_USER_SUCCESS'; payload: User }
  | { type: 'FETCH_USER_ERROR'; payload: string }
  | { type: 'CLEAR_SELECTED_USER' }
  | { type: 'CREATE_USER_START' }
  | { type: 'CREATE_USER_SUCCESS' }
  | { type: 'CREATE_USER_ERROR'; payload: string }
  | { type: 'UPDATE_USER_START' }
  | { type: 'UPDATE_USER_SUCCESS' }
  | { type: 'UPDATE_USER_ERROR'; payload: string }
  | { type: 'DELETE_USER_START' }
  | { type: 'DELETE_USER_SUCCESS' }
  | { type: 'DELETE_USER_ERROR'; payload: string }
  | { type: 'FETCH_DEPARTMENTS_SUCCESS'; payload: Department[] }
  | { type: 'SET_SEARCH'; payload: string }
  | { type: 'SET_SORT'; payload: { sortBy: 'firstName' | 'lastName' | 'email' | 'createdAt'; sortOrder: 'asc' | 'desc' } }
  | { type: 'SET_PAGE'; payload: number }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CLEAR_SUCCESS' };

/* ──────────────────────────────────────────────
 *  Редуктор (чиста функція)
 * ────────────────────────────────────────────── */

export function usersReducer(state: UsersState, action: UsersAction): UsersState {
  switch (action.type) {
    case 'FETCH_USERS_START':
      return {
        ...state,
        status: { ...state.status, loading: true, error: null },
      };
    case 'FETCH_USERS_SUCCESS':
      return {
        ...state,
        data: {
          ...state.data,
          users: action.payload.users,
          meta: action.payload.meta,
        },
        status: { ...state.status, loading: false },
      };
    case 'FETCH_USERS_ERROR':
      return {
        ...state,
        status: { ...state.status, loading: false, error: action.payload },
      };
    case 'FETCH_USER_START':
      return {
        ...state,
        data: { ...state.data, selectedUser: null },
        status: { ...state.status, loading: true, error: null },
      };
    case 'FETCH_USER_SUCCESS':
      return {
        ...state,
        data: { ...state.data, selectedUser: action.payload },
        status: { ...state.status, loading: false },
      };
    case 'FETCH_USER_ERROR':
      return {
        ...state,
        status: { ...state.status, loading: false, error: action.payload },
      };
    case 'CLEAR_SELECTED_USER':
      return {
        ...state,
        data: { ...state.data, selectedUser: null },
      };
    case 'CREATE_USER_START':
      return {
        ...state,
        status: { ...state.status, saving: true, error: null },
      };
    case 'CREATE_USER_SUCCESS':
      return {
        ...state,
        status: { ...state.status, saving: false, success: 'Користувача успішно створено' },
      };
    case 'CREATE_USER_ERROR':
      return {
        ...state,
        status: { ...state.status, saving: false, error: action.payload },
      };
    case 'UPDATE_USER_START':
      return {
        ...state,
        status: { ...state.status, saving: true, error: null },
      };
    case 'UPDATE_USER_SUCCESS':
      return {
        ...state,
        status: { ...state.status, saving: false, success: 'Дані користувача оновлено' },
      };
    case 'UPDATE_USER_ERROR':
      return {
        ...state,
        status: { ...state.status, saving: false, error: action.payload },
      };
    case 'DELETE_USER_START':
      return {
        ...state,
        status: { ...state.status, deleting: true, error: null },
      };
    case 'DELETE_USER_SUCCESS':
      return {
        ...state,
        status: { ...state.status, deleting: false, success: 'Користувача видалено' },
      };
    case 'DELETE_USER_ERROR':
      return {
        ...state,
        status: { ...state.status, deleting: false, error: action.payload },
      };
    case 'FETCH_DEPARTMENTS_SUCCESS':
      return {
        ...state,
        data: { ...state.data, departments: action.payload },
      };
    case 'SET_SEARCH':
      return {
        ...state,
        ui: { ...state.ui, search: action.payload, page: 1 },
      };
    case 'SET_SORT':
      return {
        ...state,
        ui: {
          ...state.ui,
          sortBy: action.payload.sortBy,
          sortOrder: action.payload.sortOrder,
          page: 1,
        },
      };
    case 'SET_PAGE':
      return {
        ...state,
        ui: { ...state.ui, page: action.payload },
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        status: { ...state.status, error: null },
      };
    case 'CLEAR_SUCCESS':
      return {
        ...state,
        status: { ...state.status, success: null },
      };
    default:
      return state;
  }
}

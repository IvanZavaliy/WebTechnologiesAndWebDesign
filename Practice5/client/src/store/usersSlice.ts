import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getDepartments,
} from '../api/usersApi';
import type {
  User,
  Department,
  PaginationMeta,
  CreateUserDto,
  UpdateUserDto,
  UsersQueryParams,
  ApiError,
} from '../types/user';

/* ──────────────────────────────────────────────
 *  Інтерфейс стану slice «users»
 *
 *  Містить предметні дані (колекція користувачів,
 *  вибраний користувач, відділи, мета пагінації)
 *  та службові параметри запитів (loading, error, success, saving, deleting).
 * ────────────────────────────────────────────── */

interface UsersState {
  users: User[];
  selectedUser: User | null;
  departments: Department[];
  meta: PaginationMeta;
  loading: boolean;
  error: string | null;
  success: string | null;
  saving: boolean;
  deleting: boolean;
}

const initialState: UsersState = {
  users: [],
  selectedUser: null,
  departments: [],
  meta: { total: 0, page: 1, limit: 10, totalPages: 0 },
  loading: false,
  error: null,
  success: null,
  saving: false,
  deleting: false,
};

/* ──────────────────────────────────────────────
 *  Async Thunks — координація API-викликів
 *
 *  Кожен thunk автоматично генерує три дії:
 *  pending → fulfilled | rejected
 *  що обробляються в extraReducers.
 * ────────────────────────────────────────────── */

/** Завантаження списку користувачів із параметрами */
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: UsersQueryParams, { rejectWithValue }) => {
    try {
      return await getUsers(params);
    } catch (err) {
      const apiError = err as ApiError;
      return rejectWithValue(apiError.message || 'Помилка завантаження даних');
    }
  }
);

/** Завантаження одного користувача за ID */
export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await getUserById(id);
    } catch (err) {
      const apiError = err as ApiError;
      return rejectWithValue(apiError.message || 'Помилка завантаження даних користувача');
    }
  }
);

/** Створення нового користувача */
export const createNewUser = createAsyncThunk(
  'users/createNewUser',
  async (data: CreateUserDto, { rejectWithValue }) => {
    try {
      return await createUser(data);
    } catch (err) {
      const apiError = err as ApiError;
      return rejectWithValue(apiError.message || 'Помилка створення користувача');
    }
  }
);

/** Оновлення існуючого користувача */
export const editUser = createAsyncThunk(
  'users/editUser',
  async ({ id, data }: { id: number; data: UpdateUserDto }, { rejectWithValue }) => {
    try {
      return await updateUser(id, data);
    } catch (err) {
      const apiError = err as ApiError;
      return rejectWithValue(apiError.message || 'Помилка оновлення користувача');
    }
  }
);

/** Видалення користувача */
export const removeUser = createAsyncThunk(
  'users/removeUser',
  async (id: number, { rejectWithValue }) => {
    try {
      await deleteUser(id);
      return id;
    } catch (err) {
      const apiError = err as ApiError;
      return rejectWithValue(apiError.message || 'Помилка видалення користувача');
    }
  }
);

/** Завантаження списку відділів */
export const fetchDepartments = createAsyncThunk(
  'users/fetchDepartments',
  async (_, { rejectWithValue }) => {
    try {
      return await getDepartments();
    } catch (err) {
      const apiError = err as ApiError;
      return rejectWithValue(apiError.message || 'Помилка завантаження відділів');
    }
  }
);

/* ──────────────────────────────────────────────
 *  Slice — reducers + extraReducers
 * ────────────────────────────────────────────── */

const usersSlice = createSlice({
  name: 'users',
  initialState,

  /* Синхронні reducers */
  reducers: {
    clearSelectedUser(state) {
      state.selectedUser = null;
    },
    clearError(state) {
      state.error = null;
    },
    clearSuccess(state) {
      state.success = null;
    },
  },

  /* Обробка async thunks: pending / fulfilled / rejected */
  extraReducers: (builder) => {
    /* --- fetchUsers --- */
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.data;
        state.meta = action.payload.meta;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    /* --- fetchUserById --- */
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.selectedUser = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
        state.error = null;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    /* --- createNewUser --- */
    builder
      .addCase(createNewUser.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(createNewUser.fulfilled, (state) => {
        state.saving = false;
        state.success = 'Користувача успішно створено';
        state.error = null;
      })
      .addCase(createNewUser.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });

    /* --- editUser --- */
    builder
      .addCase(editUser.pending, (state) => {
        state.saving = true;
        state.error = null;
      })
      .addCase(editUser.fulfilled, (state) => {
        state.saving = false;
        state.success = 'Дані користувача оновлено';
        state.error = null;
      })
      .addCase(editUser.rejected, (state, action) => {
        state.saving = false;
        state.error = action.payload as string;
      });

    /* --- removeUser --- */
    builder
      .addCase(removeUser.pending, (state) => {
        state.deleting = true;
        state.error = null;
      })
      .addCase(removeUser.fulfilled, (state) => {
        state.deleting = false;
        state.success = 'Користувача видалено';
        state.error = null;
      })
      .addCase(removeUser.rejected, (state, action) => {
        state.deleting = false;
        state.error = action.payload as string;
      });

    /* --- fetchDepartments --- */
    builder
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.departments = action.payload;
      });
  },
});

/* Експорт синхронних actions */
export const { clearSelectedUser, clearError, clearSuccess } = usersSlice.actions;

/* Експорт reducer */
export const usersReducer = usersSlice.reducer;

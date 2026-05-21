import { configureStore } from '@reduxjs/toolkit';
import { usersReducer } from './usersSlice';
import { uiReducer } from './uiSlice';

/* ──────────────────────────────────────────────
 *  Redux Store — єдине джерело істини
 *
 *  Структура:
 *  ├── users   — предметні дані + статуси CRUD
 *  └── ui      — параметри інтерфейсу + sessionStorage
 * ────────────────────────────────────────────── */

export const store = configureStore({
  reducer: {
    users: usersReducer,
    ui: uiReducer,
  },
});

/** Тип кореневого стану (для useAppSelector) */
export type RootState = ReturnType<typeof store.getState>;

/** Тип dispatch (для useAppDispatch) */
export type AppDispatch = typeof store.dispatch;

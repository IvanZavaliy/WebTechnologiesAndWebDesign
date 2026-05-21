import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

/* ──────────────────────────────────────────────
 *  Утиліти для роботи з sessionStorage
 *
 *  Зберігають пошуковий запит та номер сторінки
 *  між оновленнями сторінки (F5 / навігація).
 * ────────────────────────────────────────────── */

const STORAGE_KEYS = {
  search: 'userAdmin_ui_search',
  page: 'userAdmin_ui_page',
} as const;

function loadFromSessionStorage(): { search: string; page: number } {
  try {
    return {
      search: sessionStorage.getItem(STORAGE_KEYS.search) ?? '',
      page: Number(sessionStorage.getItem(STORAGE_KEYS.page)) || 1,
    };
  } catch {
    return { search: '', page: 1 };
  }
}

function saveToSessionStorage(key: string, value: string): void {
  try {
    sessionStorage.setItem(key, value);
  } catch {
    /* sessionStorage недоступний — ігноруємо */
  }
}

/* ──────────────────────────────────────────────
 *  Інтерфейс стану slice «ui»
 *
 *  Параметри інтерфейсу, що впливають на запити до сервера:
 *  пошук, сортування, сторінка пагінації.
 * ────────────────────────────────────────────── */

export interface UiState {
  search: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  page: number;
}

const persisted = loadFromSessionStorage();

const initialState: UiState = {
  search: persisted.search,
  sortBy: 'createdAt',
  sortOrder: 'desc',
  page: persisted.page,
};

/* ──────────────────────────────────────────────
 *  Slice — синхронні reducers для UI-параметрів
 * ────────────────────────────────────────────── */

const uiSlice = createSlice({
  name: 'ui',
  initialState,

  reducers: {
    /** Зміна пошукового запиту — скидає сторінку на 1 */
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
      state.page = 1;
      saveToSessionStorage(STORAGE_KEYS.search, action.payload);
      saveToSessionStorage(STORAGE_KEYS.page, '1');
    },

    /** Зміна параметрів сортування — скидає сторінку на 1 */
    setSort(state, action: PayloadAction<{ sortBy: string; sortOrder: 'asc' | 'desc' }>) {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
      state.page = 1;
      saveToSessionStorage(STORAGE_KEYS.page, '1');
    },

    /** Зміна сторінки пагінації */
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
      saveToSessionStorage(STORAGE_KEYS.page, String(action.payload));
    },
  },
});

/* Експорт actions */
export const { setSearch, setSort, setPage } = uiSlice.actions;

/* Експорт reducer */
export const uiReducer = uiSlice.reducer;

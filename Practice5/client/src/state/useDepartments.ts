import { useEffect, useContext, useState } from 'react';
import { UsersContext } from './UsersContext';
import * as api from '../api/usersApi';
import type { ApiError } from '../types/user';

/* ──────────────────────────────────────────────
 *  useDepartments Hook
 * ────────────────────────────────────────────── */

export function useDepartments() {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error('useDepartments must be used within a UsersProvider');
  }

  const { state, dispatch } = context;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadDepartments() {
      if (state.data.departments.length > 0) return; // Вже завантажено

      setLoading(true);
      setError(null);
      try {
        const deps = await api.getDepartments();
        if (isMounted) {
          dispatch({ type: 'FETCH_DEPARTMENTS_SUCCESS', payload: deps });
        }
      } catch (err) {
        if (isMounted) {
          const apiError = err as ApiError;
          setError(apiError.message || 'Помилка завантаження відділів');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadDepartments();

    return () => {
      isMounted = false;
    };
  }, [state.data.departments.length, dispatch]);

  return {
    departments: state.data.departments,
    loading,
    error,
  };
}

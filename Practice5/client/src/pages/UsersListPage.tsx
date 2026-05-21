import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchUsers, removeUser, clearError, clearSuccess } from '../store/usersSlice';
import { setSearch, setSort, setPage } from '../store/uiSlice';
import { UsersTable } from '../components/UsersTable';
import { Pagination } from '../components/Pagination';
import { SearchBar } from '../components/SearchBar';
import { ConfirmModal } from '../components/ConfirmModal';
import { Loader, ErrorMessage } from '../components/Loader';
import type { User, UsersQueryParams } from '../types/user';

/**
 * UsersListPage — контейнерний компонент (сторінка),
 * що координує взаємодію зі станом через Redux store.
 *
 * Всі дані надходять із централізованого store (useAppSelector).
 * Всі дії ініціюються через dispatch (useAppDispatch).
 * Компоненти подання отримують дані через props.
 */
export const UsersListPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Селектори: читання стану з Redux store
  const { users, meta, loading, error, success, deleting } = useAppSelector((s) => s.users);
  const ui = useAppSelector((s) => s.ui);

  // Локальний стан для видалення (модальне вікно)
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  // Debounced search — локальний input, що синхронізується з Redux
  const [searchInput, setSearchInput] = useState(ui.search);

  // Завантаження користувачів при зміні UI-параметрів
  const loadUsers = useCallback(() => {
    const params: UsersQueryParams = {
      search: ui.search || undefined,
      sortBy: ui.sortBy as UsersQueryParams['sortBy'],
      sortOrder: ui.sortOrder,
      page: ui.page,
      limit: 10,
    };
    dispatch(fetchUsers(params));
  }, [dispatch, ui.search, ui.sortBy, ui.sortOrder, ui.page]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Debounce: оновлення Redux стану пошуку через 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(setSearch(searchInput));
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput, dispatch]);

  // Автоочищення success-повідомлення через 3 секунди
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => dispatch(clearSuccess()), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch]);

  const handleSort = useCallback((field: string) => {
    const currentSortBy = ui.sortBy;
    const currentSortOrder = ui.sortOrder;
    const newOrder = currentSortBy === field
      ? (currentSortOrder === 'asc' ? 'desc' : 'asc')
      : 'asc';
    dispatch(setSort({ sortBy: field, sortOrder: newOrder as 'asc' | 'desc' }));
  }, [dispatch, ui.sortBy, ui.sortOrder]);

  const handlePageChange = useCallback((page: number) => {
    dispatch(setPage(page));
  }, [dispatch]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const result = await dispatch(removeUser(deleteTarget.id));
    if (removeUser.fulfilled.match(result)) {
      setDeleteTarget(null);
      loadUsers(); // Інвалідація: перезавантаження списку після видалення
    }
  }, [deleteTarget, dispatch, loadUsers]);

  return (
    <div className="page" id="users-list-page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Керування користувачами</h1>
          <p className="page__subtitle">
            Перегляд, створення та редагування записів
          </p>
        </div>
        <button
          className="btn btn--primary btn--lg"
          onClick={() => navigate('/users/create')}
          id="create-user-btn"
        >
          <span className="btn__icon">+</span>
          Новий користувач
        </button>
      </div>

      <div className="page__toolbar">
        <SearchBar value={searchInput} onChange={setSearchInput} />
        <div className="page__stats">
          {!loading && !error && (
            <span className="stats-badge">
              {meta.total} {meta.total === 1 ? 'запис' : 'записів'}
            </span>
          )}
        </div>
      </div>

      {/* Повідомлення про успішну дію */}
      {success && (
        <div className="success-message" id="success-message">
          <span className="success-message__icon">✅</span>
          <span className="success-message__text">{success}</span>
        </div>
      )}

      {error ? (
        <ErrorMessage message={error} onRetry={() => { dispatch(clearError()); loadUsers(); }} />
      ) : loading ? (
        <Loader text="Завантаження користувачів..." />
      ) : (
        <>
          <UsersTable
            users={users}
            sortBy={ui.sortBy}
            sortOrder={ui.sortOrder}
            onSort={handleSort}
            onView={(id) => navigate(`/users/${id}`)}
            onEdit={(id) => navigate(`/users/${id}/edit`)}
            onDelete={(id) => {
              const user = users.find((u) => u.id === id);
              if (user) setDeleteTarget(user);
            }}
          />
          <Pagination meta={meta} onPageChange={handlePageChange} />
        </>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Видалити користувача?"
        message={
          deleteTarget
            ? `Ви впевнені, що хочете видалити ${deleteTarget.firstName} ${deleteTarget.lastName}? Цю дію неможливо скасувати.`
            : ''
        }
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleting}
        confirmLabel="Видалити"
      />
    </div>
  );
};

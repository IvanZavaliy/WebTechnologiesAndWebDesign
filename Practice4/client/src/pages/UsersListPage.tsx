import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUsers, deleteUser } from '../api/usersApi';
import { UsersTable } from '../components/UsersTable';
import { Pagination } from '../components/Pagination';
import { SearchBar } from '../components/SearchBar';
import { ConfirmModal } from '../components/ConfirmModal';
import { Loader, ErrorMessage } from '../components/Loader';
import type { User, PaginationMeta, UsersQueryParams, ApiError } from '../types/user';

/**
 * UsersListPage — main page displaying the paginated user list
 * with search, sorting, and delete functionality.
 */
export const UsersListPage: React.FC = () => {
  const navigate = useNavigate();

  // Data state
  const [users, setUsers] = useState<User[]>([]);
  const [meta, setMeta] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  // Query state
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const params: UsersQueryParams = {
      search: search || undefined,
      sortBy: sortBy as UsersQueryParams['sortBy'],
      sortOrder,
      page,
      limit: 10,
    };

    try {
      const result = await getUsers(params);
      setUsers(result.data);
      setMeta(result.meta);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Помилка завантаження даних');
    } finally {
      setIsLoading(false);
    }
  }, [search, sortBy, sortOrder, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Debounced search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Помилка видалення');
    } finally {
      setIsDeleting(false);
    }
  };

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
          {!isLoading && !error && (
            <span className="stats-badge">
              {meta.total} {meta.total === 1 ? 'запис' : 'записів'}
            </span>
          )}
        </div>
      </div>

      {error ? (
        <ErrorMessage message={error} onRetry={fetchUsers} />
      ) : isLoading ? (
        <Loader text="Завантаження користувачів..." />
      ) : (
        <>
          <UsersTable
            users={users}
            sortBy={sortBy}
            sortOrder={sortOrder}
            onSort={handleSort}
            onView={(id) => navigate(`/users/${id}`)}
            onEdit={(id) => navigate(`/users/${id}/edit`)}
            onDelete={(id) => {
              const user = users.find((u) => u.id === id);
              if (user) setDeleteTarget(user);
            }}
          />
          <Pagination meta={meta} onPageChange={setPage} />
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
        isLoading={isDeleting}
        confirmLabel="Видалити"
      />
    </div>
  );
};

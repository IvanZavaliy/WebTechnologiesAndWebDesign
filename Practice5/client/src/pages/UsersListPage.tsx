import React, { useEffect, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../state/useUsers';
import { UsersTable } from '../components/UsersTable';
import { Pagination } from '../components/Pagination';
import { SearchBar } from '../components/SearchBar';
import { ConfirmModal } from '../components/ConfirmModal';
import { Loader, ErrorMessage } from '../components/Loader';
import { debounce } from '../utils/queryUtils';

export const UsersListPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    state,
    fetchUsers,
    deleteUser,
    clearError,
    setSearch,
    setSort,
    setPage,
  } = useUsers();

  const { data: { users, meta }, ui, status: { loading, error, success, deleting } } = state;
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearch(value);
    }, 500),
    [setSearch]
  );

  const handleSearchChange = (value: string) => {
    const input = document.getElementById('search-input') as HTMLInputElement;
    if (input) input.value = value;
    if (value === '') {
      setSearch('');
    } else {
      debouncedSearch(value);
    }
  };

  const handleSort = (field: string) => {
    const validFields = ['firstName', 'lastName', 'email', 'createdAt'];
    if (!validFields.includes(field)) return;
    
    const validField = field as 'firstName' | 'lastName' | 'email' | 'createdAt';
    const newOrder = ui.sortBy === validField && ui.sortOrder === 'desc' ? 'asc' : 'desc';
    setSort(validField, newOrder);
  };

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteTarget) return;
    const isSuccess = await deleteUser(deleteTarget);
    if (isSuccess) {
      setDeleteTarget(null);
      fetchUsers();
    }
  }, [deleteTarget, deleteUser, fetchUsers]);

  return (
    <div className="page" id="users-list-page">
      <header className="page__header">
        <div>
          <h1 className="page__title">Користувачі</h1>
          <p className="page__subtitle">Керування обліковими записами та їх ролями</p>
        </div>
        <button
          className="btn btn--primary btn--lg"
          onClick={() => navigate('/users/create')}
          id="create-user-btn"
        >
          <span>+</span> Додати користувача
        </button>
      </header>

      {success && (
        <div className="success-message" id="success-message">
          <span className="success-message__icon">✅</span>
          <span className="success-message__text">{success}</span>
        </div>
      )}

      {error ? (
        <ErrorMessage message={error} onRetry={() => { clearError(); fetchUsers(); }} />
      ) : loading && users.length === 0 ? (
        <Loader text="Завантаження користувачів..." />
      ) : (
        <>
          <div className="page__toolbar">
            <SearchBar
              value={ui.search}
              onChange={handleSearchChange}
            />
          </div>

          <UsersTable
            users={users}
            sortBy={ui.sortBy}
            sortOrder={ui.sortOrder}
            onSort={handleSort}
            onView={(id) => navigate(`/users/${id}`)}
            onEdit={(id) => navigate(`/users/${id}/edit`)}
            onDelete={(id) => setDeleteTarget(id)}
          />

          <Pagination
            meta={meta}
            onPageChange={(p) => setPage(p)}
          />
        </>
      )}

      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Видалення користувача"
        message="Ви впевнені, що хочете видалити цього користувача? Цю дію неможливо скасувати."
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        isLoading={deleting}
      />
    </div>
  );
};

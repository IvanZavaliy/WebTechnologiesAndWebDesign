import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  fetchUserById,
  fetchDepartments,
  editUser,
  clearError,
  clearSelectedUser,
} from '../store/usersSlice';
import { UserForm } from '../components/UserForm';
import { Loader, ErrorMessage } from '../components/Loader';
import type { UpdateUserDto } from '../types/user';

/**
 * UserEditPage — сторінка редагування існуючого користувача.
 *
 * Використовує Redux thunks:
 * - fetchUserById(id) → store.users.selectedUser
 * - fetchDepartments() → store.users.departments
 * - editUser({ id, data }) → збереження
 */
export const UserEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const { selectedUser, departments, loading, saving, error } = useAppSelector((s) => s.users);
  const [deptLoading, setDeptLoading] = React.useState(true);

  // Завантажити дані користувача та відділи при монтуванні
  useEffect(() => {
    dispatch(fetchUserById(Number(id)));

    const loadDepts = async () => {
      if (departments.length > 0) {
        setDeptLoading(false);
        return;
      }
      try {
        await dispatch(fetchDepartments()).unwrap();
      } catch {
        /* помилка відділів обробляється через store.users.error */
      } finally {
        setDeptLoading(false);
      }
    };
    loadDepts();

    return () => {
      dispatch(clearSelectedUser());
    };
  }, [id, dispatch, departments.length]);

  const handleSubmit = async (formData: UpdateUserDto) => {
    const result = await dispatch(editUser({ id: Number(id), data: formData }));
    if (editUser.fulfilled.match(result)) {
      navigate('/');
    }
  };

  if (loading || deptLoading) return <Loader text="Завантаження даних користувача..." />;

  if (!selectedUser && !loading) {
    return <ErrorMessage message="Користувача не знайдено" onRetry={() => navigate('/')} />;
  }

  return (
    <div className="page" id="user-edit-page">
      <div className="page__header">
        <div>
          <button className="btn btn--ghost btn--back" onClick={() => navigate('/')} id="back-btn">
            ← Назад до списку
          </button>
          <h1 className="page__title">Редагувати користувача</h1>
          <p className="page__subtitle">
            {selectedUser ? `${selectedUser.firstName} ${selectedUser.lastName}` : ''}
          </p>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={() => dispatch(clearError())} />}

      <div className="card">
        <UserForm
          initialData={selectedUser}
          departments={departments}
          onSubmit={(formData) => handleSubmit(formData as UpdateUserDto)}
          onCancel={() => navigate('/')}
          isLoading={saving}
          isEdit
        />
      </div>
    </div>
  );
};

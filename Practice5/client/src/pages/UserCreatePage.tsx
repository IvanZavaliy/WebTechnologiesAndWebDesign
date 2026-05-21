import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { createNewUser, fetchDepartments, clearError } from '../store/usersSlice';
import { UserForm } from '../components/UserForm';
import { Loader, ErrorMessage } from '../components/Loader';
import type { CreateUserDto } from '../types/user';

/**
 * UserCreatePage — сторінка створення нового користувача.
 *
 * Використовує Redux thunks:
 * - fetchDepartments() — завантаження відділів
 * - createNewUser(data) — збереження користувача
 *
 * Стан saving/error читається через useAppSelector.
 */
export const UserCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { departments, saving, error } = useAppSelector((s) => s.users);
  const [deptLoading, setDeptLoading] = React.useState(true);
  const [deptError, setDeptError] = React.useState<string | null>(null);

  // Завантаження відділів при монтуванні
  useEffect(() => {
    const load = async () => {
      if (departments.length > 0) {
        setDeptLoading(false);
        return;
      }
      try {
        await dispatch(fetchDepartments()).unwrap();
      } catch (err) {
        setDeptError(String(err) || 'Помилка завантаження відділів');
      } finally {
        setDeptLoading(false);
      }
    };
    load();
  }, [dispatch, departments.length]);

  const handleSubmit = async (data: CreateUserDto) => {
    const result = await dispatch(createNewUser(data));
    if (createNewUser.fulfilled.match(result)) {
      navigate('/');
    }
  };

  if (deptLoading) return <Loader text="Завантаження форми..." />;
  if (deptError) return <ErrorMessage message={deptError} />;

  return (
    <div className="page" id="user-create-page">
      <div className="page__header">
        <div>
          <button className="btn btn--ghost btn--back" onClick={() => navigate('/')} id="back-btn">
            ← Назад до списку
          </button>
          <h1 className="page__title">Створити користувача</h1>
          <p className="page__subtitle">Заповніть форму для додавання нового запису</p>
        </div>
      </div>

      {error && <ErrorMessage message={error} onRetry={() => dispatch(clearError())} />}

      <div className="card">
        <UserForm
          departments={departments}
          onSubmit={(data) => handleSubmit(data as CreateUserDto)}
          onCancel={() => navigate('/')}
          isLoading={saving}
        />
      </div>
    </div>
  );
};

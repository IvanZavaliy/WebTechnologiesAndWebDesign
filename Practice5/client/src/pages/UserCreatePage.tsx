import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUsers } from '../state/useUsers';
import { useDepartments } from '../state/useDepartments';
import { UserForm } from '../components/UserForm';
import { Loader, ErrorMessage } from '../components/Loader';
import type { CreateUserDto } from '../types/user';

export const UserCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { state: { status: { saving, error } }, createUser, clearError } = useUsers();
  const { departments, loading: deptLoading, error: deptError } = useDepartments();

  useEffect(() => {
    clearError();
  }, [clearError]);

  const handleSubmit = async (data: CreateUserDto) => {
    const isSuccess = await createUser(data);
    if (isSuccess) {
      navigate('/');
    }
  };

  if (deptLoading) return <Loader text="Завантаження форми..." />;
  if (deptError) return <ErrorMessage message={deptError} />;

  return (
    <div className="page" id="user-create-page">
      <header className="page__header">
        <div>
          <button className="btn btn--ghost btn--sm" onClick={() => navigate('/')} style={{ marginBottom: '1rem' }}>
            ← Назад до списку
          </button>
          <h1 className="page__title">Створення користувача</h1>
          <p className="page__subtitle">Заповніть форму для додавання нового співробітника</p>
        </div>
      </header>

      <div className="card">
        {error && <ErrorMessage message={error} onRetry={clearError} />}
        
        <UserForm
          departments={departments}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/')}
          isLoading={saving}
        />
      </div>
    </div>
  );
};

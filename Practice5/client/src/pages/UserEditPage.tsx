import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUsers } from '../state/useUsers';
import { useDepartments } from '../state/useDepartments';
import { UserForm } from '../components/UserForm';
import { Loader, ErrorMessage } from '../components/Loader';
import type { UpdateUserDto } from '../types/user';

export const UserEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);
  
  const { 
    state: { data: { selectedUser }, status: { loading, saving, error } },
    fetchUserById,
    updateUser,
    clearError
  } = useUsers();
  
  const { departments, loading: deptLoading } = useDepartments();

  useEffect(() => {
    if (isNaN(userId)) {
      navigate('/');
      return;
    }
    fetchUserById(userId);
    clearError();
  }, [userId, navigate, fetchUserById, clearError]);

  const handleSubmit = async (data: UpdateUserDto) => {
    const isSuccess = await updateUser(userId, data);
    if (isSuccess) {
      navigate('/');
    }
  };

  if (loading || deptLoading) return <Loader text="Завантаження даних користувача..." />;
  
  if (!selectedUser) {
    return <ErrorMessage message="Користувача не знайдено" onRetry={() => navigate('/')} />;
  }

  return (
    <div className="page" id="user-edit-page">
      <header className="page__header">
        <div>
          <button className="btn btn--ghost btn--sm" onClick={() => navigate('/')} style={{ marginBottom: '1rem' }}>
            ← Назад до списку
          </button>
          <h1 className="page__title">Редагування користувача</h1>
          <p className="page__subtitle">Оновлення даних співробітника</p>
        </div>
      </header>

      <div className="card">
        {error && <ErrorMessage message={error} onRetry={clearError} />}
        
        <UserForm
          initialData={selectedUser}
          departments={departments}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/')}
          isLoading={saving}
          isEdit
        />
      </div>
    </div>
  );
};

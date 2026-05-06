import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserById, updateUser, getDepartments } from '../api/usersApi';
import { UserForm } from '../components/UserForm';
import { Loader, ErrorMessage } from '../components/Loader';
import type { UpdateUserDto, User, Department, ApiError } from '../types/user';

/**
 * UserEditPage — page for editing an existing user record.
 */
export const UserEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [user, setUser] = useState<User | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [userData, deptData] = await Promise.all([
          getUserById(Number(id)),
          getDepartments(),
        ]);
        setUser(userData);
        setDepartments(deptData);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || 'Помилка завантаження даних');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id]);

  const handleSubmit = async (data: UpdateUserDto) => {
    setIsSaving(true);
    setError(null);
    try {
      await updateUser(Number(id), data);
      navigate('/');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Помилка оновлення користувача');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loader text="Завантаження даних користувача..." />;

  if (!user && !isLoading) {
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
            {user ? `${user.firstName} ${user.lastName}` : ''}
          </p>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="card">
        <UserForm
          initialData={user}
          departments={departments}
          onSubmit={(data) => handleSubmit(data as UpdateUserDto)}
          onCancel={() => navigate('/')}
          isLoading={isSaving}
          isEdit
        />
      </div>
    </div>
  );
};

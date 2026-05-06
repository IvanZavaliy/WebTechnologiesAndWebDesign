import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUser, getDepartments } from '../api/usersApi';
import { UserForm } from '../components/UserForm';
import { Loader, ErrorMessage } from '../components/Loader';
import type { CreateUserDto, Department, ApiError } from '../types/user';

/**
 * UserCreatePage — page for creating a new user record.
 */
export const UserCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const data = await getDepartments();
        setDepartments(data);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || 'Помилка завантаження відділів');
      } finally {
        setIsLoading(false);
      }
    };
    loadDepartments();
  }, []);

  const handleSubmit = async (data: CreateUserDto) => {
    setIsSaving(true);
    setError(null);
    try {
      await createUser(data);
      navigate('/');
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.message || 'Помилка створення користувача');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Loader text="Завантаження форми..." />;

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

      {error && <ErrorMessage message={error} />}

      <div className="card">
        <UserForm
          departments={departments}
          onSubmit={(data) => handleSubmit(data as CreateUserDto)}
          onCancel={() => navigate('/')}
          isLoading={isSaving}
        />
      </div>
    </div>
  );
};

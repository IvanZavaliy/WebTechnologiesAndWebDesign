import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getUserById } from '../api/usersApi';
import { Loader, ErrorMessage } from '../components/Loader';
import { formatDate } from '../utils/queryUtils';
import type { User, ApiError } from '../types/user';

/**
 * UserViewPage — page for viewing detailed user information.
 */
export const UserViewPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const data = await getUserById(Number(id));
        setUser(data);
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError.message || 'Помилка завантаження даних');
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, [id]);

  if (isLoading) return <Loader text="Завантаження профілю..." />;

  if (error) {
    return <ErrorMessage message={error} onRetry={() => navigate('/')} />;
  }

  if (!user) {
    return <ErrorMessage message="Користувача не знайдено" onRetry={() => navigate('/')} />;
  }

  return (
    <div className="page" id="user-view-page">
      <div className="page__header">
        <div>
          <button className="btn btn--ghost btn--back" onClick={() => navigate('/')} id="back-btn">
            ← Назад до списку
          </button>
          <h1 className="page__title">Профіль користувача</h1>
        </div>
        <button
          className="btn btn--primary"
          onClick={() => navigate(`/users/${id}/edit`)}
          id="edit-from-view-btn"
        >
          ✏️ Редагувати
        </button>
      </div>

      <div className="card user-profile">
        <div className="user-profile__avatar">
          <span className="user-profile__initials">
            {user.firstName[0]}{user.lastName[0]}
          </span>
        </div>

        <div className="user-profile__info">
          <h2 className="user-profile__name">
            {user.firstName} {user.lastName}
          </h2>
          <span className="badge badge--lg">{user.department.name}</span>
        </div>

        <div className="user-profile__details">
          <div className="detail-row">
            <span className="detail-row__label">📧 Email</span>
            <span className="detail-row__value">{user.email}</span>
          </div>
          <div className="detail-row">
            <span className="detail-row__label">📞 Телефон</span>
            <span className="detail-row__value">{user.phone || 'Не вказано'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-row__label">🏢 Відділ</span>
            <span className="detail-row__value">{user.department.name}</span>
          </div>
          <div className="detail-row">
            <span className="detail-row__label">📅 Створено</span>
            <span className="detail-row__value">{formatDate(user.createdAt)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-row__label">🔄 Оновлено</span>
            <span className="detail-row__value">{formatDate(user.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

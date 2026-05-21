import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchUserById, clearSelectedUser } from '../store/usersSlice';
import { Loader, ErrorMessage } from '../components/Loader';
import { formatDate } from '../utils/queryUtils';

/**
 * UserViewPage — сторінка перегляду детальної інформації користувача.
 *
 * Dispatch:
 * - fetchUserById(id) → store.users.selectedUser
 * - clearSelectedUser() при демонтуванні
 *
 * Компонент подання залишається чистим — без API-логіки.
 */
export const UserViewPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();

  const { selectedUser, loading, error } = useAppSelector((s) => s.users);

  // Завантажити користувача при монтуванні, очистити при демонтуванні
  useEffect(() => {
    dispatch(fetchUserById(Number(id)));
    return () => {
      dispatch(clearSelectedUser());
    };
  }, [id, dispatch]);

  if (loading) return <Loader text="Завантаження профілю..." />;

  if (error) {
    return <ErrorMessage message={error} onRetry={() => navigate('/')} />;
  }

  if (!selectedUser) {
    return <ErrorMessage message="Користувача не знайдено" onRetry={() => navigate('/')} />;
  }

  const user = selectedUser;

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

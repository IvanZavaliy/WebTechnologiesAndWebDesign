import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useUsers } from '../state/useUsers';
import { Loader, ErrorMessage } from '../components/Loader';
import { formatDate } from '../utils/queryUtils';

export const UserViewPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const userId = Number(id);
  
  const { 
    state: { data: { selectedUser }, status: { loading, error } },
    fetchUserById,
    clearSelectedUser
  } = useUsers();

  useEffect(() => {
    if (isNaN(userId)) {
      navigate('/');
      return;
    }
    
    fetchUserById(userId);

    return () => {
      clearSelectedUser();
    };
  }, [userId, navigate, fetchUserById, clearSelectedUser]);

  if (loading) return <Loader text="Завантаження профілю..." />;
  
  if (error) {
    return <ErrorMessage message={error} onRetry={() => navigate('/')} />;
  }

  if (!selectedUser) {
    return <ErrorMessage message="Користувача не знайдено" onRetry={() => navigate('/')} />;
  }

  const getInitials = () => {
    return `${selectedUser.firstName[0] || ''}${selectedUser.lastName[0] || ''}`.toUpperCase();
  };

  return (
    <div className="page" id="user-view-page">
      <header className="page__header">
        <div>
          <button className="btn btn--ghost btn--sm" onClick={() => navigate('/')} style={{ marginBottom: '1rem' }}>
            ← Назад до списку
          </button>
          <h1 className="page__title">Профіль співробітника</h1>
        </div>
        <button
          className="btn btn--primary"
          onClick={() => navigate(`/users/${selectedUser.id}/edit`)}
          id="edit-profile-btn"
        >
          ✏️ Редагувати
        </button>
      </header>

      <div className="card user-profile">
        <div className="user-profile__avatar">
          <span className="user-profile__initials">{getInitials()}</span>
        </div>
        
        <h2>{selectedUser.firstName} {selectedUser.lastName}</h2>
        <span className="badge badge--lg">{selectedUser.department.name}</span>

        <div className="user-profile__details">
          <div className="detail-row">
            <span className="detail-row__label">ID користувача</span>
            <span className="detail-row__value">#{selectedUser.id}</span>
          </div>
          <div className="detail-row">
            <span className="detail-row__label">Email</span>
            <span className="detail-row__value">
              <a href={`mailto:${selectedUser.email}`} style={{ color: 'var(--color-primary)', textDecoration: 'none' }}>
                {selectedUser.email}
              </a>
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-row__label">Номер телефону</span>
            <span className="detail-row__value">{selectedUser.phone || 'Не вказано'}</span>
          </div>
          <div className="detail-row">
            <span className="detail-row__label">Дата реєстрації</span>
            <span className="detail-row__value">{formatDate(selectedUser.createdAt)}</span>
          </div>
          <div className="detail-row">
            <span className="detail-row__label">Останнє оновлення</span>
            <span className="detail-row__value">{formatDate(selectedUser.updatedAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

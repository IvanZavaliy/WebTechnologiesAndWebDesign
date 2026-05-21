import React from 'react';
import type { User } from '../types/user';
import { formatDate } from '../utils/queryUtils';

interface UsersTableProps {
  users: User[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onSort: (field: string) => void;
  onView: (id: number) => void;
  onEdit: (id: number) => void;
  onDelete: (id: number) => void;
}

const COLUMNS = [
  { key: 'firstName', label: "Ім'я" },
  { key: 'lastName', label: 'Прізвище' },
  { key: 'email', label: 'Email' },
  { key: 'createdAt', label: 'Створено' },
];

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  sortBy,
  sortOrder,
  onSort,
  onView,
  onEdit,
  onDelete,
}) => {
  const getSortIcon = (field: string) => {
    if (sortBy !== field) return '⇅';
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  if (users.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state__icon">📭</div>
        <h3 className="empty-state__title">Користувачів не знайдено</h3>
        <p className="empty-state__text">
          Спробуйте змінити параметри пошуку або створіть нового користувача
        </p>
      </div>
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table" id="users-table">
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className="data-table__header data-table__header--sortable"
                onClick={() => onSort(col.key)}
                id={`sort-${col.key}`}
              >
                {col.label}
                <span className="data-table__sort-icon">{getSortIcon(col.key)}</span>
              </th>
            ))}
            <th className="data-table__header">Відділ</th>
            <th className="data-table__header">Телефон</th>
            <th className="data-table__header data-table__header--actions">Дії</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user, index) => (
            <tr
              key={user.id}
              className="data-table__row"
              style={{ animationDelay: `${index * 0.03}s` }}
            >
              <td className="data-table__cell">{user.firstName}</td>
              <td className="data-table__cell">{user.lastName}</td>
              <td className="data-table__cell data-table__cell--email">{user.email}</td>
              <td className="data-table__cell">{formatDate(user.createdAt)}</td>
              <td className="data-table__cell">
                <span className="badge">{user.department.name}</span>
              </td>
              <td className="data-table__cell">{user.phone || '-'}</td>
              <td className="data-table__cell data-table__cell--actions">
                <button
                  className="btn btn--icon btn--ghost"
                  onClick={() => onView(user.id)}
                  title="Переглянути"
                  id={`view-user-${user.id}`}
                >
                  👁️
                </button>
                <button
                  className="btn btn--icon btn--ghost"
                  onClick={() => onEdit(user.id)}
                  title="Редагувати"
                  id={`edit-user-${user.id}`}
                >
                  ✏️
                </button>
                <button
                  className="btn btn--icon btn--ghost btn--danger"
                  onClick={() => onDelete(user.id)}
                  title="Видалити"
                  id={`delete-user-${user.id}`}
                >
                  🗑️
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

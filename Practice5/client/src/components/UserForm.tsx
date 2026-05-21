import React, { useState, useEffect } from 'react';
import type { CreateUserDto, UpdateUserDto, Department, User } from '../types/user';

interface UserFormProps {
  initialData?: User | null;
  departments: Department[];
  onSubmit: (data: CreateUserDto | UpdateUserDto) => void;
  onCancel: () => void;
  isLoading: boolean;
  isEdit?: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({
  initialData,
  departments,
  onSubmit,
  onCancel,
  isLoading,
  isEdit = false,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [departmentId, setDepartmentId] = useState<number>(0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFirstName(initialData.firstName);
      setLastName(initialData.lastName);
      setEmail(initialData.email);
      setPhone(initialData.phone || '');
      setDepartmentId(initialData.departmentId);
    }
  }, [initialData]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!firstName.trim()) newErrors.firstName = "Ім'я є обов'язковим";
    if (!lastName.trim()) newErrors.lastName = "Прізвище є обов'язковим";
    if (!email.trim()) newErrors.email = "Email є обов'язковим";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = 'Невірний формат email';
    if (!departmentId) newErrors.departmentId = "Відділ є обов'язковим";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data: CreateUserDto = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim() || null,
      departmentId,
    };

    onSubmit(data);
  };

  return (
    <form className="user-form" onSubmit={handleSubmit} id="user-form">
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label" htmlFor="field-firstName">
            Ім'я <span className="required">*</span>
          </label>
          <input
            id="field-firstName"
            type="text"
            className={`form-input ${errors.firstName ? 'form-input--error' : ''}`}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Введіть ім'я"
            disabled={isLoading}
          />
          {errors.firstName && <span className="form-error">{errors.firstName}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="field-lastName">
            Прізвище <span className="required">*</span>
          </label>
          <input
            id="field-lastName"
            type="text"
            className={`form-input ${errors.lastName ? 'form-input--error' : ''}`}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Введіть прізвище"
            disabled={isLoading}
          />
          {errors.lastName && <span className="form-error">{errors.lastName}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="field-email">
            Email <span className="required">*</span>
          </label>
          <input
            id="field-email"
            type="email"
            className={`form-input ${errors.email ? 'form-input--error' : ''}`}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            disabled={isLoading}
          />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="field-phone">
            Телефон
          </label>
          <input
            id="field-phone"
            type="tel"
            className="form-input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+380..."
            disabled={isLoading}
          />
        </div>

        <div className="form-group form-group--full">
          <label className="form-label" htmlFor="field-department">
            Відділ <span className="required">*</span>
          </label>
          <select
            id="field-department"
            className={`form-input form-select ${errors.departmentId ? 'form-input--error' : ''}`}
            value={departmentId}
            onChange={(e) => setDepartmentId(Number(e.target.value))}
            disabled={isLoading}
          >
            <option value={0}>Оберіть відділ</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          {errors.departmentId && <span className="form-error">{errors.departmentId}</span>}
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onCancel}
          disabled={isLoading}
          id="form-cancel"
        >
          Скасувати
        </button>
        <button
          type="submit"
          className="btn btn--primary"
          disabled={isLoading}
          id="form-submit"
        >
          {isLoading ? (
            <span className="btn__loader">⏳</span>
          ) : isEdit ? (
            'Зберегти зміни'
          ) : (
            'Створити користувача'
          )}
        </button>
      </div>
    </form>
  );
};

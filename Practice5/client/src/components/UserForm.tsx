import React, { useState, useEffect } from 'react';
import type { Department, User } from '../types/user';

interface UserFormProps {
  initialData?: User | null;
  departments: Department[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEdit?: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({
  initialData,
  departments,
  onSubmit,
  onCancel,
  isLoading = false,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    departmentId: departments.length > 0 ? departments[0].id : 0,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        departmentId: initialData.departmentId || (departments.length > 0 ? departments[0].id : 0),
      });
    } else if (departments.length > 0 && !formData.departmentId) {
      setFormData(prev => ({ ...prev, departmentId: departments[0].id }));
    }
  }, [initialData, departments]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName.trim()) newErrors.firstName = "Ім'я є обов'язковим";
    if (!formData.lastName.trim()) newErrors.lastName = "Прізвище є обов'язковим";
    
    if (!formData.email.trim()) {
      newErrors.email = "Email є обов'язковим";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Невірний формат email";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit({
        ...formData,
        departmentId: Number(formData.departmentId),
        phone: formData.phone.trim() || null,
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <form className="user-form form-grid" onSubmit={handleSubmit} id="user-form">
      <div className="form-group">
        <label htmlFor="firstName" className="form-label">Ім'я *</label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          className={`form-input ${errors.firstName ? 'form-input--error' : ''}`}
          value={formData.firstName}
          onChange={handleChange}
          disabled={isLoading}
        />
        {errors.firstName && <span className="form-error">{errors.firstName}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="lastName" className="form-label">Прізвище *</label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          className={`form-input ${errors.lastName ? 'form-input--error' : ''}`}
          value={formData.lastName}
          onChange={handleChange}
          disabled={isLoading}
        />
        {errors.lastName && <span className="form-error">{errors.lastName}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="email" className="form-label">Email *</label>
        <input
          type="email"
          id="email"
          name="email"
          className={`form-input ${errors.email ? 'form-input--error' : ''}`}
          value={formData.email}
          onChange={handleChange}
          disabled={isLoading}
        />
        {errors.email && <span className="form-error">{errors.email}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="phone" className="form-label">Телефон</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          className="form-input"
          value={formData.phone}
          onChange={handleChange}
          disabled={isLoading}
          placeholder="+380..."
        />
      </div>

      <div className="form-group form-group--full">
        <label htmlFor="departmentId" className="form-label">Відділ *</label>
        <select
          id="departmentId"
          name="departmentId"
          className="form-select"
          value={formData.departmentId}
          onChange={handleChange}
          disabled={isLoading || departments.length === 0}
        >
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-actions form-group--full">
        <button
          type="button"
          className="btn btn--ghost"
          onClick={onCancel}
          disabled={isLoading}
          id="cancel-form-btn"
        >
          Скасувати
        </button>
        <button
          type="submit"
          className="btn btn--primary"
          disabled={isLoading}
          id="submit-form-btn"
        >
          {isLoading ? 'Збереження...' : (isEdit ? 'Зберегти зміни' : 'Створити користувача')}
        </button>
      </div>
    </form>
  );
};

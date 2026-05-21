import React, { useMemo } from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Пошук користувачів...',
}) => {
  const inputId = useMemo(() => 'search-input', []);

  return (
    <div className="search-bar" id="search-bar">
      <span className="search-bar__icon">🔍</span>
      <input
        id={inputId}
        type="text"
        className="search-bar__input"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
      />
      {value && (
        <button
          className="search-bar__clear"
          onClick={() => onChange('')}
          title="Очистити пошук"
          id="search-clear"
        >
          ✕
        </button>
      )}
    </div>
  );
};

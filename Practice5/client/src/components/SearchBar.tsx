import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="search-bar" id="search-bar">
      <span className="search-bar__icon">🔍</span>
      <input
        type="text"
        className="search-bar__input"
        placeholder="Пошук за ім'ям або email..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        id="search-input"
      />
      {value && (
        <button
          className="search-bar__clear"
          onClick={() => onChange('')}
          id="search-clear-btn"
        >
          ✕
        </button>
      )}
    </div>
  );
};

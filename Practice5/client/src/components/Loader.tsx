import React from 'react';

interface LoaderProps {
  text?: string;
}

export const Loader: React.FC<LoaderProps> = ({ text = 'Завантаження...' }) => {
  return (
    <div className="loader" id="loader">
      <div className="loader__spinner" />
      <p className="loader__text">{text}</p>
    </div>
  );
};

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
  return (
    <div className="error-message" id="error-message">
      <span className="error-message__icon">⚠️</span>
      <span className="error-message__text">{message}</span>
      {onRetry && (
        <button className="btn btn--ghost btn--sm" onClick={onRetry} id="retry-btn">
          Повторити
        </button>
      )}
    </div>
  );
};

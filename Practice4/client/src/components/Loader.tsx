import React from 'react';

interface LoaderProps {
  text?: string;
}

export const Loader: React.FC<LoaderProps> = ({ text = 'Завантаження...' }) => {
  return (
    <div className="loader" id="loader">
      <div className="loader__spinner"></div>
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
      <div className="error-message__icon">⚠️</div>
      <p className="error-message__text">{message}</p>
      {onRetry && (
        <button className="btn btn--primary" onClick={onRetry} id="error-retry">
          Спробувати знову
        </button>
      )}
    </div>
  );
};

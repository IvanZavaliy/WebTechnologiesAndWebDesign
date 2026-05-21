import React, { createContext, useReducer, type ReactNode } from 'react';
import { usersReducer, initialUsersState, type UsersState, type UsersAction } from './usersReducer';

/* ──────────────────────────────────────────────
 *  React Context — засіб поширення стану
 * ────────────────────────────────────────────── */

interface UsersContextType {
  state: UsersState;
  dispatch: React.Dispatch<UsersAction>;
}

export const UsersContext = createContext<UsersContextType | undefined>(undefined);

interface UsersProviderProps {
  children: ReactNode;
}

export const UsersProvider: React.FC<UsersProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(usersReducer, initialUsersState);

  return (
    <UsersContext.Provider value={{ state, dispatch }}>
      {children}
    </UsersContext.Provider>
  );
};

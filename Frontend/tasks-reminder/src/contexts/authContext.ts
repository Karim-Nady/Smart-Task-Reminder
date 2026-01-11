import React, { createContext } from 'react';
import type { AuthState, AuthAction } from '../types';

export interface AuthContextType {
  authState: AuthState;
  authDispatch: React.Dispatch<AuthAction>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

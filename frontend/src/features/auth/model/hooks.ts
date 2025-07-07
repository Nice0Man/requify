import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/app/store';
import { loginUser, registerUser, logoutUser, getCurrentUser } from './store';
import { LoginCredentials, RegisterData } from './types';

export const useAuth = () => {
  const dispatch = useDispatch();
  const { user, token, isAuthenticated, isPending, error } = useSelector(
    (state: RootState) => state.auth
  );

  const login = (credentials: LoginCredentials) => {
    return dispatch(loginUser(credentials));
  };

  const register = (userData: RegisterData) => {
    return dispatch(registerUser(userData));
  };

  const logout = () => {
    return dispatch(logoutUser());
  };

  const getCurrentUserData = () => {
    return dispatch(getCurrentUser());
  };

  return {
    user,
    token,
    isAuthenticated,
    isPending,
    error,
    login,
    register,
    logout,
    getCurrentUserData
  };
}; 
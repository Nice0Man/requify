import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/app/store';
import { createNavigationActions } from './navigationActions';

// Custom hook для использования навигации с Redux
export const useNavigation = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  // Создаем navigation actions с текущими navigate и dispatch
  const navigationActions = createNavigationActions(navigate, dispatch);
  
  return navigationActions;
}; 
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';

export const useNotificationManagement = () => {
  const { notifications, unreadCount, isPending, error } = useSelector(
    (state: RootState) => state.notificationManagement
  );

  return {
    notifications,
    unreadCount,
    isPending,
    error
  };
}; 
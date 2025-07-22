import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

export const useAdminPanel = () => {
  const { users, systemSettings, auditLogs, isLoading, error } = useSelector(
    (state: RootState) => state.adminPanel
  );

  return {
    users,
    systemSettings,
    auditLogs,
    isLoading,
    error,
  };
};

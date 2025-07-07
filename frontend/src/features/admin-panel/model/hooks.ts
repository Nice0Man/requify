import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

export const useAdminPanel = () => {
  const { users, systemSettings, auditLogs, isPending, error } = useSelector(
    (state: RootState) => state.adminPanel
  );

  return {
    users,
    systemSettings,
    auditLogs,
    isPending,
    error,
  };
};

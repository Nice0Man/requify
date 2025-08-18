import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/app/store";
import { fetchDashboardStats } from "./store";

export const useDashboard = () => {
  const dispatch = useDispatch();
  const { stats, isLoading, error } = useSelector(
    (state: RootState) => state.dashboard
  );

  const loadStats = () => {
    return dispatch(fetchDashboardStats() as any);
  };

  return {
    stats,
    isLoading,
    error,
    loadStats,
  };
};

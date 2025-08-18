import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

export const useProjectManagement = () => {
  const { isLoading, error } = useSelector(
    (state: RootState) => state.projectManagement
  );

  return {
    isLoading,
    error,
    // TODO: Add projects and selectedProject to store when needed
    projects: [],
    selectedProject: null,
  };
};

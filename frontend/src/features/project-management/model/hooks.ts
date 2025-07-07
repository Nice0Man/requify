import { useSelector } from "react-redux";
import { RootState } from "@/app/store";

export const useProjectManagement = () => {
  const { projects, selectedProject, isPending, error } = useSelector(
    (state: RootState) => state.projectManagement
  );

  return {
    projects,
    selectedProject,
    isPending,
    error,
  };
};

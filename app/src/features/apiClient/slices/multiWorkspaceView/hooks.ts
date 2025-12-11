import { useSelector } from "react-redux";
import { RootState } from "store/types";

export function useMultiWorkspaceView() {
  return useSelector((state: RootState) => state.multiWorkspaceView);
}

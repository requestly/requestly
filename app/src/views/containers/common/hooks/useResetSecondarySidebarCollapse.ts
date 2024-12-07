import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { globalActions } from "store/slices/global/slice";

export const useResetSecondarySidebarCollapse = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(globalActions.updateSecondarySidebarCollapse(false));
  }, [dispatch]);
};

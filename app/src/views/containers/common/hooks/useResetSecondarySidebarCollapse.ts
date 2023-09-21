import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { actions } from "store";

export const useResetSecondarySidebarCollapse = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(actions.updateSecondarySidebarCollapse(false));
  }, [dispatch]);
};

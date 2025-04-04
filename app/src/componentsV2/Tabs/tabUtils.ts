import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { tabServiceStore } from "./store/tabServiceStore";

export const useSetUrl = () => {
  const navigate = useNavigate();

  const setUrl = useCallback(
    (newPath: string, preserveQueryParams = true) => {
      const currentUrl = new URL(window.location.href);
      const newUrl = new URL(window.location.href);
      newUrl.pathname = newPath;

      if (preserveQueryParams && currentUrl.search) {
        newUrl.search = currentUrl.search;
      } else {
        newUrl.search = "";
      }

      navigate(`${newUrl.pathname}${newUrl.search}`, {
        replace: true,
      });
    },
    [navigate]
  );

  return { setUrl };
};

export const getTabServiceActions = () => {
  const resetTabs = tabServiceStore.getState().reset;

  return { resetTabs };
};

import { actions } from "store";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSearchParams } from "react-router-dom";
import APP_CONSTANTS from "config/constants";

export const LoginRequiredHandler = (): null => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.has("loginRequired")) {
      dispatch(
        // @ts-ignore
        actions.toggleActiveModal({
          modalName: "authModal",
          newValue: true,
          newProps: {
            authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
          },
        })
      );
    }
  }, [dispatch, searchParams]);

  return null;
};

import STORAGE from "config/constants/sub/storage";
import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getAppMode } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { redirectToHome, redirectToOAuthUrl } from "utils/RedirectionUtils";
import "./bstackAuthStart.scss";

export const BStackAuthStart = () => {
  const navigate = useNavigate();

  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);

  const params = useRef(new URLSearchParams(window.location.search));

  useEffect(() => {
    const redirectURI = params.current.get("redirectURI");
    if (redirectURI) {
      window.localStorage.setItem(STORAGE.LOCAL_STORAGE.AUTH_TRIGGER_SOURCE_LOCAL_KEY, redirectURI);
    }
    if (user.loggedIn) {
      redirectToHome(appMode, navigate);
      return;
    }
    redirectToOAuthUrl(navigate);
  }, [user.loggedIn, navigate, appMode]);

  return (
    <div className="rq-bstack-auth-start-view">
      <div className="rq-bstack-auth-start-view__content">
        <div className="rq-bstack-auth-start-view__content-title">
          {" "}
          <Spin indicator={<LoadingOutlined spin />} />
          Redirecting...
        </div>
        <div className="rq-bstack-auth-start-view__content-description">
          Please wait while we are getting things ready for you.
        </div>
      </div>
    </div>
  );
};

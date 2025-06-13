import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { Typography } from "antd";
import { NudgePrompt } from "componentsV2/Nudge/NudgePrompt";
import { RQButton } from "lib/design-system-v2/components";
import { trackLoginButtonClicked } from "modules/analytics/events/common/auth/login";
import { SOURCE } from "modules/analytics/events/common/constants";
import { globalActions } from "store/slices/global/slice";
import { redirectToUrl } from "utils/RedirectionUtils";
import LINKS from "config/constants/sub/links";
import "./loggedOutView.scss";

const LoggedOutView = () => {
  const dispatch = useDispatch();

  const handleSignUp = useCallback(() => {
    trackLoginButtonClicked(SOURCE.API_CLIENT_EMPTY_STATE);
    dispatch(
      globalActions.toggleActiveModal({
        modalName: "authModal",
        newValue: true,
        newProps: {
          eventSource: SOURCE.API_CLIENT_EMPTY_STATE,
        },
      })
    );
  }, [dispatch]);

  const handleReadAnnouncementClick = useCallback(() => {
    redirectToUrl(LINKS.API_CLIENT_LOCAL_FIRST_ANNOUNCEMENT, true);
  }, []);
  return (
    <div className="api-client-logged-out-view">
      <NudgePrompt
        icon={"/assets/media/apiClient/mandatory-login.svg"}
        buttons={[
          <RQButton type="secondary" onClick={handleReadAnnouncementClick}>
            Read announcement
          </RQButton>,
          <RQButton type="primary" onClick={handleSignUp}>
            Sign in to get started
          </RQButton>,
        ]}
      >
        <div className="api-client-logged-out-view_content">
          <Typography.Title level={5}>Please sign in to use API client</Typography.Title>
          <Typography.Text className="api-client-logged-out-view_description">
            Requestly API client requires an account for <span className="success">secure</span> workspace
            collaboration. A <span className="success">local-first</span> version is coming soon, and creating an
            account will no longer be required!
          </Typography.Text>
        </div>
      </NudgePrompt>
    </div>
  );
};

export default LoggedOutView;

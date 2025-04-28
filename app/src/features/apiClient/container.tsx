import React, { useCallback } from "react";
import { ApiClientProvider } from "./contexts";
import APIClientSidebar from "./screens/apiClient/components/sidebar/APIClientSidebar";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useDispatch, useSelector } from "react-redux";
import { NudgePrompt } from "componentsV2/Nudge/NudgePrompt";
import { Typography } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import { globalActions } from "store/slices/global/slice";
import { redirectToUrl } from "utils/RedirectionUtils";
import LINKS from "config/constants/sub/links";
import { TabsContainer } from "componentsV2/Tabs/components/TabsContainer";
import { TabServiceProvider } from "componentsV2/Tabs/store/TabServiceContextProvider";
import "./container.scss";

const ApiClientFeatureContainer: React.FC = () => {
  const user = useSelector(getUserAuthDetails);
  const dispatch = useDispatch();

  const handleSignUp = useCallback(() => {
    dispatch(globalActions.toggleActiveModal({ modalName: "authModal", newValue: true }));
  }, [dispatch]);

  const handleReadAnnouncementClick = useCallback(() => {
    redirectToUrl(LINKS.API_CLIENT_LOCAL_FIRST_ANNOUNCEMENT, true);
  }, []);

  const loggedOutView = (
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
          <Typography.Title level={5}>Please sign in first to use API client</Typography.Title>
          <Typography.Text className="api-client-logged-out-view_description">
            Requestly API client requires an account for <span className="success">secure</span> workspace
            collaboration. A <span className="success">local-first</span> version is coming soon, and creating an
            account will no longer be required!
          </Typography.Text>
        </div>
      </NudgePrompt>
    </div>
  );

  if (!user.loggedIn) {
    return (
      <div className="api-client-container">
        <APIClientSidebar />
        {loggedOutView}
      </div>
    );
  }

  return (
    <TabServiceProvider>
      <ApiClientProvider>
        <div className="api-client-container">
          <APIClientSidebar />
          {user.loggedIn ? <TabsContainer /> : <>{loggedOutView}</>}
        </div>
      </ApiClientProvider>
    </TabServiceProvider>
  );
};

export default ApiClientFeatureContainer;

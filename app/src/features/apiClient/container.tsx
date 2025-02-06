import React, { useCallback } from "react";
import { Outlet } from "react-router-dom";
import { ApiClientProvider } from "./contexts";
import APIClientSidebar from "./screens/apiClient/components/sidebar/APIClientSidebar";
import { TabsLayoutContainer } from "layouts/TabsLayout";
import "./container.scss";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { useDispatch, useSelector } from "react-redux";
import { NudgePrompt } from "componentsV2/Nudge/NudgePrompt";
import mandatoryLoginIcon from "./assets/mandatory-login.svg";
import { Typography } from "antd";
import { RQButton } from "lib/design-system-v2/components";
import { globalActions } from "store/slices/global/slice";
import { redirectToUrl } from "utils/RedirectionUtils";
import LINKS from "config/constants/sub/links";

const ApiClientFeatureContainer: React.FC = () => {
  const user = useSelector(getUserAuthDetails);
  const dispatch = useDispatch();

  const handleSignUp = useCallback(() => {
    dispatch(globalActions.toggleActiveModal({ modalName: "authModal", newValue: true }));
  }, [dispatch]);

  const handleReadAnnouncementClick = useCallback(() => {
    redirectToUrl(LINKS.API_CLIENT_LOCAL_FIRST_ANNOUNCEMENT, true);
  }, []);

  return (
    <TabsLayoutContainer id="apiClient">
      <ApiClientProvider>
        <div className="api-client-container">
          <APIClientSidebar />
          {user.loggedIn ? (
            <TabsLayoutContainer.TabsLayoutContent Outlet={(props: any) => <Outlet {...props} />} />
          ) : (
            <div className="api-client-logged-out-view">
              <NudgePrompt
                icon={mandatoryLoginIcon}
                buttons={[
                  <RQButton type="secondary" onClick={handleReadAnnouncementClick}>
                    Read announcement
                  </RQButton>,
                  <RQButton type="primary" onClick={handleSignUp}>
                    Sign up to get started
                  </RQButton>,
                ]}
              >
                <div className="api-client-logged-out-view_content">
                  <Typography.Title level={5}>Please login first to use API client</Typography.Title>
                  <Typography.Text className="api-client-logged-out-view_description">
                    Requestly API client requires an account for <span className="success">secure</span> workspace
                    collaboration. A <span className="success">local-first</span> version is coming soon, and creating
                    an account will no longer be required!
                  </Typography.Text>
                </div>
              </NudgePrompt>
            </div>
          )}
        </div>
      </ApiClientProvider>
    </TabsLayoutContainer>
  );
};

export default ApiClientFeatureContainer;

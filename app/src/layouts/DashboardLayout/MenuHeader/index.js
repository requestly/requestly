import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Layout, Button, Row, Col, Tooltip, Divider } from "antd";
import { getAppMode, getIsMiscTourCompleted, getIsPlanExpiredBannerClosed, getUserAuthDetails } from "store/selectors";
import { actions } from "store";
import HeaderUser from "./HeaderUser";
import HeaderText from "./HeaderText";
import { SearchOutlined } from "@ant-design/icons";
import { redirectToSettings } from "utils/RedirectionUtils";
// import GitHubButton from "react-github-btn";
import { useMediaQuery } from "react-responsive";
import Settings from "assets/icons/settings.svg?react";
import LINKS from "config/constants/sub/links";
import { RQButton } from "lib/design-system/components";
import WorkspaceSelector from "./WorkspaceSelector";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { isGoodbyePage, isInvitePage, isPricingPage } from "utils/PathUtils";
import { trackHeaderClicked, trackTopbarClicked } from "modules/analytics/events/common/onboarding/header";
import ProductsDropDown from "./ProductsDropDown";
import PremiumPlanBadge from "./PremiumPlanBadge/PremiumPlanBadge";
import APP_CONSTANTS from "config/constants";
import { PlanExpiredBadge } from "./PlanExpiredBadge";
import { RequestBot, trackAskAIClicked } from "features/requestBot";
import BotIcon from "./assets/bot.svg";
import { ProductWalkthrough } from "components/misc/ProductWalkthrough";
import { MISC_TOURS, TOUR_TYPES } from "components/misc/ProductWalkthrough/constants";
import { useFeatureIsOn } from "@growthbook/growthbook-react";
import "./MenuHeader.css";

const { Header } = Layout;
const { PATHS } = APP_CONSTANTS;

const PATHS_WITHOUT_HEADER = [PATHS.PRICING.RELATIVE, PATHS.INVITE.INDEX, PATHS.SETTINGS.RELATIVE];

const MenuHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);

  const isTabletView = useMediaQuery({ query: "(max-width: 1200px)" });
  const isPricingOrGoodbyePage = isPricingPage() || isGoodbyePage() || isInvitePage();
  const isPlanExpiredBannerClosed = useSelector(getIsPlanExpiredBannerClosed);
  const isMiscTourCompleted = useSelector(getIsMiscTourCompleted);
  const isIncentivizationEnabled = useFeatureIsOn("incentivization_onboarding");

  const [isRequestBotVisible, setIsRequestBotVisible] = useState(false);

  //don't show general app header component for editor screens
  const showMenuHeader = () => !PATHS_WITHOUT_HEADER.some((path) => pathname.includes(path));

  return showMenuHeader() ? (
    <>
      <ProductWalkthrough
        completeTourOnUnmount={false}
        tourFor={MISC_TOURS.APP_ENGAGEMENT.ASK_AI}
        startWalkthrough={!isMiscTourCompleted.askAI}
        onTourComplete={() =>
          dispatch(
            actions.updateProductTourCompleted({
              tour: TOUR_TYPES.MISCELLANEOUS,
              // TODO: FIX WALKTHROUGH COMPONENT, SUBTOUR SHOULD BE PASSED AS A CONSTANT
              subTour: "askAI",
            })
          )
        }
      />
      <Header className="layout-header">
        <Row wrap={false} align="middle" className="w-full">
          {!isPricingOrGoodbyePage ? (
            <Col
              span={9}
              flex="1 0 auto"
              className={appMode === GLOBAL_CONSTANTS.APP_MODES.EXTENSION ? "extension" : "desktop"}
            >
              <div className="header-left-section">
                <WorkspaceSelector />

                <a
                  target="_blank"
                  rel="noreferrer"
                  href={LINKS.YOUTUBE_TUTORIALS}
                  onClick={() => trackTopbarClicked("tutorials")}
                >
                  Tutorials
                </a>
                <ProductsDropDown />
              </div>
            </Col>
          ) : null}

          {appMode !== GLOBAL_CONSTANTS.APP_MODES.EXTENSION && (
            <Col xs={0} sm={0} md={0} lg={!isPricingOrGoodbyePage ? (isTabletView ? 10 : 8) : 10}>
              <div className="header-middle-section">
                <HeaderText />
              </div>
            </Col>
          )}

          <Col className="ml-auto">
            <div className="header-right-section">
              <Row align="middle" gutter={8} wrap={false}>
                {appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP &&
                user?.details?.planDetails?.status === "canceled" &&
                isPlanExpiredBannerClosed ? (
                  <div className="hidden-on-small-screen">
                    <PlanExpiredBadge />
                  </div>
                ) : null}
                <RQButton
                  type="default"
                  className="header-search-btn"
                  onClick={() => dispatch(actions.updateIsCommandBarOpen(true))}
                >
                  <div>
                    <SearchOutlined /> Search
                  </div>
                  <div className="search-shortcut-annotation">⌘+K</div>
                </RQButton>
                {/* TEMPORARILY HIDDEN  */}
                {/* <Col className="hidden-on-small-screen">
                <span className="github-star-button" onClick={() => trackHeaderClicked("github_star_button")}>
                  <GitHubButton
                    style={{ display: "flex" }}
                    className="github-star-button"
                    href="https://github.com/requestly/requestly"
                    data-color-scheme="dark_dimmed"
                    data-text="Star"
                    data-show-count="true"
                    aria-label="Star Requestly on GitHub"
                  />
                </span>
              </Col> */}
                <RQButton
                  className="ask-ai-btn"
                  onClick={() => {
                    trackAskAIClicked();
                    setIsRequestBotVisible(true);
                    dispatch(
                      actions.updateProductTourCompleted({
                        tour: TOUR_TYPES.MISCELLANEOUS,
                        subTour: "askAI",
                      })
                    );
                  }}
                  data-tour-id={MISC_TOURS.APP_ENGAGEMENT.ASK_AI}
                >
                  <div className="ask-ai-btn-content">
                    <img src={BotIcon} alt="bot" />
                    Ask AI
                  </div>
                </RQButton>

                <Divider type="vertical" className="header-vertical-divider hidden-on-small-screen" />

                {(appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ||
                  (appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP &&
                    user?.details?.planDetails?.status !== "canceled" &&
                    !isIncentivizationEnabled)) && (
                  <Col>
                    <PremiumPlanBadge />
                  </Col>
                )}

                {/* settings */}
                <Col>
                  <Tooltip title={<span className="text-gray text-sm">Settings</span>}>
                    <Button
                      type="text"
                      className="header-icon-btn"
                      icon={<Settings />}
                      onClick={() => {
                        trackHeaderClicked("settings");
                        redirectToSettings(navigate, window.location.pathname, "header");
                      }}
                    />
                  </Tooltip>
                </Col>
                <HeaderUser />
              </Row>
            </div>
          </Col>
        </Row>
      </Header>

      <RequestBot isOpen={isRequestBotVisible} onClose={() => setIsRequestBotVisible(false)} />
    </>
  ) : null;
};

export default MenuHeader;

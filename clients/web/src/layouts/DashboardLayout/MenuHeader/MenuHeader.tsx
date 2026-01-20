import { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Header } from "antd/lib/layout/layout";
import WorkspaceSelector from "./WorkspaceSelector/WorkspaceSelector";
import DesktopAppProxyInfo from "components/sections/Navbars/NavbarRightContent/DesktopAppProxyInfo";
import { trackHeaderClicked, trackTopbarClicked } from "modules/analytics/events/common/onboarding/header";
import LINKS from "config/constants/sub/links";
import { RQButton } from "lib/design-system-v2/components";
import { globalActions } from "store/slices/global/slice";
import BotIcon from "assets/icons/bot.svg?react";
import Settings from "assets/icons/settings.svg?react";
import HeaderUser from "./HeaderUser";
import { redirectToSettings } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
import { isSafariBrowser } from "actions/ExtensionActions";
import { getAppMode, getRequestBot } from "store/selectors";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { Col } from "antd";
import PremiumPlanBadge from "./PremiumPlanBadge/PremiumPlanBadge";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import GitHubButton from "react-github-btn";
import "./menuHeader.scss";

export const MenuHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);
  const requestBotDetails = useSelector(getRequestBot);

  const gitHubStarButton = useMemo(() => {
    return (
      <span className="github-star-button" onClick={() => trackHeaderClicked("github_star_button")}>
        <GitHubButton
          href="https://github.com/requestly/requestly"
          data-color-scheme="dark_dimmed"
          data-text="Star"
          data-show-count="true"
          aria-label="Star Requestly on GitHub"
        />
      </span>
    );
  }, []);

  return (
    <Header className="app-primary-header">
      <div className="app-primary-header-section app-primary-header__left">
        <WorkspaceSelector />
        <a
          target="_blank"
          rel="noreferrer"
          href={LINKS.YOUTUBE_TUTORIALS}
          onClick={() => trackTopbarClicked("tutorials")}
          className="no-drag app-primary-header-link"
        >
          Tutorials
        </a>
      </div>
      <div className="app-primary-header-section app-primary-header__mid no-drag">
        <DesktopAppProxyInfo />
      </div>
      <div className="app-primary-header-section app-primary-header__right no-drag">
        <div className="header-gap-wide">
          {!isSafariBrowser() &&
            (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ||
              (appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP &&
                user?.details?.planDetails?.status !== "canceled")) && (
              <Col className="no-drag">
                <PremiumPlanBadge />
              </Col>
            )}

          {/* TEMPORARY DISABLED */}
          {/* <RQButton
            size="small"
            className="header-search-btn no-drag"
            onClick={() => dispatch(globalActions.updateIsCommandBarOpen(true))}
          >
            <div className="header-search-btn-content">
              <SearchOutlined /> Search
            </div>
            <div className="search-shortcut-annotation">⌘+K</div>
          </RQButton> */}
        </div>
        <div className="app-primary-header__right-section">
          <div>{gitHubStarButton}</div>
          <RQButton
            type="transparent"
            icon={<BotIcon />}
            onClick={(e) => {
              e.stopPropagation();
              const isCurrentlyActive = requestBotDetails?.isActive;
              dispatch(
                globalActions.updateRequestBot({
                  isActive: !isCurrentlyActive,
                  modelType: "app",
                })
              );
            }}
          >
            Ask AI
          </RQButton>
        </div>

        <div className="app-primary-header__right-section">
          <RQButton type="transparent" icon={<Settings />} onClick={() => redirectToSettings(navigate)} />
          <HeaderUser />
        </div>
      </div>
    </Header>
  );
};

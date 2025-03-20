import { useDispatch, useSelector } from "react-redux";
import { Header } from "antd/lib/layout/layout";
import WorkspaceSelector from "./WorkspaceSelector";
import DesktopAppProxyInfo from "components/sections/Navbars/NavbarRightContent/DesktopAppProxyInfo";
import { trackTopbarClicked } from "modules/analytics/events/common/onboarding/header";
import LINKS from "config/constants/sub/links";
import { RQButton } from "lib/design-system-v2/components";
import { SearchOutlined } from "@ant-design/icons";
import { globalActions } from "store/slices/global/slice";
import BotIcon from "assets/icons/bot.svg?react";
import Settings from "assets/icons/settings.svg?react";
import HeaderUser from "./HeaderUser";
import { redirectToSettings } from "utils/RedirectionUtils";
import { useLocation, useNavigate } from "react-router-dom";
import { ProxyServerStatusIcon } from "componentsV2/ProxyServerStatusIcon/ProxyServerStatusIcon";
import { isSafariBrowser } from "actions/ExtensionActions";
import { getAppMode } from "store/selectors";
import PATHS from "config/constants/sub/paths";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import "./menuHeader.scss";
import { Col } from "antd";
import PremiumPlanBadge from "./PremiumPlanBadge/PremiumPlanBadge";
import { getUserAuthDetails } from "store/slices/global/user/selectors";

const PATHS_WITHOUT_HEADER = [PATHS.PRICING.RELATIVE, PATHS.INVITE.INDEX, PATHS.SETTINGS.RELATIVE];
const PATHS_WITHOUT_PROXY_SERVER_ICON = [PATHS.RULES.RELATIVE, PATHS.DESKTOP.INTERCEPT_TRAFFIC.RELATIVE];

export const MenuHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);

  const isHeaderVisible = !PATHS_WITHOUT_HEADER.some((path) => pathname.includes(path));
  const showProxyServerIcon = !PATHS_WITHOUT_PROXY_SERVER_ICON.some((path) => pathname.includes(path));

  // const gitHubStarButton = useMemo(() => {
  //   return (
  //     <span className="github-star-button" onClick={() => trackHeaderClicked("github_star_button")}>
  //       <GitHubButton
  //         href="https://github.com/requestly/requestly"
  //         data-color-scheme="dark_dimmed"
  //         data-text="Star"
  //         data-show-count="true"
  //         aria-label="Star Requestly on GitHub"
  //       />
  //     </span>
  //   );
  // }, []);

  if (!isHeaderVisible) {
    return null;
  }

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
        <a
          target="_blank"
          rel="noreferrer"
          href={LINKS.REQUESTLY_LANDING_HOME}
          onClick={() => trackTopbarClicked("tutorials")}
          className="no-drag app-primary-header-link"
        >
          Website
        </a>
      </div>
      <div className="app-primary-header-section app-primary-header__mid no-drag">
        <DesktopAppProxyInfo />
      </div>
      <div className="app-primary-header-section app-primary-header__right no-drag">
        <div className="header-gap-wide">
          {showProxyServerIcon ? (
            <div className="header-proxy-server-status-icon">
              <ProxyServerStatusIcon showTooltip />
            </div>
          ) : null}
          {!isSafariBrowser() &&
            (appMode === GLOBAL_CONSTANTS.APP_MODES.DESKTOP ||
              (appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP &&
                user?.details?.planDetails?.status !== "canceled")) && (
              <Col className="no-drag">
                <PremiumPlanBadge />
              </Col>
            )}
          <RQButton
            size="small"
            className="header-search-btn no-drag"
            onClick={() => dispatch(globalActions.updateIsCommandBarOpen(true))}
          >
            <div className="header-search-btn-content">
              <SearchOutlined /> Search
            </div>
            <div className="search-shortcut-annotation">⌘+K</div>
          </RQButton>
        </div>
        {/* <div>{gitHubStarButton}</div> */}
        <RQButton
          type="transparent"
          icon={<BotIcon />}
          onClick={() => dispatch(globalActions.updateRequestBot({ isActive: true, modelType: "app" }))}
        />
        <RQButton type="transparent" icon={<Settings />} onClick={() => redirectToSettings(navigate)} />
        <HeaderUser />
      </div>
    </Header>
  );
};

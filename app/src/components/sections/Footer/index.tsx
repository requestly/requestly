import React, { useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { Typography, Row, Col, Dropdown, MenuProps } from "antd";
import { ReadOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { PiBookOpenTextBold } from "@react-icons/all-files/pi/PiBookOpenTextBold";
import { RiVideoLine } from "@react-icons/all-files/ri/RiVideoLine";
import { MdOutlineHistory } from "@react-icons/all-files/md/MdOutlineHistory";
import { HiOutlineSparkles } from "@react-icons/all-files/hi2/HiOutlineSparkles";
import { FiGithub } from "@react-icons/all-files/fi/FiGithub";
import { FiMail } from "@react-icons/all-files/fi/FiMail";
import { PiChatTextBold } from "@react-icons/all-files/pi/PiChatTextBold";
import { globalActions } from "store/slices/global/slice";
import { redirectToUrl } from "utils/RedirectionUtils";
import APP_CONSTANTS from "config/constants";
import { Footer } from "antd/lib/layout/layout";
import { trackFooterClicked } from "modules/analytics/events/common/onboarding/footer";
import { getExtensionVersion, isExtensionInstalled } from "actions/ExtensionActions";
import { getAppVersion, isAppInstalled } from "actions/DesktopActions";
import "./Footer.css";

enum FOOTER_LINKS {
  DOCUMENTATION = "Documentation",
  TUTORIALS = "Tutorials",
  CHANGELOG = "Changelog",
  AI_ASSISTANT = "AI Assistant",
  BUGS_FEATURE_REQUEST = "Bugs & feature request",
  BILLING_ACCOUNT_QUERIES = "Billing & account queries",
  CONTACT_SALES = "Contact sales",
}

const { Text } = Typography;
const { PATHS } = APP_CONSTANTS;
const PAGES_WITHOUT_FOOTER = [PATHS.SETTINGS.RELATIVE];

const AppFooter: React.FC = () => {
  const { pathname } = useLocation();
  const dispatch = useDispatch();

  const helpItems: MenuProps["items"] = useMemo(() => {
    return [
      {
        type: "group",
        label: "Learn & Explore",
        children: [
          {
            label: FOOTER_LINKS.DOCUMENTATION,
            key: FOOTER_LINKS.DOCUMENTATION,
            icon: <PiBookOpenTextBold />,
            onClick: () => {
              handleFooterLinkClick(APP_CONSTANTS.LINKS.REQUESTLY_DOCS, FOOTER_LINKS.DOCUMENTATION);
            },
          },
          {
            label: FOOTER_LINKS.TUTORIALS,
            key: FOOTER_LINKS.TUTORIALS,
            icon: <RiVideoLine />,
            onClick: () => {
              handleFooterLinkClick(APP_CONSTANTS.LINKS.YOUTUBE_API_CLIENT_TUTORIALS, FOOTER_LINKS.TUTORIALS);
            },
          },
          {
            label: FOOTER_LINKS.CHANGELOG,
            key: FOOTER_LINKS.CHANGELOG,
            icon: <MdOutlineHistory />,
            onClick: () => {
              handleFooterLinkClick(APP_CONSTANTS.LINKS.CHANGELOG, FOOTER_LINKS.CHANGELOG);
            },
          },
        ],
      },
      {
        type: "divider",
      },
      {
        type: "group",
        label: "Support",
        children: [
          {
            label: FOOTER_LINKS.AI_ASSISTANT,
            key: FOOTER_LINKS.AI_ASSISTANT,
            icon: <HiOutlineSparkles />,
            onClick: () => {
              dispatch(globalActions.updateRequestBot({ isActive: true, modelType: "app" }));
              trackFooterClicked(FOOTER_LINKS.AI_ASSISTANT);
            },
          },
          {
            label: FOOTER_LINKS.BUGS_FEATURE_REQUEST,
            key: FOOTER_LINKS.BUGS_FEATURE_REQUEST,
            icon: <FiGithub />,
            onClick: () => {
              handleFooterLinkClick(APP_CONSTANTS.LINKS.REQUESTLY_GITHUB_ISSUES, FOOTER_LINKS.BUGS_FEATURE_REQUEST);
            },
          },
          {
            label: FOOTER_LINKS.BILLING_ACCOUNT_QUERIES,
            key: FOOTER_LINKS.BILLING_ACCOUNT_QUERIES,
            icon: <FiMail />,
            onClick: () => {
              handleFooterLinkClick(APP_CONSTANTS.LINKS.CONTACT_US, FOOTER_LINKS.BILLING_ACCOUNT_QUERIES);
            },
          },
        ],
      },
      {
        type: "divider",
      },
      {
        type: "group",
        label: "Sales & Queries",
        children: [
          {
            label: FOOTER_LINKS.CONTACT_SALES,
            key: FOOTER_LINKS.CONTACT_SALES,
            icon: <PiChatTextBold />,
            onClick: () => {
              openFreshChat();
            },
          },
        ],
      },
    ];
  }, [dispatch]);

  const handleFooterLinkClick = (link: string, key: string) => {
    redirectToUrl(link, true);
    trackFooterClicked(key);
  };

  const openFreshChat = () => {
    if (window.fcWidget && typeof window.fcWidget.open === "function") {
      window.fcWidget.open();
    } else {
      redirectToUrl(APP_CONSTANTS.LINKS.BOOK_A_DEMO, true);
    }
    trackFooterClicked(FOOTER_LINKS.CONTACT_SALES);
  };

  if (PAGES_WITHOUT_FOOTER.some((path) => pathname.includes(path))) return null;

  return (
    <>
      <Footer className="app-layout-footer">
        <Row align="middle" justify="space-between" className="w-full">
          <div className="display-flex items-center">
            {isExtensionInstalled() && <span className="extension-version">v{getExtensionVersion()}</span>}
            {isAppInstalled() && <span className="extension-version">v{getAppVersion()}</span>}
          </div>

          <Col className="ml-auto">
            <div className="app-footer-links">
              <Text
                onClick={() => handleFooterLinkClick(APP_CONSTANTS.LINKS.REQUESTLY_DOCS, FOOTER_LINKS.DOCUMENTATION)}
              >
                <ReadOutlined />
                Documentation
              </Text>
              <Dropdown trigger={["click"]} menu={{ items: helpItems }}>
                <Text>
                  <QuestionCircleOutlined />
                  Help
                </Text>
              </Dropdown>
            </div>
          </Col>
        </Row>
      </Footer>
    </>
  );
};

export default AppFooter;

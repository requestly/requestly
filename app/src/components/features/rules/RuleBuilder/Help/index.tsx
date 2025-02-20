import React, { useEffect, useRef, useState } from "react";
import { Button, Col, Row, DrawerProps } from "antd";
import { InfoCircleOutlined } from "@ant-design/icons";
import "react-medium-image-zoom/dist/styles.css";
import LeftArrow from "assets/icons/left-arrow.svg?react";
import RightArrow from "assets/icons/right-arrow.svg?react";
import { ExternalLink } from "./types";
import APP_CONSTANTS from "config/constants";
import {
  trackDocsSidebarContactUsClicked,
  trackDocsSidebarSecondaryCategoryClicked,
} from "modules/analytics/events/common/rules";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import { RuleDetailsPanel } from "views/features/rules/RuleEditor/components/RuleDetailsPanel/RuleDetailsPanel";
import "./Help.scss";
import "react-notion/src/styles.css";
import "prismjs/themes/prism-tomorrow.css";
import { RULE_DETAILS } from "views/features/rules/RuleEditor/components/RuleDetailsPanel/constants";
import { sampleRuleDetails } from "features/rules/screens/rulesList/components/RulesList/constants";
import { getCurrentlySelectedRuleData } from "store/selectors";
import { useSelector } from "react-redux";
import { RuleType } from "@requestly/shared/types/entities/rules";

const externalLinks: ExternalLink[] = [
  {
    title: "Tutorial videos",
    link: APP_CONSTANTS.LINKS.YOUTUBE_TUTORIALS,
  },
  {
    title: "Troubleshooting",
    link: APP_CONSTANTS.LINKS.REQUESTLY_EXTENSION_TROUBLESHOOTING,
  },
  {
    title: "Shared workspace",
    link: APP_CONSTANTS.LINKS.DEMO_VIDEOS.TEAM_WORKSPACES,
  },
  {
    title: "HTTP modifications",
    link: APP_CONSTANTS.LINKS.REQUESTLY_DOCS_HTTP_MODIFICATIONS,
  },
  {
    title: "Request a feature",
    link: APP_CONSTANTS.LINKS.REQUESTLY_GITHUB_ISSUES,
  },
  {
    title: "Ask GitHub community",
    link: APP_CONSTANTS.LINKS.REQUESTLY_GITHUB_ISSUES, // TODO: update link
  },
];

const ruleTypeToNotionDocIdMap = {
  [RuleType.REDIRECT]: "7265677fb9b445a2aa629cb64501af45",
  [RuleType.CANCEL]: "69f41c9988804640b35a2ccb50f6a2cd",
  [RuleType.REPLACE]: "415445cb486048c6ab75ce34a41c5025",
  [RuleType.HEADERS]: "4688854c33f34d618439c9388081289a",
  [RuleType.QUERYPARAM]: "53c4702625a746b8a43c919b9ca235c9",
  [RuleType.SCRIPT]: "c727eb7e5b3942169b10f267ecaf7e31",
  [RuleType.RESPONSE]: "f05b11e6643348f0a3acbb583a3289be",
  [RuleType.REQUEST]: "72808fff78fb4ea3ae893ffdc8a52422",
  [RuleType.DELAY]: "2e02669c8e6246e993aab6c3d7e6e428",
  [RuleType.USERAGENT]: "8522c44d1f1a42e1aad766847f9d4785",
};

const defaultMockUrls = {
  [RuleType.REDIRECT]: "https://requestly.dev/api/mockv2/redirect-url-editor-doc?teamId=LmyapmzY39XTFXvua6eX",
  [RuleType.CANCEL]: "https://requestly.dev/api/mockv2/cancel-url-editor-doc?teamId=LmyapmzY39XTFXvua6eX",
  [RuleType.REPLACE]: "https://requestly.dev/api/mockv2/replace-rule-editor-doc?teamId=LmyapmzY39XTFXvua6eX",
  [RuleType.HEADERS]: "https://requestly.dev/api/mockv2/modify-header-editor-doc?teamId=LmyapmzY39XTFXvua6eX",
  [RuleType.QUERYPARAM]: "https://requestly.dev/api/mockv2/query-param-editor-doc?teamId=LmyapmzY39XTFXvua6eX",
  [RuleType.SCRIPT]: "https://requestly.dev/api/mockv2/insert-script-editor-doc?teamId=LmyapmzY39XTFXvua6eX",
  [RuleType.RESPONSE]: "https://requestly.dev/api/mockv2/modify-response-editor-doc?teamId=LmyapmzY39XTFXvua6eX",
  [RuleType.REQUEST]: "https://requestly.dev/api/mockv2/modify-request-editor-doc?teamId=LmyapmzY39XTFXvua6eX",
  [RuleType.DELAY]: "https://requestly.dev/api/mockv2/delay-request-editor-doc?teamId=LmyapmzY39XTFXvua6eX",
  [RuleType.USERAGENT]: "https://requestly.dev/api/mockv2/user-agent-editor-doc?teamId=LmyapmzY39XTFXvua6eX",
};

interface HelpProps {
  ruleType: RuleType;
  onClose: DrawerProps["onClose"];
}

const Help: React.FC<HelpProps> = ({ ruleType, onClose }) => {
  const [isDocsVisible, setIsDocsVisible] = useState<boolean>(false);
  const [_notionPageData, setNotionPageData] = useState(null);
  const [_tableOfContents, setTableOfContents] = useState(null);
  const documentationListRef = useRef<HTMLDivElement | null>(null);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const isSampleRule = currentlySelectedRuleData?.isSample;

  const toggleDocs = () => {
    if (isDocsVisible) {
      setTimeout(() => {
        if (documentationListRef.current) {
          documentationListRef.current.scrollTop = 0;
        }
      }, 0);
    }
    setIsDocsVisible((prev) => !prev);
  };

  const updateDocTableOfContent = (data: any[]) => {
    if (data) {
      const headers = Object.values(data).reduce((acc, elem) => {
        if (elem?.value?.type === "header") {
          acc.push({ id: elem.value.id, title: elem.value.properties.title[0][0] });
        }
        return acc;
      }, []);
      setTableOfContents(headers);
    }
  };

  useEffect(() => {
    fetch(`https://notion-api.splitbee.io/v1/page/${ruleTypeToNotionDocIdMap[ruleType]}`)
      .then((res) => res.json())
      .then((data) => {
        setNotionPageData(data);
        updateDocTableOfContent(data);
      })
      .catch((error) => {
        fetch(`${defaultMockUrls[ruleType]}`)
          .then((res) => res.json())
          .then((data) => {
            setNotionPageData(data);
            updateDocTableOfContent(data);
          });
      });
  }, [ruleType]);

  // TODO: cleanup

  return (
    <div className="rule-editor-help-container">
      <div className="rule-editor-help-content-container">
        <Row align="middle" justify="space-between" className="w-full rule-editor-help-header">
          <Col className="title items-center">
            {isDocsVisible && (
              <Button onClick={toggleDocs} icon={<LeftArrow />} className="rule-editor-help-back-btn" />
            )}
            Help and guide
          </Col>
          <Col>
            <Button onClick={onClose} icon={<MdClose className="anticon" />} className="rule-editor-help-close-btn" />
          </Col>
        </Row>

        <div className="rule-editor-help-content">
          {!isDocsVisible ? (
            <RuleDetailsPanel
              isSample={isSampleRule}
              ruleDetails={
                isSampleRule ? sampleRuleDetails[currentlySelectedRuleData.sampleId].details : RULE_DETAILS[ruleType]
              }
              source="docs_sidebar"
            />
          ) : null}

          {isDocsVisible ? null : (
            <>
              {/* internal links */}
              <div ref={documentationListRef} className="rule-editor-help-lists">
                {/* external links */}
                <div className="caption text-gray text-bold rule-editor-help-title">
                  <InfoCircleOutlined />
                  Help categories
                </div>
                <ul className="rule-editor-help-list external-links">
                  {externalLinks.map(({ title, link }) => (
                    <li key={title}>
                      <a
                        href={link}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => trackDocsSidebarSecondaryCategoryClicked(ruleType, title.toLowerCase())}
                      >
                        {title} <RightArrow />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
      {/* footer */}
      <Row className="rule-editor-help-footer">
        <Button
          onClick={() => {
            trackDocsSidebarContactUsClicked(ruleType);
            window.open(APP_CONSTANTS.LINKS.CONTACT_US_PAGE, "_blank");
          }}
        >
          Contact us
        </Button>
      </Row>
    </div>
  );
};

export default Help;

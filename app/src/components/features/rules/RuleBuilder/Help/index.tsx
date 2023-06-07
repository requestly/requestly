import React, { useEffect, useRef, useState, useCallback } from "react";
import { Button, Col, Row, Skeleton, Collapse } from "antd";
import { CompassOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { YouTubePlayer } from "components/misc/YoutubeIframe";
import { NotionRenderer } from "react-notion";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { RQCollapse } from "lib/design-system/components/RQCollapse";
import { ReactComponent as Cross } from "assets/icons/cross.svg";
import { ReactComponent as LeftArrow } from "assets/icons/left-arrow.svg";
import { ReactComponent as RightArrow } from "assets/icons/right-arrow.svg";
import { RuleType } from "types/rules";
import { TocItem, ExternalLink } from "./types";
import { snakeCase } from "lodash";
import APP_CONSTANTS from "config/constants";
import { rulesData } from "components/landing/ruleSelection/rules-data";
import {
  trackDocsSidebarClosed,
  trackDocsSidebarPrimaryCategoryClicked,
  trackDocsSidebarSecondaryCategoryClicked,
  trackDocsSidebarDemovideoWatched,
  trackDocsSidebarContactUsClicked,
} from "modules/analytics/events/common/rules";
import "./Help.css";
import "react-notion/src/styles.css";
import "prismjs/themes/prism-tomorrow.css";

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

interface HelpProps {
  ruleType: RuleType;
  setShowDocs: (showDocs: boolean) => void;
}

const Help: React.FC<HelpProps> = ({ ruleType, setShowDocs }) => {
  const [isDocsVisible, setIsDocsVisible] = useState<boolean>(false);
  const [notionPageData, setNotionPageData] = useState(null);
  const [tableOfContents, setTableOfContents] = useState(null);
  const documentationListRef = useRef<HTMLDivElement | null>(null);

  const handleScrollToSection = useCallback((id: string) => {
    const target = document.getElementById(id);
    if (target) {
      const { offsetTop } = target;
      const parentContainer = target.parentNode.parentNode as HTMLElement;
      parentContainer.scrollTop = offsetTop - 87;
    }
  }, []);

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

  const handleDemoVideoPlay = () => {
    trackDocsSidebarDemovideoWatched(ruleType);
  };

  const handleDocumentationListItemClick = (title: string, handler: () => void) => {
    toggleDocs();
    setTimeout(() => handler(), 0);
    trackDocsSidebarPrimaryCategoryClicked(ruleType, snakeCase(title));
  };

  const updateDocTableOfContent = (data: any[]) => {
    const headers = [];
    if (data) {
      for (const key in data) {
        const elem = data[key];
        if (elem?.value?.type === "header") {
          headers.push({ id: elem.value.id, title: elem.value.properties.title[0][0] });
        }
      }
      setTableOfContents(headers);
    }
  };

  useEffect(() => {
    fetch(`https://notion-api.splitbee.io/v1/page/${ruleTypeToNotionDocIdMap[ruleType]}`)
      .then((res) => res.json())
      .then((data) => {
        setNotionPageData(data);
        updateDocTableOfContent(data);
      });
  }, [ruleType]);

  return (
    <div className="rule-editor-help-container">
      <div className="rule-editor-help-content">
        <Row align="middle" justify="space-between" className="w-full rule-editor-help-header">
          <Col className="title items-center">
            {isDocsVisible && (
              <Button onClick={toggleDocs} icon={<LeftArrow />} className="rule-editor-help-back-btn" />
            )}
            Help
          </Col>

          <Button
            title="Close"
            icon={<Cross />}
            className="rule-editor-docs-close-btn"
            onClick={() => {
              setShowDocs(false);
              trackDocsSidebarClosed(ruleType);
            }}
          />
        </Row>

        {isDocsVisible ? (
          <>
            <div className="rule-editor-docs">
              <NotionRenderer
                blockMap={notionPageData}
                customBlockComponents={{
                  image: ({ blockValue }) => {
                    return (
                      <Zoom classDialog="rule-editor-docs-image">
                        <img
                          width="260px"
                          height="100px"
                          alt="rule editor example"
                          src={blockValue?.properties?.source[0][0]}
                        />
                      </Zoom>
                    );
                  },
                  header: ({ blockValue }) => {
                    return (
                      <h1 className="notion-h1" id={blockValue?.id}>
                        {blockValue?.properties?.title[0][0]}
                      </h1>
                    );
                  },
                  video: ({ blockValue }) => {
                    return (
                      <YouTubePlayer
                        width="320"
                        height="160"
                        handleOnPlay={handleDemoVideoPlay}
                        src={blockValue?.properties?.source[0][0]}
                      />
                    );
                  },
                  toggle: ({ blockValue, blockMap }) => {
                    return (
                      <RQCollapse accordion className="rule-editor-docs-faqs-collapse">
                        <Collapse.Panel key={0} header={blockValue?.properties?.title[0][0]}>
                          <NotionRenderer blockMap={{ [blockValue?.content[0]]: blockMap[blockValue?.content[0]] }} />
                        </Collapse.Panel>
                      </RQCollapse>
                    );
                  },
                }}
              />
            </div>
          </>
        ) : (
          <>
            {/* internal links */}
            <div ref={documentationListRef} className="rule-editor-help-lists">
              <div className="caption text-gray text-bold rule-editor-help-title">
                <CompassOutlined />
                Documentation for {rulesData[ruleType]?.name}
              </div>
              <ul className="rule-editor-help-list">
                <>
                  {tableOfContents?.length ? (
                    <>
                      {" "}
                      {tableOfContents.map(({ title, id }: TocItem) => (
                        <li
                          key={id}
                          id={id}
                          onClick={() => handleDocumentationListItemClick(title, () => handleScrollToSection(id))}
                        >
                          <Button>{title}</Button>
                        </li>
                      ))}
                    </>
                  ) : (
                    <Skeleton
                      active
                      paragraph={{ rows: 4, width: ["90%", "90%", "90%", "90%"] }}
                      className="rule-editor-doc-skeleton"
                    />
                  )}
                </>
              </ul>

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

      {/* footer */}
      <Row className="rule-editor-help-footer">
        <Button
          className="ml-auto"
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

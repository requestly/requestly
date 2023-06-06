import React, { useEffect, useRef, useState, useCallback, ReactNode } from "react";
import { Button, Col, Row, Collapse } from "antd";
import { CompassOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { YouTubePlayer } from "components/misc/YoutubeIframe";
import APP_CONSTANTS from "config/constants";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
import { RQCollapse } from "lib/design-system/components/RQCollapse";
import { ReactComponent as Cross } from "assets/icons/cross.svg";
import { ReactComponent as LeftArrow } from "assets/icons/left-arrow.svg";
import { ReactComponent as RightArrow } from "assets/icons/right-arrow.svg";
import { RuleType } from "types/rules";
import { snakeCase } from "lodash";
import {
  trackDocsSidebarClosed,
  trackDocsSidebarPrimaryCategoryClicked,
  trackDocsSidebarSecondaryCategoryClicked,
  trackDocsSidebarDemovideoWatched,
  trackDocsSidebarContactUsClicked,
} from "modules/analytics/events/common/rules";
import "./Help.css";
import "react-notion/src/styles.css";
import { NotionRenderer } from "react-notion";
import { TocItem, ExternalLink } from "./types";

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

interface HelpProps {
  ruleType: RuleType;
  setShowDocs: (showDocs: boolean) => void;
}

const Help: React.FC<HelpProps> = ({ ruleType, setShowDocs }) => {
  const [isDocsVisible, setIsDocsVisible] = useState<boolean>(false);
  const [notionPageData, setNotionPageData] = useState(null);
  const [tableOfContents, setTableOfContents] = useState(null);
  const documentationListRef = useRef<HTMLDivElement | null>(null);

  const renderFAQDescription = (data: any) => {
    return data.map((item: ReactNode, index: number) => {
      if (Array.isArray(item)) {
        if (item.length === 1) {
          return <span key={index}>{item[0]}</span>;
        } else {
          const linkText = item[0];
          const [linkHref, linkUrl] = item[1][0];
          if (linkHref === "a") {
            return (
              <span key={index}>
                <a href={linkUrl}>{linkText}</a>
              </span>
            );
          }
          return null;
        }
      } else {
        return <span key={index}>{item}</span>;
      }
    });
  };

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

  const GetDocTableOfContents = (data: any[]) => {
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

  const fetchRuleDocFromNotionPage = async () => {
    const data = await fetch("https://notion-api.splitbee.io/v1/page/023f63c7f9fd4baebb558f28c531ae90").then((res) =>
      res.json()
    );
    setNotionPageData(data);
    GetDocTableOfContents(data);
    console.log({ data }); // TODO: remove this
  };

  useEffect(() => {
    fetchRuleDocFromNotionPage();
  }, []);

  console.log({ tableOfContents }); // TODO: remove this

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
                  toggle: ({ blockValue }) => {
                    console.log({ blockValue });
                    return (
                      <RQCollapse accordion className="rule-editor-docs-faqs-collapse">
                        <Collapse.Panel key={0} header={blockValue?.properties?.title[0][0]}>
                          <p>
                            {renderFAQDescription(notionPageData[blockValue?.content[0]]?.value?.properties?.title)}
                          </p>
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
                Documentation for Redirect request {/* TODO: change according to rule type */}
              </div>
              <ul className="rule-editor-help-list">
                <>
                  {tableOfContents?.length && (
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

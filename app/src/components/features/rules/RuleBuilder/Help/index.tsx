import React, { useCallback, useMemo, useRef, useState } from "react";
import { Button, Col, Collapse, Row } from "antd";
import { CompassOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { YouTubePlayer } from "components/misc/YoutubeIframe";
import APP_CONSTANTS from "config/constants";
import { RQCollapse } from "lib/design-system/components/RQCollapse";
import { ReactComponent as Cross } from "assets/icons/cross.svg";
import { ReactComponent as LeftArrow } from "assets/icons/left-arrow.svg";
import { ReactComponent as RightArrow } from "assets/icons/right-arrow.svg";
import { RuleType } from "types/rules";
import {
  trackDocsSidebarPrimaryCategoryClicked,
  trackDocsSidebarSecondaryCategoryClicked,
  trackDocsSidebarDemovideoWatched,
  trackDocsSidebarContactUsClicked,
} from "modules/analytics/events/common/rules";
import "./Help.css";

const externalLinks: { title: string; link: string }[] = [
  {
    title: "Tutorial videos",
    link: APP_CONSTANTS.LINKS.YOUTUBE_TUTORIALS,
  },
  {
    title: "Troubleshooting",
    link: APP_CONSTANTS.LINKS.TUTORIALS.REDIRECT_RULE,
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

// type ScrollLogicalPosition = "center" | "end" | "nearest" | "start";

// interface ScrollIntoViewOptions {
//   behavior?: "auto" | "smooth";
//   block?: ScrollLogicalPosition;
//   inline?: ScrollLogicalPosition;
// }

interface HelpProps {
  ruleType: RuleType;
  setShowDocs: (showDocs: boolean) => void;
}

const Help: React.FC<HelpProps> = ({ ruleType, setShowDocs }) => {
  const [isDocsVisible, setIsDocsVisible] = useState<boolean>(false);
  const introductionRef = useRef<HTMLDivElement | null>(null);
  const argumentsRef = useRef<HTMLDivElement | null>(null);
  const demoVideoRef = useRef<HTMLDivElement | null>(null);
  const useCasesRef = useRef<HTMLDivElement | null>(null);
  const testingRuleRef = useRef<HTMLDivElement | null>(null);
  const examplesRef = useRef<HTMLDivElement | null>(null);
  const faqsRef = useRef<HTMLDivElement | null>(null);

  const handleDocumentationList = useCallback(
    (ref: React.MutableRefObject<HTMLDivElement>) => {
      // const scrollIntoViewOptions: ScrollIntoViewOptions = {
      //   block: "nearest",
      //   inline: "center",
      // };

      // ref.current?.scrollIntoView(scrollIntoViewOptions);
      if (ref.current) {
        // const offsetTop = ref.current.offsetTop;
        // ref.current.scrollTop = offsetTop - 56;
        // console.log(offsetTop - 56);
      }
      ref.current.scrollTo(0, 0);
    },
    []
  );

  const documentationList: {
    title: string;
    onClick: () => void;
  }[] = useMemo(() => {
    return [
      {
        title: "Introduction",
        onClick: () => handleDocumentationList(introductionRef),
      },
      {
        title: "Arguments",
        onClick: () => handleDocumentationList(argumentsRef),
      },
      {
        title: "Demo",
        onClick: () => handleDocumentationList(demoVideoRef),
      },
      {
        title: "Popular Use cases",
        onClick: () => handleDocumentationList(useCasesRef),
      },
      {
        title: "Testing Rule",
        onClick: () => handleDocumentationList(testingRuleRef),
      },
      {
        title: "Examples",
        onClick: () => handleDocumentationList(examplesRef),
      },
      {
        title: "FAQs",
        onClick: () => handleDocumentationList(faqsRef),
      },
    ];
  }, [handleDocumentationList]);

  const toggleDocs = () => setIsDocsVisible((prev) => !prev);

  const handleDemoVideoPlay = () => {
    trackDocsSidebarDemovideoWatched(ruleType);
  };

  return (
    <div className="rule-editor-help-container">
      <div className="rule-editor-help-content">
        {/* header */}
        <Row
          align="middle"
          justify="space-between"
          className="w-full rule-editor-help-header"
        >
          <Col className="title items-center">
            {isDocsVisible && (
              <Button
                onClick={toggleDocs}
                icon={<LeftArrow />}
                className="rule-editor-help-back-btn"
              />
            )}
            Help
          </Col>

          <Button
            title="Close"
            icon={<Cross />}
            className="rule-editor-docs-close-btn"
            onClick={() => setShowDocs(false)}
          />
        </Row>

        {isDocsVisible ? (
          <>
            <div className="rule-editor-docs">
              <div
                // id="introduction"
                ref={introductionRef}
                className="rule-editor-docs-intro"
              >
                <div className="title rule-editor-docs-rule-name">
                  Redirect request
                </div>
                <div className="text-gray">
                  Redirect rule allows to redirect scripts, APIs, Stylesheets,
                  or any other resource from one environment to another.
                </div>
              </div>

              <div
                // id="arguments"
                ref={argumentsRef}
                className="docs-section rule-editor-docs-arguments"
              >
                <div className="title">Arguments</div>
                <div>
                  {`method (string)- The HTTP method of the request. GET | POST | PUT | DELETE etc.
                    url (string) - The request URL.
                    response (string)- The original response object represented as string. Eg:
                    '{"id":1,"app":"requestly","feature":"modify-request"}'
                    responseType (string)- The content-type of the HTTP response.
                    requestHeaders (Object<string, string>)- The request headers sent to the server.
                    requestData (string)- The HTTP request payload in case of POST | PUT | PATCH requests.
                    responseJSON (JSON object)- The original response represented as JSON Object:`}
                </div>
              </div>

              <div
                // id="demo"
                ref={demoVideoRef}
                className="docs-section rule-editor-docs-demo-video"
              >
                <div className="title">Demo Video</div>
                <YouTubePlayer
                  width="260"
                  height="160"
                  handleOnPlay={handleDemoVideoPlay}
                  src="https://www.youtube.com/embed/lOt1kGKTq-w"
                />
              </div>

              <div
                // id="popular use cases"
                ref={useCasesRef}
                className="docs-section rule-editor-docs-use-cases"
              >
                <div className="title">Popular use cases</div>
                <ul>
                  <li>
                    You want to work on front-end while back-end is not
                    available or ready yet.
                  </li>
                  <li>
                    You want to test application behavior when provided altered
                    data.
                  </li>

                  <li>
                    You want to simulate errors by returning different status
                    codes.
                  </li>
                  <li>
                    You want to modify API responses but don't have access to
                    the back-end.
                  </li>
                </ul>
              </div>

              <div
                // id="testing rule"
                ref={testingRuleRef}
                className="docs-section rule-editor-docs-testing-rule"
              >
                <div className="title">Testing rule</div>
                <ul>
                  <li>
                    You want to work on front-end while back-end is not
                    available or ready yet.
                  </li>
                  <li>
                    You want to test application behavior when provided altered
                    data.
                  </li>

                  <li>
                    You want to simulate errors by returning different status
                    codes.
                  </li>
                  <li>
                    You want to modify API responses but don't have access to
                    the back-end.
                  </li>
                </ul>
              </div>

              <div
                // id="examples"
                ref={examplesRef}
                className="docs-section rule-editor-docs-examples"
              >
                <div className="title">Examples</div>
                <ul>
                  <li>
                    You want to work on front-end while back-end is not
                    available or ready yet.
                  </li>
                </ul>
              </div>

              <div
                // id="faqs"
                ref={faqsRef}
                className="docs-section rule-editor-docs-faqs"
              >
                <div className="title">FAQs</div>
                <RQCollapse
                  accordion
                  className="rule-editor-docs-faqs-collapse"
                >
                  <Collapse.Panel
                    key={0}
                    header="How do I know if the rule is executed on the page?"
                  >
                    <p>
                      Please use{" "}
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href="https://docs.requestly.io/guides/know-if-rule-executed-on-page"
                      >
                        this
                      </a>{" "}
                      guide to check if the rule was executed or not
                    </p>
                  </Collapse.Panel>
                  <Collapse.Panel
                    key={1}
                    header="Can I redirect https URL to HTTP URLs"
                  >
                    <p>
                      Yes, Redirect Rule supports redirecting from HTTPS to HTTP
                      and vice-versa
                    </p>
                  </Collapse.Panel>
                  <Collapse.Panel
                    key={2}
                    header="Can you redirect it to a local file?"
                  >
                    <p>
                      Right now this is not possible in Browser Extension. But
                      you can use our{" "}
                      <a
                        target="_blank"
                        rel="noreferrer"
                        href="https://docs.requestly.io/desktop-app/mac/features/map-local"
                      >
                        desktop app
                      </a>{" "}
                      to redirect to a local file (Map Local)
                    </p>
                  </Collapse.Panel>
                </RQCollapse>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* internal links */}
            <div className="rule-editor-help-lists">
              <div className="caption text-gray text-bold rule-editor-help-title">
                <CompassOutlined />
                Documentation for Modify Headers
              </div>
              <ul className="rule-editor-help-list">
                {documentationList.map(({ title, onClick }) => (
                  <li key={title}>
                    {/* <a href={`#${title.toLowerCase()}`}> */}
                    <Button
                      onClick={() => {
                        toggleDocs();
                        setTimeout(() => onClick(), 100);
                        trackDocsSidebarPrimaryCategoryClicked(
                          ruleType,
                          title.toLowerCase()
                        );
                      }}
                    >
                      {title}
                    </Button>
                    {/* </a> */}
                  </li>
                ))}
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
                      onClick={() =>
                        trackDocsSidebarSecondaryCategoryClicked(
                          ruleType,
                          title.toLowerCase()
                        )
                      }
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

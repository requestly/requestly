import React, { useMemo, useRef, useState } from "react";
import { Button, Col, Row } from "antd";
import {
  ArrowLeftOutlined,
  CloseOutlined,
  CompassOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { YouTubePlayer } from "components/misc/YoutubeIframe";
//@ts-ignore
import { ReactComponent as RightArrow } from "assets/icons/right-arrow.svg";
import { trackRuleDemoVideoClicked } from "modules/analytics/events/common/rules";
import "./Help.css";

const externalLinks: { title: string; link: string }[] = [
  { title: "Tutorial videos", link: "" },
  { title: "Troubleshooting", link: "" },
  { title: "Shared workspace", link: "" },
  { title: "HTTP modifications", link: "" },
  { title: "Request a feature", link: "" },
  { title: "Ask GitHub community", link: "" },
];

const Help: React.FC = () => {
  const [isDocsVisible, setIsDocsVisible] = useState<boolean>(false);
  const introductionRef = useRef<HTMLDivElement | null>(null);
  const argumentsRef = useRef<HTMLDivElement | null>(null);
  const demoVideoRef = useRef<HTMLDivElement | null>(null);
  const useCasesRef = useRef<HTMLDivElement | null>(null);
  const testingRuleRef = useRef<HTMLDivElement | null>(null);
  const examplesRef = useRef<HTMLDivElement | null>(null);
  const faqsRef = useRef<HTMLDivElement | null>(null);

  type ScrollBehavior = "auto" | "smooth";
  type ScrollLogicalPosition = "center" | "end" | "nearest" | "start";

  interface ScrollIntoViewOptions {
    behavior?: ScrollBehavior;
    block?: ScrollLogicalPosition;
    inline?: ScrollLogicalPosition;
  }

  const documentationList: {
    title: string;
    onClick: () => void;
  }[] = useMemo(() => {
    const scrollIntoViewOptions: ScrollIntoViewOptions = {
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    };

    return [
      {
        title: "Introduction",
        onClick: () => {
          introductionRef.current?.scrollIntoView(scrollIntoViewOptions);
        },
      },
      {
        title: "Arguments",
        onClick: () => {
          argumentsRef.current?.scrollIntoView(scrollIntoViewOptions);
        },
      },
      {
        title: "Demo",
        onClick: () => {
          demoVideoRef.current?.scrollIntoView(scrollIntoViewOptions);
        },
      },
      {
        title: "Popular Use cases",
        onClick: () => {
          useCasesRef.current?.scrollIntoView(scrollIntoViewOptions);
        },
      },
      {
        title: "Testing Rule",
        onClick: () => {
          testingRuleRef.current?.scrollIntoView(scrollIntoViewOptions);
        },
      },
      {
        title: "Examples",
        onClick: () => {
          examplesRef.current?.scrollIntoView(scrollIntoViewOptions);
        },
      },
      {
        title: "FAQs",
        onClick: () => {
          faqsRef.current?.scrollIntoView(scrollIntoViewOptions);
        },
      },
    ];
  }, []);

  const toggleDocs = () => setIsDocsVisible((prev) => !prev);

  const handleDemoVideoPlay = () => {
    trackRuleDemoVideoClicked("Redirect", "rule_editor");
  };

  return (
    <div className="rule-editor-help-container">
      <div className="rule-editor-help-content">
        {/* header */}
        <Row className="w-full" align="middle" justify="space-between">
          <Col className="title">
            {isDocsVisible && (
              <Button
                onClick={toggleDocs}
                icon={<ArrowLeftOutlined />}
                className="rule-editor-help-back-btn"
              />
            )}
            Help
          </Col>
          <Col>
            <CloseOutlined />
          </Col>
        </Row>

        {isDocsVisible ? (
          <>
            <div className="rule-editor-docs">
              <div ref={introductionRef}>
                <div className="title rule-editor-docs-rule-name">
                  Redirect request
                </div>
                <div className="text-gray">
                  Redirect rule allows to redirect scripts, APIs, Stylesheets,
                  or any other resource from one environment to another.
                </div>
              </div>

              <div ref={argumentsRef} className="rule-editor-docs-arguments">
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

              <div ref={demoVideoRef} className="rule-editor-docs-demo-video">
                <div className="title">Demo Video</div>
                <YouTubePlayer
                  width="260"
                  height="160"
                  handleOnPlay={handleDemoVideoPlay}
                  src="https://www.youtube.com/embed/lOt1kGKTq-w"
                />
              </div>

              <div ref={useCasesRef} className="rule-editor-docs-use-cases">
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
                ref={testingRuleRef}
                className="rule-editor-docs-testing-rule"
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

              <div ref={examplesRef} className="rule-editor-docs-examples">
                <div className="title">Examples</div>
                <ul>
                  <li>
                    You want to work on front-end while back-end is not
                    available or ready yet.
                  </li>
                </ul>
              </div>

              <div ref={faqsRef} className="rule-editor-docs-faqs">
                <div className="title">FAQs</div>
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
            </div>
          </>
        ) : (
          <>
            {/* internal links */}
            <div>
              <div className="caption text-gray text-bold rule-editor-help-title">
                <CompassOutlined />
                Documentation for Modify Headers
              </div>
              <ul className="rule-editor-help-list">
                {documentationList.map(({ title, onClick }) => (
                  <li key={title}>
                    <Button
                      onClick={() => {
                        toggleDocs();
                        setTimeout(() => onClick(), 100);
                      }}
                    >
                      {title}
                    </Button>
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
                    <a href={link} target="_blank" rel="noreferrer">
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
        <Button className="ml-auto">Contact us</Button>
      </Row>
    </div>
  );
};

export default Help;

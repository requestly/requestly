import React, { useEffect, useRef, useState, useCallback } from "react";
import { Button, Col, Row } from "antd";
import { CompassOutlined, InfoCircleOutlined } from "@ant-design/icons";
// import { YouTubePlayer } from "components/misc/YoutubeIframe";
import APP_CONSTANTS from "config/constants";
import Zoom from "react-medium-image-zoom";
import "react-medium-image-zoom/dist/styles.css";
// import { RQCollapse } from "lib/design-system/components/RQCollapse";
import { ReactComponent as Cross } from "assets/icons/cross.svg";
import { ReactComponent as LeftArrow } from "assets/icons/left-arrow.svg";
import { ReactComponent as RightArrow } from "assets/icons/right-arrow.svg";
import { RuleType } from "types/rules";
import { snakeCase } from "lodash";
import {
  trackDocsSidebarClosed,
  trackDocsSidebarPrimaryCategoryClicked,
  trackDocsSidebarSecondaryCategoryClicked,
  // trackDocsSidebarDemovideoWatched,
  trackDocsSidebarContactUsClicked,
} from "modules/analytics/events/common/rules";
import "./Help.css";
import "react-notion/src/styles.css";
import { NotionRenderer } from "react-notion";
import { TocItem } from "./types";

type ExternalLink = { title: string; link: string };

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

// const Link: React.FC<{ text: string; href: string }> = ({ text, href }) => (
//   <a target="_blank" rel="noreferrer" href={href}>
//     {text}
//   </a>
// );

// type DocumentationListItem = {
//   title: string;
//   onClick: () => void;
// };

interface HelpProps {
  ruleType: RuleType;
  setShowDocs: (showDocs: boolean) => void;
}

const Help: React.FC<HelpProps> = ({ ruleType, setShowDocs }) => {
  const [isDocsVisible, setIsDocsVisible] = useState<boolean>(false);
  const [notionPageData, setNotionPageData] = useState(null);
  const [tableOfContents, setTableOfContents] = useState(null);
  const documentationListRef = useRef<HTMLDivElement | null>(null);
  // const getStartedRef = useRef<HTMLDivElement | null>(null);
  // const demoVideoRef = useRef<HTMLDivElement | null>(null);
  // const howToCreateRuleRef = useRef<HTMLDivElement | null>(null);
  // const useCasesRef = useRef<HTMLDivElement | null>(null);
  // const testingRuleRef = useRef<HTMLDivElement | null>(null);
  // const examplesRef = useRef<HTMLDivElement | null>(null);
  // const faqsRef = useRef<HTMLDivElement | null>(null);

  const handleScrollToSection = useCallback((id: string) => {
    const target = document.getElementById(id);
    if (target) {
      const { offsetTop } = target;
      const parentContainer = target.parentNode.parentNode as HTMLElement;
      parentContainer.scrollTop = offsetTop - 87;
    }
  }, []);

  // const documentationList: DocumentationListItem[] = useMemo(() => {
  //   return [
  //     {
  //       title: "Get Started",
  //       onClick: () => handleDocumentationList(getStartedRef),
  //     },
  //     {
  //       title: "Demo",
  //       onClick: () => handleDocumentationList(demoVideoRef),
  //     },
  //     {
  //       title: "How to create a redirect rule?",
  //       onClick: () => handleDocumentationList(howToCreateRuleRef),
  //     },
  //     {
  //       title: "Popular Use cases",
  //       onClick: () => handleDocumentationList(useCasesRef),
  //     },
  //     {
  //       title: "Testing Rule",
  //       onClick: () => handleDocumentationList(testingRuleRef),
  //     },
  //     {
  //       title: "Examples",
  //       onClick: () => handleDocumentationList(examplesRef),
  //     },
  //     {
  //       title: "FAQ",
  //       onClick: () => handleDocumentationList(faqsRef),
  //     },
  //   ];
  // }, [handleDocumentationList]);

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

  // const handleDemoVideoPlay = () => {
  //   trackDocsSidebarDemovideoWatched(ruleType);
  // };

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
        {/* header */}
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
                }}
              />
              {/* <div ref={getStartedRef} className="rule-editor-docs-intro">
                <div className="title rule-editor-docs-rule-name">URL Redirect Rule</div>
                <p className="text-gray">
                  The redirect Rule helps in changing the HTTP Requests location to a new destination as per the
                  configured rule so that the response is transparently served from the new location as if that was the
                  original request.
                </p>
              </div>

              <div ref={demoVideoRef} className="docs-section rule-editor-docs-demo-video">
                <div className="title">Demo Video</div>
                <YouTubePlayer
                  width="260"
                  height="160"
                  handleOnPlay={handleDemoVideoPlay}
                  src="https://www.youtube.com/embed/lOt1kGKTq-w"
                />
              </div>

              <div ref={howToCreateRuleRef} className="docs-section rule-editor-docs-create-rule">
                <div className="title">How to create a redirect rule?</div>
                <Zoom classDialog="rule-editor-docs-image">
                  <img
                    width="260px"
                    height="100px"
                    alt="redirect rule editor"
                    src="/assets/img/rule-editor/redirect-rule-editor.png"
                  />
                </Zoom>
                <ol>
                  <li>
                    <span>Source Condition:</span> Source condition is where you set criteria for which requests will
                    match the. You can use <code>URL</code>, <code>Host</code> or <code>Path with Regex</code>,{" "}
                    <code>Contains</code>, <code>Wildcard</code> or <code>Equals to match the source request</code>.
                    Learn more about source conditions{" "}
                    <Link text="here" href="https://docs.requestly.io/guides/source-condition" />.
                  </li>
                  <li>
                    <span>Destination URL:</span> The destination to which the users will be redirected based on the
                    source condition.
                  </li>
                  <li>
                    <span>Source Filters:</span> You can define advanced targeting conditions and restrict rules to be
                    applied on specific request types, request methods, or request payloads. Learn more about source
                    filters{" "}
                    <Link
                      text="here"
                      href="https://docs.requestly.io/browser-extension/chrome/features/advance-targeting"
                    />
                    .
                  </li>
                </ol>
              </div>

              <div ref={testingRuleRef} className="docs-section rule-editor-docs-testing-rule">
                <div className="title">Testing rule</div>
                <p className="text-gray">
                  To test if the rule is properly configured or not, use the Test this Rule feature at the bottom of the
                  Rule Editor. This can help you verify if the source conditions are matching to the URL you want to
                  test or not.
                </p>
                <Zoom classDialog="rule-editor-docs-image">
                  <img
                    width="280px"
                    height="120px"
                    alt="testing redirect rule"
                    src="/assets/img/rule-editor/test-redirect-rule.png"
                  />
                </Zoom>
              </div>

              <div ref={useCasesRef} className="docs-section rule-editor-docs-use-cases">
                <div className="title">Popular use cases</div>
                <ul>
                  <li>
                    <span>Redirect Production to Local Environment:</span> Map your production scripts or APIs to your
                    local running code and test your local code directly on production sites without deployment.{" "}
                    <Link
                      text="Here's"
                      href="https://requestly.io/blog/how-to-load-local-js-files-on-live-production-sites"
                    />{" "}
                    an article with more explanation.
                  </li>
                  <li>
                    <span>Redirect to local System files (Map Local):</span> With the Map Local feature, you can
                    directly replace the production scripts with the local files. Any change in the local files will be
                    instantly reflected in production. You can find more details{" "}
                    <Link text="here" href="https://docs.requestly.io/desktop-app/mac/features/map-local" /> .
                  </li>
                  <li>
                    <span>Test API version changes:</span> Suppose there is a new version of some API which you are
                    using. To test the backward compatibility of the API, you can just set up a redirect rule to
                    redirect all URLs from the older version to the newer version and check if your application behaves
                    as expected. This way, you don't need to change a single line of your code and test the API
                    upgrades.
                  </li>
                  <li>
                    <span>Fix Broken URLs, Redirect dead bookmarks, and Create URL shortcuts:</span> You can set up a
                    redirect rule to fix some broken URLs, redirect the dead bookmarks to new working bookmarks and
                    create URL shortcuts.
                  </li>
                  <li>
                    <span>Swap Tag Manager scripts from production to staging/dev environment:</span> Test your dev
                    implementation in tag manager scripts like Adobe DTM, Tealium Tag, and Google Tag Manager Containers
                    before pushing them live on client websites. Learn more{" "}
                    <Link
                      text="here"
                      href="https://requestly.io/blog/replace-adobe-launch-production-script-with-development-script"
                    />
                    .
                  </li>
                </ul>
              </div>

              <div ref={examplesRef} className="docs-section rule-editor-docs-examples">
                <div className="title">Examples</div>
                <ul>
                  <li>
                    <Link
                      text="Redirect Google queries to Duckduckgo"
                      href="https://app.requestly.io/rules#sharedList/1679464393107-Google-to-DuckDuckGo"
                    />
                  </li>
                  <li>
                    <Link
                      text="Load Google Analytics in Debug Mode"
                      href="https://app.requestly.io/shared-lists/viewer/1643984301107-Load-Google-Analytics-in-Debug-Mode?template=true"
                    />
                  </li>
                  <li>
                    <Link
                      text="Change the Default Dictionary in Adobe Acrobat Reader to Merriam-Webster"
                      href="https://app.requestly.io/rules#sharedList/1679464587448-Change-the-Default-Dictionary-in-Adobe-Acrobat-Reader-to-Merriam-Webster"
                    />
                  </li>
                </ul>
              </div>

              <div ref={faqsRef} className="docs-section rule-editor-docs-faqs">
                <div className="title">FAQs</div>
                <RQCollapse accordion className="rule-editor-docs-faqs-collapse">
                  <Collapse.Panel key={0} header="How do I know if the rule is executed on the page?">
                    <p>
                      Please use{" "}
                      <Link text="this" href="https://docs.requestly.io/guides/know-if-rule-executed-on-page" /> guide
                      to check if the rule was executed or not
                    </p>
                  </Collapse.Panel>
                  <Collapse.Panel key={1} header="Can I redirect https URL to HTTP URLs">
                    <p>Yes, Redirect Rule supports redirecting from HTTPS to HTTP and vice-versa</p>
                  </Collapse.Panel>
                  <Collapse.Panel key={2} header="Can you redirect it to a local file?">
                    <p>
                      Right now this is not possible in Browser Extension. But you can use our{" "}
                      <Link text="desktop app" href="https://docs.requestly.io/desktop-app/mac/features/map-local" /> to
                      redirect to a local file (Map Local)
                    </p>
                  </Collapse.Panel>
                </RQCollapse>
              </div> */}
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
                          <Button
                          //TODO: add scroll
                          >
                            {title}
                          </Button>
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

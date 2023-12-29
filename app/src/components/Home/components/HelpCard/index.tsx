import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Col } from "antd";
import callIcon from "../../assets/call.svg";
import infoIcon from "../../assets/info.svg";
import communityIcon from "../../assets/community.svg";
import documentIcon from "../../assets/document.svg";
import bookIcon from "../../assets/book.svg";
import PATHS from "config/constants/sub/paths";
import "./helpCard.scss";

export const HelpCard: React.FC = () => {
  const helperLinks = useMemo(
    () => [
      // TODO: Add links to the hrefs
      {
        icon: <img src={infoIcon} alt="info" />,
        title: "What is requestly?",
        href: "https://requestly.io/blog/what-is-requestly/",
      },
      {
        icon: <img src={documentIcon} alt="document" />,
        title: "Getting started with Requestly",
        href: PATHS.GETTING_STARTED,
        openInNewTab: false,
      },
      {
        icon: <img src={bookIcon} alt="community" />,
        title: "Read official documentation",
        href: "https://developers.requestly.io",
      },
      {
        icon: <img src={communityIcon} alt="community" />,
        title: "Community",
        href: "https://requestlycommunity.slack.com/ssb/redirect",
      },
      {
        icon: <img src={callIcon} alt="call" />,
        title: "Schedule a demo",
        href: "https://calendly.com/requestly/sagar",
      },
    ],
    []
  );

  return (
    <>
      <Col className="help-card-title">Quick help</Col>
      <Col>
        {helperLinks.map((link) => {
          return (
            <Link
              rel="noopener noreferrer"
              target={link.openInNewTab ? "_blank" : "_self"}
              to={link.href}
              className="help-card-link"
            >
              <Col>{link.icon}</Col>
              <Col className="help-card-link-title">{link.title}</Col>
            </Link>
          );
        })}
      </Col>
    </>
  );
};

import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Col } from "antd";
import { AiOutlineYoutube } from "@react-icons/all-files/ai/AiOutlineYoutube";
import { trackHomeHelpClicked } from "components/Home/analytics";
import "./helpCard.scss";
import { getLinkWithMetadata } from "modules/analytics/metadata";
import LINKS from "config/constants/sub/links";

export const HelpCard: React.FC = () => {
  const helperLinks = useMemo(
    () => [
      // TODO: Add links to the hrefs
      {
        icon: <img src={"/assets/media/components/info.svg"} alt="info" />,
        title: "What is Requestly?",
        href: getLinkWithMetadata("https://requestly.com/blog/what-is-requestly/"),
      },
      {
        icon: <img src={"/assets/media/components/book.svg"} alt="community" />,
        title: "Read official documentation",
        href: "https://docs.requestly.com/",
      },
      {
        icon: <AiOutlineYoutube className="help-card-react-icon" />,
        title: "See video tutorials",
        href: "https://rqst.ly/http-rules-yt-tutorials",
      },
      {
        icon: <img src={"/assets/media/components/community.svg"} alt="community" />,
        title: "Community",
        href: "https://requestlycommunity.slack.com/ssb/redirect",
      },
      {
        icon: <img src={"/assets/media/components/call.svg"} alt="call" />,
        title: "Schedule a demo",
        href: LINKS.BOOK_A_DEMO,
      },
    ],
    []
  );

  return (
    <>
      <Col className="help-card-title">Quick help</Col>
      <Col>
        {helperLinks.map((link, index) => {
          return (
            <Link
              key={index}
              rel="noopener noreferrer"
              target="_blank"
              to={link.href}
              className="help-card-link"
              onClick={() => trackHomeHelpClicked(link.title)}
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

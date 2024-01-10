import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { Col } from "antd";
import callIcon from "../../assets/call.svg";
import infoIcon from "../../assets/info.svg";
import communityIcon from "../../assets/community.svg";
import bookIcon from "../../assets/book.svg";
import { AiOutlineYoutube } from "@react-icons/all-files/ai/AiOutlineYoutube";
import { trackHomeHelpClicked } from "components/Home/analytics";
import "./helpCard.scss";

export const HelpCard: React.FC = () => {
  const helperLinks = useMemo(
    () => [
      // TODO: Add links to the hrefs
      {
        icon: <img src={infoIcon} alt="info" />,
        title: "What is Requestly?",
        href: "https://requestly.io/blog/what-is-requestly/",
      },
      {
        icon: <img src={bookIcon} alt="community" />,
        title: "Read official documentation",
        href: "https://developers.requestly.io",
      },
      {
        icon: <AiOutlineYoutube className="help-card-react-icon" />,
        title: "See video tutorials",
        href: "https://www.youtube.com/playlist?list=PLmHjVvTu_7ddFIIT9AkZ7p0lrC5gBuyb6",
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

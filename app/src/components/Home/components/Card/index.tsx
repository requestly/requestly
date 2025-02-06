import React from "react";
import { Link } from "react-router-dom";
import { Spin } from "antd";
import { HomepageEmptyCard } from "../EmptyCard";
import { m, AnimatePresence } from "framer-motion";
// @ts-ignore
import { CardType } from "./types";

interface CardProps {
  contentLoading?: boolean;
  wrapperClass?: string;
  emptyCardOptions: any;
  cardType: string;
  title: string;
  cardIcon?: string;
  bodyTitle?: string;
  actionButtons: React.ReactNode;
  contentList?: Array<any>;
  listItemClickHandler?: (listItem: any) => void;
  viewAllCta?: string;
  viewAllCtaLink?: string;
  viewAllCtaOnClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  contentLoading,
  wrapperClass = "",
  emptyCardOptions,
  cardType = "",
  title = "",
  cardIcon = "",
  bodyTitle = "",
  actionButtons,
  contentList,
  listItemClickHandler,
  viewAllCta,
  viewAllCtaLink,
  viewAllCtaOnClick,
}) => {
  const MAX_RULES_TO_SHOW = 5;

  if (contentLoading)
    return (
      <AnimatePresence>
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="homepage-card-loader">
          <Spin tip={`Getting your ${cardType === CardType.API_CLIENT ? "requests" : "rules"} ready...`} size="large" />
        </m.div>
      </AnimatePresence>
    );

  return (
    <AnimatePresence>
      {contentList?.length ? (
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className={`content-container ${wrapperClass}`}>
            <div className="header-content">
              <div className="details">
                <img src={cardIcon} alt={title} />
                <h1>{title}</h1>
              </div>
              <div className="action-buttons">{actionButtons}</div>
            </div>
            <div className="middle-section">
              <h2>{bodyTitle}</h2>
              <div className="list">
                {contentList.slice(0, MAX_RULES_TO_SHOW).map((listItem: any, index: number) => (
                  <div key={index} className="list-item" onClick={() => listItemClickHandler(listItem)}>
                    <div className="list-item-icon">{listItem.icon}</div>
                    <p className="item-title"> {listItem.title}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="footer-section">
              {contentList.length > MAX_RULES_TO_SHOW && (
                <Link className="view-all-cta" to={viewAllCtaLink} onClick={viewAllCtaOnClick}>
                  {viewAllCta}
                </Link>
              )}
            </div>
          </div>
        </m.div>
      ) : (
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <HomepageEmptyCard {...emptyCardOptions} />
        </m.div>
      )}
    </AnimatePresence>
  );
};

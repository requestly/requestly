import React from "react";
import { Link } from "react-router-dom";
import { DropDownProps, Spin } from "antd";
import { HomepageEmptyCard } from "../EmptyCard";
import { m, AnimatePresence } from "framer-motion";
import { CardType } from "./types";
import { Rule } from "@requestly/shared/types/entities/rules";
import { TabsLayout } from "layouts/TabsLayout";

interface CardProps {
  contentLoading?: boolean;
  wrapperClass?: string;
  emptyCardOptions: {
    title: string;
    description: string;
    icon: string;
    features: string[];
    playIcon: { src: string; label: string; url: string };
    primaryAction: React.ReactNode;
    importDropdownOptions: {
      label: string;
      icon: string;
      menu: DropDownProps["menu"]["items"];
    };
  };
  cardType: CardType;
  title: string;
  cardIcon?: string;
  bodyTitle?: string;
  actionButtons: React.ReactNode;
  contentList?: Rule[] | TabsLayout.Tab[];
  listItemClickHandler?: (listItem: Rule | TabsLayout.Tab) => void;
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
  const MAX_LIST_ITEMS_TO_SHOW = 5;

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
                {contentList.slice(0, MAX_LIST_ITEMS_TO_SHOW).map((listItem: any, index: number) => (
                  <div key={index} className="list-item" onClick={() => listItemClickHandler(listItem)}>
                    <div className="list-item-icon">{listItem.icon}</div>
                    <p className="item-title"> {listItem.title}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="footer-section">
              {contentList.length > MAX_LIST_ITEMS_TO_SHOW && (
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

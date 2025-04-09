import React from "react";
import { Link } from "react-router-dom";
import { DropDownProps, Spin } from "antd";
import { HomepageEmptyCard } from "../EmptyCard";
import { m, AnimatePresence } from "framer-motion";
import { CardType } from "./types";
import { Rule } from "@requestly/shared/types/entities/rules";
import { RQDropdown } from "lib/design-system/components";
import { RQButton } from "lib/design-system-v2/components";
import { MdOutlineFileUpload } from "@react-icons/all-files/md/MdOutlineFileUpload";
import { MdOutlineKeyboardArrowDown } from "@react-icons/all-files/md/MdOutlineKeyboardArrowDown";
import { Conditional } from "components/common/Conditional";
import { AbstractTabSource } from "componentsV2/Tabs/helpers/tabSource";

interface CardProps {
  contentLoading?: boolean;
  showFooter?: boolean;
  wrapperClass?: string;
  defaultImportClickHandler: () => void;
  emptyCardOptions: {
    title: string;
    description: string;
    icon: string;
    features: string[];
    playIcon: { src: string; label: string; url: string; onClick: () => void };
    primaryAction: React.ReactNode;
  };
  cardType: CardType;
  title: string;
  cardIcon: string;
  bodyTitle: string;
  actionButtons: React.ReactNode;
  contentList: Rule[] | AbstractTabSource[];
  listItemClickHandler: (listItem: Rule | AbstractTabSource) => void;
  viewAllCta: string;
  viewAllCtaLink: string;
  viewAllCtaOnClick: () => void;
  importOptions: {
    label: string;
    icon: string;
    menu: DropDownProps["menu"]["items"];
  } | null;
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
  importOptions,
  showFooter = false,
  defaultImportClickHandler,
}) => {
  const MAX_LIST_ITEMS_TO_SHOW = showFooter ? 5 : 8;

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

              <div className="action-buttons">
                <Conditional condition={showFooter}>
                  <RQButton type="transparent" className="import-dropdown-trigger" onClick={defaultImportClickHandler}>
                    <MdOutlineFileUpload />
                    Import
                  </RQButton>
                </Conditional>
                {actionButtons}
              </div>
            </div>
            <div className="middle-section">
              <h2>{bodyTitle}</h2>
              <div className="list">
                {contentList
                  .slice(0, MAX_LIST_ITEMS_TO_SHOW)
                  .map((listItem: Rule & { icon: string; title: string } & AbstractTabSource, index: number) => (
                    <div key={index} className="list-item" onClick={() => listItemClickHandler(listItem)}>
                      {listItem?.ruleType ? (
                        <>
                          <div className="list-item-icon">{listItem.icon}</div>
                          <p className="item-title">{listItem.title}</p>
                        </>
                      ) : (
                        <>
                          <div className="list-item-icon">{listItem.icon}</div>
                          <p className="item-title">{listItem.metadata?.title}</p>
                        </>
                      )}
                    </div>
                  ))}
              </div>
            </div>

            <Conditional condition={showFooter}>
              <div className="footer-section">
                <Link className="view-all-cta" to={viewAllCtaLink} onClick={viewAllCtaOnClick}>
                  {viewAllCta}
                </Link>

                {importOptions ? (
                  <div className="import-dropdown">
                    <RQDropdown menu={{ items: importOptions.menu.slice(0, 3) }} trigger={["click"]}>
                      <RQButton className="import-dropdown-button" type="transparent">
                        <img src={importOptions.icon} alt={importOptions.label} />
                        Import from other apps
                        <MdOutlineKeyboardArrowDown />
                      </RQButton>
                    </RQDropdown>
                  </div>
                ) : null}
              </div>
            </Conditional>
          </div>
        </m.div>
      ) : (
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <HomepageEmptyCard {...emptyCardOptions} importDropdownOptions={importOptions} />
        </m.div>
      )}
    </AnimatePresence>
  );
};

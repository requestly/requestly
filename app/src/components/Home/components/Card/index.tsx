import React from "react";
import { Link } from "react-router-dom";
import { Spin } from "antd";
import { HomepageEmptyCard } from "../EmptyCard";
import { m } from "framer-motion";
import { CardListItem, CardType, EmptyCardOptions, ImportOptions } from "./types";
import { RQDropdown } from "lib/design-system/components";
import { RQButton } from "lib/design-system-v2/components";
import { MdOutlineKeyboardArrowDown } from "@react-icons/all-files/md/MdOutlineKeyboardArrowDown";
import { Conditional } from "components/common/Conditional";
import { PRODUCT_FEATURES } from "../EmptyCard/staticData";
import { useHomeScreenContext } from "components/Home/contexts";
import { getCardListItemType } from "./utils";
import { CardIcon } from "../CardIcon";

interface CardProps {
  contentLoading?: boolean;
  showFooter?: boolean;
  wrapperClass?: string;
  emptyCardOptions: EmptyCardOptions;
  cardType: CardType;
  bodyTitle: string;
  actionButtons: React.ReactNode;
  contentList: CardListItem[];
  listItemClickHandler: (listItem: CardListItem) => void;
  viewAllCta?: string;
  viewAllCtaLink?: string;
  viewAllCtaOnClick?: () => void;
  importOptions: ImportOptions;
}

export const Card: React.FC<CardProps> = ({
  contentLoading,
  wrapperClass = "",
  emptyCardOptions,
  cardType,
  bodyTitle = "",
  actionButtons,
  contentList,
  listItemClickHandler,
  viewAllCta = "",
  viewAllCtaLink = "",
  viewAllCtaOnClick = () => {},
  importOptions,
  showFooter = false,
}) => {
  const MAX_LIST_ITEMS_TO_SHOW = showFooter ? 5 : 8;
  const { isAnyRecordExist } = useHomeScreenContext();

  const cardHeader = (
    <div className="header-content">
      <div className="details">
        <div className="icon-container">
          <img src={PRODUCT_FEATURES[cardType].icon} alt={PRODUCT_FEATURES[cardType].title} />
        </div>
        <h1>{PRODUCT_FEATURES[cardType].title}</h1>
      </div>

      <div className="action-buttons">{actionButtons}</div>
    </div>
  );

  const cardFooter = (
    <Conditional condition={showFooter}>
      <div className="footer-section">
        {viewAllCtaLink ? (
          <Link className="view-all-cta" to={viewAllCtaLink} onClick={viewAllCtaOnClick}>
            {viewAllCta}
          </Link>
        ) : null}

        {importOptions ? (
          <div className="import-dropdown">
            <RQDropdown menu={{ items: importOptions.menu.slice(0, 5) }} trigger={["click"]}>
              <RQButton className="import-dropdown-button" type="transparent">
                <CardIcon icon={importOptions.icon} label={importOptions.label} />
                Import
                <MdOutlineKeyboardArrowDown />
              </RQButton>
            </RQDropdown>
          </div>
        ) : null}
      </div>
    </Conditional>
  );

  if (contentLoading)
    return (
      <div className={`content-container ${wrapperClass}`}>
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          // @ts-ignore
          className="homepage-card-loader"
        >
          {cardHeader}
          <div className="middle-section">
            <Spin size="small" tip={`Getting your ${getCardListItemType(cardType)} ready...`} />
          </div>
          {cardFooter}
        </m.div>
      </div>
    );

  const noActivityMessage = (
    <div className="empty-state">
      <img
        src={PRODUCT_FEATURES[cardType].emptyStateDetails.icon}
        alt={PRODUCT_FEATURES[cardType].emptyStateDetails.title}
      />
      <div className="title">{PRODUCT_FEATURES[cardType].emptyStateDetails.title}</div>
      <div className="description">{PRODUCT_FEATURES[cardType].emptyStateDetails.description}</div>
    </div>
  );

  const cardContentList =
    contentList?.length > 0 ? (
      <div className="middle-section">
        <h2>{bodyTitle}</h2>
        <div className="list">
          {contentList.slice(0, MAX_LIST_ITEMS_TO_SHOW).map((listItem, index: number) => (
            <div key={index} className="list-item" onClick={() => listItemClickHandler(listItem)}>
              <div className="list-item-icon">{listItem.icon}</div>
              <p className="item-title">{listItem.title}</p>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="middle-section">{noActivityMessage}</div>
    );

  return (
    <>
      {isAnyRecordExist ? (
        <div className={`content-container ${wrapperClass}`}>
          {cardHeader}
          {cardContentList}
          {cardFooter}
        </div>
      ) : (
        <m.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <HomepageEmptyCard
            {...emptyCardOptions}
            icon={PRODUCT_FEATURES[cardType].icon}
            title={PRODUCT_FEATURES[cardType].title}
            importDropdownOptions={importOptions}
          />
        </m.div>
      )}
    </>
  );
};

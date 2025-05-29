import React, { ReactNode } from "react";
import { MdOutlineKeyboardArrowDown } from "@react-icons/all-files/md/MdOutlineKeyboardArrowDown";
import { RQDropdown } from "lib/design-system/components";
import { DropDownProps } from "antd";
import { RQBadge } from "lib/design-system/components/RQBadge";
import { PRODUCT_FEATURES } from "./staticData";
import "./EmptyCard.scss";
import { RQButton } from "lib/design-system-v2/components";

interface Props {
  icon: string;
  title: string;
  features: string[];
  description?: string;
  primaryAction?: ReactNode;
  playIcon: { src: string; label: string; url: string; onClick: () => void };
  importDropdownOptions: null | {
    label: string;
    icon: string | ReactNode;
    menu: DropDownProps["menu"]["items"];
  };
}

export const HomepageEmptyCard: React.FC<Props> = ({
  icon,
  title,
  features,
  primaryAction,
  playIcon,
  importDropdownOptions = null,
}) => {
  return (
    <>
      <div className="homepage-emptycard">
        <div className="header-section">
          <div className="details">
            <div className="icon-container">
              <img src={icon} alt={title} />
            </div>

            <div className="title-badge-container">
              <h1 className="homepage-emptycard-title">{title}</h1>
              {title === PRODUCT_FEATURES.API_CLIENT.title && <RQBadge badgeText="BETA" />}
            </div>
          </div>

          <div className="action-buttons">{primaryAction}</div>
        </div>
        <ul className="features">
          {features.map((feature) => (
            <li>{feature}</li>
          ))}
        </ul>
        <a className="play-icon" href={playIcon.url} target="__blank" onClick={playIcon.onClick}>
          <img src={playIcon.src} alt="Play" />
          <p>{playIcon.label}</p>
        </a>
      </div>

      {importDropdownOptions ? (
        <div className="import-dropdown">
          <RQDropdown menu={{ items: importDropdownOptions.menu }} trigger={["click"]}>
            <RQButton type="transparent">
              {typeof importDropdownOptions.icon === "string" ? (
                <img src={importDropdownOptions.icon} alt={importDropdownOptions.label} />
              ) : (
                importDropdownOptions.icon
              )}
              {importDropdownOptions.label}
              <MdOutlineKeyboardArrowDown />
            </RQButton>
          </RQDropdown>
        </div>
      ) : null}
    </>
  );
};

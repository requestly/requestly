import React, { ReactNode } from "react";
import { MdOutlineKeyboardArrowDown } from "@react-icons/all-files/md/MdOutlineKeyboardArrowDown";
import { RQButton, RQDropdown } from "lib/design-system/components";
import { DropDownProps } from "antd";
import { RQBadge } from "lib/design-system/components/RQBadge";
import "./EmptyCard.scss";

interface Props {
  icon: string | ReactNode;
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
          {typeof icon === "string" ? (
            <img src={icon} alt="icon" className="homepage-emptycard-icon-img" />
          ) : (
            <div className="homepage-emptycard-icon">{icon}</div>
          )}
          <div className="header-content">
            <div className="title-badge-container">
              <h1 className="homepage-emptycard-title">{title}</h1>
              {title === "API client" && <RQBadge badgeText="BETA" />}
            </div>
          </div>
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
      <div className="action-section">{primaryAction}</div>

      {importDropdownOptions ? (
        <div className="import-dropdown">
          <span className="import-dropdown-label">Import from</span>
          <RQDropdown menu={{ items: importDropdownOptions.menu }} trigger={["click"]}>
            <RQButton>
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

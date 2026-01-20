import React from "react";
import { MdOutlineKeyboardArrowDown } from "@react-icons/all-files/md/MdOutlineKeyboardArrowDown";
import { RQDropdown } from "lib/design-system/components";
import { RQButton } from "lib/design-system-v2/components";
import { EmptyCardOptions, ImportOptions } from "../Card/types";
import { CardIcon } from "../CardIcon";
import "./EmptyCard.scss";

interface Props extends EmptyCardOptions {
  importDropdownOptions: ImportOptions;
}

export const HomepageEmptyCard: React.FC<Props> = ({
  icon,
  title,
  features,
  primaryAction,
  playDetails,
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
            </div>
          </div>

          <div className="action-buttons">{primaryAction}</div>
        </div>
        <ul className="features">
          {features.map((feature, index) => (
            <li key={index}>{feature}</li>
          ))}
        </ul>
        <a className="play-icon" href={playDetails.url} target="__blank" onClick={playDetails.onClick}>
          {playDetails.icon}
          <p>{playDetails.label}</p>
        </a>
      </div>

      {importDropdownOptions ? (
        <div className="import-dropdown">
          <RQDropdown menu={{ items: importDropdownOptions.menu }} trigger={["click"]}>
            <RQButton type="transparent">
              <CardIcon icon={importDropdownOptions.icon} label={importDropdownOptions.label} />
              {importDropdownOptions.label}
              <MdOutlineKeyboardArrowDown />
            </RQButton>
          </RQDropdown>
        </div>
      ) : null}
    </>
  );
};

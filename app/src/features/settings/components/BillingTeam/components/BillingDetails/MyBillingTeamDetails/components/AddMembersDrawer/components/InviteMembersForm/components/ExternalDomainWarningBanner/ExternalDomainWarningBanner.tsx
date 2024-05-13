import React from "react";
import { MdOutlineWarningAmber } from "@react-icons/all-files/md/MdOutlineWarningAmber";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import "./externalDomainWarningBanner.scss";

interface ExternalDomainWarningBannerProps {
  emails: string[];
  onBannerClose: () => void;
}

export const ExternalDomainWarningBanner: React.FC<ExternalDomainWarningBannerProps> = ({ emails, onBannerClose }) => {
  return (
    <div className="external-domain-warning-banner">
      <MdOutlineWarningAmber className="external-domain-warning-banner-icon" />
      <span className="external-domain-warning-banner-text">
        Be cautious:{" "}
        {emails?.map((email, index) => {
          return (
            <span key={index}>
              <strong>"{email}"</strong>
              {index === emails.length - 1 ? "" : ", "}
            </span>
          );
        })}{" "}
        {emails.length === 1 ? "is" : "are"} outside your organization. Please double-check before adding them to your
        team.
      </span>
      <IoMdClose
        className="external-domain-warning-banner-icon external-domain-warning-banner-close-icon"
        onClick={onBannerClose}
      />
    </div>
  );
};

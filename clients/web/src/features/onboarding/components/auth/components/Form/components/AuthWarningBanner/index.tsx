import React from "react";
import { MdOutlineWarningAmber } from "@react-icons/all-files/md/MdOutlineWarningAmber";
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import "./index.css";

interface BannerProps {
  warningMessage: string;
  onBannerClose: () => void;
}

export const AuthWarningBanner: React.FC<BannerProps> = ({ warningMessage, onBannerClose }) => {
  return (
    <div className="auth-warning-banner">
      <MdOutlineWarningAmber /> <span className="auth-warning-banner-text">{warningMessage}</span>{" "}
      <IoMdClose className="cursor-pointer" onClick={onBannerClose} />
    </div>
  );
};

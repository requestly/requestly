import React from "react";

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  icon: string | React.ReactNode;
  label: string;
}

export const CardIcon: React.FC<Props> = ({ icon, label, ...props }) => {
  return typeof icon === "string" ? <img src={icon} alt={label} {...props} /> : icon;
};

import React, { ReactNode } from "react";
import { Col } from "antd";

interface Props {
  children: ReactNode;
}
/* Secondary sidebar can have dynamic or static list for different route 
    Each routes component will have its own secondary sidebar
*/

export const SettingsSecondarySidebar: React.FC<Props> = ({ children }) => {
  return <Col className="settings-secondary-sidebar">{children}</Col>;
};

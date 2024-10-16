import React from "react";
import { Typography } from "antd";
import PATHS from "config/constants/sub/paths";
import { REQUEST_METHOD_COLORS } from "../../../../../../../../constants";
import { RQAPI } from "features/apiClient/types";
import { NavLink } from "react-router-dom";
import "./requestRow.scss";

interface Props {
  record: RQAPI.ApiRecord;
}

export const RequestRow: React.FC<Props> = ({ record }) => {
  return (
    <NavLink
      to={`${PATHS.API_CLIENT.ABSOLUTE}/request/${record.id}`}
      className={({ isActive }) => `collections-list-item api  ${isActive ? "active" : ""}`}
    >
      <Typography.Text
        strong
        className="request-method"
        style={{ color: REQUEST_METHOD_COLORS[record.data.request.method] }}
      >
        {record.data.request.method}
      </Typography.Text>
      <div className="request-url">{record.name || "echo"}</div>
    </NavLink>
  );
};

import React from "react";
import APIClientView from "./APIClientView";
import "./apis.scss";

interface Props {}

const APIsView: React.FC<Props> = () => {
  return (
    <div className="apis-view">
      <APIClientView />
    </div>
  );
};

export default APIsView;

import React from "react";
import FEATURES from "config/constants/sub/features";
import "./index.css";

interface TagProps {
  feature: string;
}

const featureMap = {
  [FEATURES.API_CLIENT]: {
    color: "var(--api-client)",
    backgroundColor: "#251420",
    border: "#4b2239",
    title: "API Client",
  },
  [FEATURES.RULES]: {
    color: "var(--http-rules)",
    backgroundColor: "#141A2B",
    border: "#1F3158",
    title: "HTTP Rules",
  },
  [FEATURES.MOCK_V2]: {
    color: "var(--mock-server)",
    backgroundColor: "#1A2314",
    border: "#2E441C",
    title: "Mock Server",
  },
  [FEATURES.SESSION_RECORDING]: {
    color: "var(--session-recording)",
    backgroundColor: "#292213",
    border: "#4F401B",
    title: "Sessions",
  },
};

export const FeatureTag: React.FC<TagProps> = ({ feature }) => {
  return (
    <div
      className="feature-tag"
      style={{
        color: featureMap[feature].color,
        background: featureMap[feature].backgroundColor,
        borderColor: featureMap[feature].border,
      }}
    >
      {featureMap[feature].title}
    </div>
  );
};

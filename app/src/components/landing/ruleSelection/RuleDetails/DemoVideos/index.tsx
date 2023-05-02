import React, { useMemo } from "react";
import { Row } from "antd";
import DemoVideoCard from "./DemoVideoCard";
import { RuleType } from "types/rules";
import { getRuleDetails } from "../../utils";
import { RuleDemoVideo } from "../../types";
import "./demoVideos.css";

interface DemoVideosProps {
  selectedRuleType: RuleType;
}

const DemoVideos: React.FC<DemoVideosProps> = ({ selectedRuleType }) => {
  const { name, image, demoVideos } = useMemo(() => getRuleDetails(selectedRuleType), [selectedRuleType]);

  return (
    <div className="demo-videos-container">
      {demoVideos?.length > 0 ? (
        <>
          <div className="title text-bold demo-videos-title">Demo Video</div>
          <Row gutter={[20, 8]} align="middle">
            {demoVideos.map((demoVideo: RuleDemoVideo, index: number) => (
              <DemoVideoCard key={index} demoVideo={demoVideo} ruleType={selectedRuleType} />
            ))}
          </Row>
        </>
      ) : image ? (
        <a target="_blank" href={image.link} rel="noreferrer">
          <img
            width="520"
            height="320"
            alt={name}
            src={image.src}
            //@ts-ignore
            fetchpriority="high"
            className="demo-video-fallback-image"
          />
        </a>
      ) : null}
    </div>
  );
};

export default DemoVideos;

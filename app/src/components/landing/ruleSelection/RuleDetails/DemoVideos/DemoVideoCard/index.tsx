import React from "react";
import { Col, Row } from "antd";
import { RuleDemoVideo } from "../../../types";
import { YouTubePlayer } from "components/misc/YoutubeIframe";
import { trackRuleDemoVideoClicked } from "modules/analytics/events/common/rules";
import "./demoVideoCard.css";

interface DemoVideoCardProps {
  demoVideo: RuleDemoVideo;
  ruleType: string;
}

const DemoVideoCard: React.FC<DemoVideoCardProps> = ({
  demoVideo,
  ruleType,
}) => {
  const onVideoPlay = () => {
    trackRuleDemoVideoClicked(ruleType, "rule_selection_page");
  };
  return (
    <Col className="demo-video-card" span={24}>
      <Row>
        <Col className="demo-video">
          <YouTubePlayer
            src={demoVideo.src}
            width="520"
            height="320"
            handleOnPlay={onVideoPlay}
          />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <div className="line-clamp-2">{demoVideo.title}</div>
        </Col>
      </Row>
    </Col>
  );
};

export default DemoVideoCard;

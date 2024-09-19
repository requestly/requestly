import React, { useRef, useState } from "react";
import { HiArrowLongRight } from "@react-icons/all-files/hi2/HiArrowLongRight";
import { FiArrowUpRight } from "@react-icons/all-files/fi/FiArrowUpRight";
import { AiOutlinePlus } from "@react-icons/all-files/ai/AiOutlinePlus";
import networkInspectorVideo from "./assets/network-inspector-devtools.mp4";
import NetworkInspectorIcon from "./assets/network-inspector.svg?react";
import RQLogo from "assets/img/brand/rq_logo.svg?react";
import LINKS from "config/constants/sub/links";
import "./NetworkInspectorHomeScreen.scss";

export const NetworkInspectorHomeScreen: React.FC = () => {
  const [showDevtoolsShortcut, setShowDevtoolsShortcut] = useState(false);
  const devtoolsShortcutDisplayTimerRef = useRef<NodeJS.Timeout>();
  const hotkey = navigator.userAgent.includes("Macintosh") ? ["⌘", "Option", "J"] : ["Ctrl", "Shift", "J"];

  const renderHotKey = (
    <div className="shortcut-keys">
      {hotkey.map((key, index) => {
        return (
          <>
            <span className="key">{key}</span>
            {index === hotkey.length - 1 ? null : <AiOutlinePlus className="plus-icon" />}
          </>
        );
      })}
    </div>
  );

  const handlePlaying: React.ReactEventHandler<HTMLVideoElement> = (event) => {
    const currentTime = (event.target as HTMLVideoElement).currentTime;

    if (parseInt(`${currentTime}`) === 0) {
      setShowDevtoolsShortcut(true);

      if (devtoolsShortcutDisplayTimerRef.current) {
        clearTimeout(devtoolsShortcutDisplayTimerRef.current);
      }

      devtoolsShortcutDisplayTimerRef.current = setTimeout(() => {
        setShowDevtoolsShortcut(false);
      }, 2 * 1000);
    }
  };

  return (
    <div className="network-inspector-home-container">
      <div className="network-inspector-content">
        <div className="header-container">
          <NetworkInspectorIcon className="network-inspector-icon" />

          <div className="heading">Use our Next-Gen Network inspector</div>

          <div className="description">
            👉 Open the Requestly tab in your browser's devtools panel to capture & inspect requests.
          </div>

          <a target="_blank" rel="noreferrer" className="learn-more-link" href={LINKS.REQUESTLY_NETWORK_INSPECTOR_DOCS}>
            <FiArrowUpRight /> Learn more
          </a>

          <div className="shortcut-keys-container">
            {renderHotKey}
            <HiArrowLongRight className="right-arrow" />
            <RQLogo className="rq-logo" />
          </div>
        </div>

        <div className="video-container">
          <div className="network-inspector-video">
            {showDevtoolsShortcut ? <div className="devtools-shortcut">Open devtools panel {renderHotKey}</div> : null}

            <video
              loop
              muted
              autoPlay
              width={680}
              height={420}
              controls={false}
              onPlaying={handlePlaying}
              className="network-inspector-video-player"
            >
              <source src={networkInspectorVideo} type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { MdOutlineArrowRightAlt } from "@react-icons/all-files/md/MdOutlineArrowRightAlt";
import { FiArrowUpRight } from "@react-icons/all-files/fi/FiArrowUpRight";
import networkInspectorGif from "./network-inspector.gif";
import LINKS from "config/constants/sub/links";
import "./NetworkInspectorHomeScreen.scss";

export const NetworkInspectorHomeScreen: React.FC = () => {
  const hotkey = navigator.userAgent.includes("Macintosh") ? "Cmd + Option + J" : "Ctrl + Shift + J";

  return (
    <main className="network-inspector-home-container">
      <div className="heading">Next-Gen Network Inspector</div>

      <div className="content">
        <div className="shortcut-container">
          <span>{hotkey}</span> <MdOutlineArrowRightAlt /> <span>Requestly</span> <MdOutlineArrowRightAlt />
          <span>Network Traffic</span>
        </div>

        <img
          width={600}
          height={300}
          src={networkInspectorGif}
          alt="Network inspector demo gif"
          className="network-inspector-gif"
        />

        <div className="helper-container">
          <a target="_blank" rel="noreferrer" className="helper-item" href={LINKS.REQUESTLY_NETWORK_INSPECTOR_DOCS}>
            <FiArrowUpRight /> Browse docs
          </a>
          <a
            target="_blank"
            rel="noreferrer"
            className="helper-item"
            href="https://www.youtube.com/watch?v=VG_r4PBvQKI"
          >
            <FiArrowUpRight /> See demo
          </a>
        </div>
      </div>
    </main>
  );
};

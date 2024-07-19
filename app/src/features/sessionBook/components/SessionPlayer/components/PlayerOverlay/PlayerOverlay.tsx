import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { PlayerState } from "../../../../types";

const OverlayContent: React.FC<{ playerState: PlayerState }> = ({ playerState }) => {
  const getOverlayContent = useMemo(() => {
    switch (playerState) {
      case PlayerState.SKIPPING:
        return <div className="overlay-content">Skipping Inactivity</div>;
      case PlayerState.PAUSED:
      case PlayerState.PLAYING:
      default:
        return null;
    }
  }, [playerState]);

  if (!getOverlayContent) return null;

  return (
    <>
      <div className="blur"></div>
      {getOverlayContent}
    </>
  );
};

const PlayerFrameOverlay: React.FC<{ playerContainer: HTMLDivElement; playerState: PlayerState }> = ({
  playerContainer,
  playerState,
}) => {
  const [overlayContainer, setOverlayContainer] = useState<Element>(null);

  useEffect(() => {
    if (playerContainer && !playerContainer.querySelector(".overlay-frame")) {
      const overlayFrame = document.createElement("div");
      overlayFrame.className = "overlay-frame";
      const rr_player = playerContainer.querySelector(".replayer-wrapper");
      setOverlayContainer(rr_player?.insertAdjacentElement("afterbegin", overlayFrame));
    }
  }, [playerContainer]);

  return overlayContainer ? createPortal(<OverlayContent playerState={playerState} />, overlayContainer) : null;
};

export default PlayerFrameOverlay;

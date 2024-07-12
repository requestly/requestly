import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { getSessionRecordingEvents } from "store/features/session-recording/selectors";
import { RQSessionEventType, RRWebEventData } from "@requestly/web-sdk";
import Replayer from "rrweb-player";
import { cloneDeep } from "lodash";
import { MdOutlinePlayCircle } from "@react-icons/all-files/md/MdOutlinePlayCircle";
import { RiReplay10Fill } from "@react-icons/all-files/ri/RiReplay10Fill";
import { RiForward10Fill } from "@react-icons/all-files/ri/RiForward10Fill";
import { MdFullscreen } from "@react-icons/all-files/md/MdFullscreen";
import { RQButton } from "lib/design-system/components";
import "./sessionPlayer.scss";
import { Select, Switch } from "antd";

export const SessionPlayer = () => {
  const events = useSelector(getSessionRecordingEvents);
  const [player, setPlayer] = useState(null);
  const playerContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (events?.rrweb?.length && !player) {
      // rrweb mutates events object whereas redux does not allow mutating state, so cloning.
      const rrwebEvents = cloneDeep(events[RQSessionEventType.RRWEB] as RRWebEventData[]);

      setPlayer(
        new Replayer({
          target: playerContainer.current,
          props: {
            events: rrwebEvents,
            // width: playerContainer.current.clientWidth,
            autoPlay: true,
            // prevents elements inside rrweb-player to steal focus
            // The elements inside the player were stealing the focus from the inputs in the session viewer pages
            // The drawback is that it doesn't allow the focus styles to be applied: https://github.com/rrweb-io/rrweb/issues/876
            triggerFocus: false,
            inactiveColor: "#B4B4B4",
          },
        })
      );
    }
  }, [events, player]);

  return (
    <div className="session-player-container">
      <div ref={playerContainer} className="session-player"></div>
      <div className="session-player-controller">
        <div className="session-status-container">
          <RQButton
            className="session-player-controller__btn session-pause-play-btn"
            iconOnly
            icon={<MdOutlinePlayCircle />}
          />
          <div className="session-player-duration-tracker">00:2/ 00:49</div>
        </div>
        <div className="session-player-jump-controllers">
          <RQButton className="session-player-controller__btn" iconOnly icon={<RiReplay10Fill />} />
          <RQButton className="session-player-controller__btn " iconOnly icon={<RiForward10Fill />} />
        </div>
        <div>
          <Select
            className="session-player-controller__speed-selector"
            defaultValue={1}
            style={{ width: 60 }}
            options={[
              { value: 1, label: "1x" },
              { value: 2, label: "2x" },
              { value: 4, label: "4x" },
              { value: 8, label: "8x" },
            ]}
          />
        </div>
        <div className="session-player-skip-controller">
          <Switch size="small" /> <span>Skip inactive</span>
        </div>
        <div className="flex-1 session-player-fullscreen-controller-container">
          <RQButton className="session-player-controller__btn " iconOnly icon={<MdFullscreen />} />
        </div>
      </div>
    </div>
  );
};

import { RQButton } from "lib/design-system-v2/components";
import "./chatHeader.scss";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { MdOutlineHistory } from "@react-icons/all-files/md/MdOutlineHistory";
import { MdClose } from "@react-icons/all-files/md/MdClose";

export const ChatHeader = () => {
  return (
    <div className="chat-header-container">
      <div className="chat-header-title">
        <img src="/assets/media/apiClient/rq_ai_sparkles.svg" alt="RQ AI Sparkles" />
        <span>Requestly AI</span>
      </div>
      <div className="chat-header-actions">
        <RQButton icon={<MdAdd />} size="small" type="transparent" />
        <RQButton icon={<MdOutlineHistory />} size="small" type="transparent" />
        <RQButton icon={<MdClose />} size="small" type="transparent" />
      </div>
    </div>
  );
};

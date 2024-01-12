import { Button, Divider } from "antd";
import { CopyValue } from "components/misc/CopyValue";
import "./index.scss";

export const LiveLocalSessionCard = ({ session }) => {
  return (
    <div className="live-local-session-card">
      <div className="port-wrapper">
        <div className="text-white text-bold">PORT:</div>
        <div className="live-local-session-card-port">{session.port}</div>
      </div>
      <Divider type="vertical" />
      <div className="live-local-session-details">
        <CopyValue value={session.url} />
        <Button type="default" size="small" className="mt-8">
          View logs
        </Button>
      </div>
    </div>
  );
};

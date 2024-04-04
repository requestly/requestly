import { Col } from "antd";
import EmptyFolder from "../../assets/empty-folder.svg";
import "./index.scss";

export const EmptyTestResultScreen = () => {
  return (
    <Col className="empty-test-result-container">
      <img src={EmptyFolder} alt="Empty folder" />
      <Col className="mt-16">
        <div className="text-center text-bold">Nothing to see here!</div>
        <div className="mt-8 text-center">Please run a test first to view the results.</div>
      </Col>
    </Col>
  );
};

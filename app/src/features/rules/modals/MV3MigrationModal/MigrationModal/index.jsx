import ChangeLog from "./ChangeLog";
import MigratedRules from "./MigratedRulesLog";

import { Modal, Typography } from "antd";

import BannerImage from "./modalImage.svg";
import { RxExternalLink } from "@react-icons/all-files/rx/RxExternalLink";

import "./modal.scss";

const Header = () => {
  return (
    <div className="modal-header">
      <img src={BannerImage} alt="Requestly Logo" className="banner-img" />
      <div className="header">
        <Typography.Text className="title">
          Better privacy, security, and performance with Requestly MV3 Extension updates.
        </Typography.Text>
        <a href="todo.com" className="external-link">
          Read more about it <RxExternalLink />
        </a>
      </div>
    </div>
  );
};

const InfoSection = () => {
  return (
    <div className="section description">
      <Typography.Text className="title">What is MV3</Typography.Text>
      <div className="text">
        Chrome has introduced Manifest V3 guidelines to enhance the security and performance of browser extensions. The
        new Requestly Extension, built on Manifest V3, provides users with the features they previously enjoyed, while
        also offering improved security and performance.
      </div>
    </div>
  );
};

export const MV3MigrationModal = (props) => {
  const { toggleModal, isOpen } = props;

  return (
    <Modal
      open={isOpen}
      onCancel={(e) => {
        e.preventDefault();
        toggleModal();
      }}
      footer={null}
      className="modal-container"
      closable={true}
      destroyOnClose
    >
      <Header />
      <InfoSection />
      <MigratedRules />
      <ChangeLog />
    </Modal>
  );
};

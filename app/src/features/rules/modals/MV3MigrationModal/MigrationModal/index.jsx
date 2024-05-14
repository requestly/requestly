import React, { useEffect, useState } from "react";
import ChangeLog from "./ChangeLog";
import MigratedRules from "./MigratedRulesLog";

import { Modal, Typography } from "antd";

import BannerImage from "./modalImage.svg";
import { RxExternalLink } from "@react-icons/all-files/rx/RxExternalLink";

import "./modal.scss";
import { useRulesModalsContext } from "features/rules/context/modals";

const Header = () => {
  return (
    <div className="modal-header">
      <img src={BannerImage} alt="Requestly Logo" className="banner-img" />
      <div className="header">
        <Typography.Text className="title">
          Better privacy, security, and performance with Requestly MV3 Extension updates.
        </Typography.Text>
        {/* @TODO: Add link to the post */}
        <a href="todo.com" className="external-link icon__wrapper">
          Read more about it &nbsp;
          <RxExternalLink />
        </a>
      </div>
    </div>
  );
};

const InfoSection = () => {
  return (
    <div className="section description">
      <div className="mb-12">
        <Typography.Text className="title">What is MV3</Typography.Text>
      </div>
      <div className="text">
        Chrome has introduced Manifest V3 guidelines to enhance the security and performance of browser extensions. The
        new Requestly Extension, built on Manifest V3, provides users with the features they previously enjoyed, while
        also offering improved security and performance.
      </div>
    </div>
  );
};

export const MV3MigrationModal = () => {
  const { setOpenMigrationModalAction } = useRulesModalsContext();

  const [isModalActive, setIsModalActive] = useState(false);

  useEffect(() => {
    setOpenMigrationModalAction(() => () => setIsModalActive(true));
  }, [setOpenMigrationModalAction]);

  return (
    <Modal
      open={isModalActive}
      onCancel={(e) => {
        e.preventDefault();
        setIsModalActive(false);
      }}
      footer={null}
      className="mv3-modal-container"
      closable={true}
      destroyOnClose
      centered
    >
      <Header />
      <div className="modal-content">
        <InfoSection />
        <MigratedRules />
        <ChangeLog />
      </div>
    </Modal>
  );
};

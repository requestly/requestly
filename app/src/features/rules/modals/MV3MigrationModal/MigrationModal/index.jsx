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
        <Typography.Text className="title">Rules upgraded to support upcoming MV3 extension</Typography.Text>
        <a
          href="https://github.com/requestly/requestly/issues/1690"
          className="external-link icon__wrapper"
          target="_blank"
          rel="noreferrer"
        >
          Read about the release here &nbsp;
          <RxExternalLink />
        </a>
      </div>
    </div>
  );
};

const InfoSection = () => {
  return (
    <div className="section description">
      {/* <div className="mb-12">
        <Typography.Text className="title">What is MV3</Typography.Text>
      </div> */}
      <div className="text">
        To support our upcoming MV3 extension release, we've migrated some of your rules to the new schema. All your
        rules should work as expected, but some rules need to be verified before use as there might be some changes.
        Please review the impacted rules listed below.
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
        {/* <ChangeLog /> */}
      </div>
    </Modal>
  );
};

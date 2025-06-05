import React, { useEffect, useState } from "react";
// import ChangeLog from "./ChangeLog";
import MigratedRules from "./MigratedRulesLog";

import { Modal, Typography } from "antd";

import { RxExternalLink } from "@react-icons/all-files/rx/RxExternalLink";

import "./modal.scss";
import { useRulesModalsContext } from "features/rules/context/modals";
import { CiMail } from "@react-icons/all-files/ci/CiMail";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import LINKS from "config/constants/sub/links";

const Header = () => {
  return (
    <div className="modal-header">
      <img src={"/assets/media/rules/modalImage.svg"} alt="Requestly Logo" className="banner-img" width={150} />
      <div className="header">
        <Typography.Text className="title">Important Changes to your HTTP Rules data</Typography.Text>
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
        To support our upcoming MV3 extension release, we've migrated some of your rules to the new schema.{" "}
        <b>All your rules should work as expected</b>, but some rules need to be verified before use as there might be
        some changes. Please review the impacted rules listed below.
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
      <div className="migration-modal-footer">
        <Typography.Text className="text-with-images">
          Contact us if you have any questions or need assistance.
          <a
            href={`mailto:${GLOBAL_CONSTANTS.COMPANY_INFO.SUPPORT_EMAIL}`}
            className="blue-text"
            target="_blank"
            rel="noreferrer"
          >
            <CiMail /> Contact Us
          </a>
        </Typography.Text>
        <Typography.Text className="text-with-images">
          To report Issues related to MV3, please open an issue here{" "}
          <a href={`${LINKS.REQUESTLY_GITHUB_ISSUES}`} className="red-text" target="_blank" rel="noreferrer">
            Report Issue <RxExternalLink />
          </a>
        </Typography.Text>
      </div>
    </Modal>
  );
};

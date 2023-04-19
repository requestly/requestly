import { Modal } from "antd";
import React, { useEffect } from "react";
import astronautAnimation from "assets/lottie/astronaut.json";
import { LoadingOutlined } from "@ant-design/icons";
import lottie from "lottie-web/build/player/lottie_light";
import Logger from "lib/logger";

const LoadingModal = ({ isModalOpen, closeModal }) => {
  useEffect(() => {
    try {
      lottie.destroy("LoadingModal-astronautAnimation");
    } catch (_e) {
      Logger.log("Loading astronautAnimation");
    }
    lottie.loadAnimation({
      name: "LoadingModal-astronautAnimation",
      container: document.querySelector("#LoadingModal-astronautAnimation"),
      animationData: astronautAnimation,
      renderer: "svg", // "canvas", "html"
      loop: true, // boolean
      autoplay: true, // boolean
    });
  }, []);

  return (
    <Modal title={null} open={isModalOpen} onCancel={closeModal} footer={null} closeIcon={<></>} destroyOnClose={true}>
      <center>
        <div id="LoadingModal-astronautAnimation" style={{ height: 300, width: 300 }} />
        <span>
          <LoadingOutlined spin className="mr-2" /> Switching workspace
        </span>
      </center>
    </Modal>
  );
};

export default LoadingModal;

import React from "react";

// const imageWidthNormalized = window.innerWidth < 768 ? 360 : 720;

const ImageViewer = ({ src }) => (
  <div className="d-flex justify-content-center p-3">
    <img
      style={{
        maxWidth: "15vw",
        width: "100%",
        //  width: imageWidthNormalized
      }}
      src={src}
      alt=""
    />
  </div>
);

export default ImageViewer;
